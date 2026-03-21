import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, View, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { supabase } from './src/services/supabase';
import { colors } from './src/theme/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error('ErrorBoundary caught:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      const { Text, ScrollView, Button, View } = require('react-native');
      return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#f8d7da', marginTop: 50 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#721c24' }}>App Crashed!</Text>
          <Text style={{ color: '#721c24', marginTop: 10, fontWeight: '600' }}>{this.state.error?.toString()}</Text>
          <Text style={{ color: '#721c24', fontSize: 10, marginTop: 10 }}>{this.state.errorInfo?.componentStack}</Text>
          <View style={{ marginTop: 20 }}>
            <Button title="Reload App" onPress={() => { if(Platform.OS === 'web') window.location.href = '/'; else this.setState({hasError: false}); }} />
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [sessionState, setSessionState] = useState(null);

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes (logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSessionState('Welcome-' + Date.now());
      } else if (event === 'SIGNED_IN') {
        setSessionState('MainTabs-' + Date.now());
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionState(session ? 'MainTabs-init' : 'Welcome-init');
    } catch (e) {
      setSessionState('Welcome-error');
    }
  };

  if (!sessionState) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const routeName = sessionState.split('-')[0];

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AppNavigator key={sessionState} initialRoute={routeName} />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
