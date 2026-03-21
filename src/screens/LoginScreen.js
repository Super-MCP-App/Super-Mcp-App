import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { signIn } from '../services/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Super Mcp account</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            secureTextEntry={secureText}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon={secureText ? 'eye-off' : 'eye'} onPress={() => setSecureText(!secureText)} />}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
            labelStyle={styles.loginLabel}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Register')}
            labelStyle={styles.linkLabel}
          >
            Don't have an account? Register
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: colors.onPrimary, fontSize: 28, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderRadius: 12 },
  loginButton: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4, marginTop: 8 },
  loginLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  buttonContent: { height: 52 },
  linkLabel: { color: colors.primary, fontSize: 13 },
});
