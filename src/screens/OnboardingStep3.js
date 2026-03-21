import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabase';

const apps = [
  { id: 'figma', name: 'Figma', icon: 'palette-outline', desc: 'Read design files & layers' },
  { id: 'canva', name: 'Canva', icon: 'image-outline', desc: 'Generate & export visuals' },
  { id: 'kite', name: 'Kite', icon: 'chart-line', desc: 'Secure financial data access' },
];

export default function OnboardingStep3({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState({});

  const toggleApp = async (providerId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isConnected = connections[providerId];
      if (isConnected) {
        // Disconnect
        await supabase.from('connected_apps').delete().eq('user_id', user.id).eq('provider', providerId);
        setConnections(prev => ({ ...prev, [providerId]: false }));
      } else {
        // Connect (Mock auth token for now)
        await supabase.from('connected_apps').upsert({
          user_id: user.id,
          provider: providerId,
          status: 'connected',
          access_token: `mock_token_${Date.now()}`
        }, { onConflict: 'user_id, provider' });
        setConnections(prev => ({ ...prev, [providerId]: true }));
      }
    } catch (error) {
      Alert.alert('Connection failed', error.message);
    }
  };

  const finalizeOnboarding = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ is_onboarded: true })
        .eq('id', user.id);

      if (error) throw error;
      
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.step}>Step 3 of 3</Text>
        <Text style={styles.title}>Connect MCP Tools</Text>
        <Text style={styles.subtitle}>Supercharge your AI by granting it isolated, secure access to your external tools. You can change this later.</Text>

        <View style={styles.appsList}>
          {apps.map((app) => {
            const isConnected = connections[app.id];
            return (
              <View key={app.id} style={[styles.appCard, isConnected && styles.appCardActive]}>
                <View style={[styles.iconCircle, isConnected && styles.iconCircleActive]}>
                  <MaterialCommunityIcons name={app.icon} size={24} color={isConnected ? '#fff' : colors.primary} />
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appDesc}>{app.desc}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.connectBtn, isConnected && styles.disconnectBtn]} 
                  onPress={() => toggleApp(app.id)}
                >
                  <Text style={[styles.connectBtnText, isConnected && styles.disconnectBtnText]}>
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomActions}>
          <Button
            mode="contained"
            onPress={finalizeOnboarding}
            loading={loading}
            disabled={loading}
            style={styles.continueButton}
            labelStyle={styles.continueLabel}
            contentStyle={styles.buttonContent}
          >
            Finish Setup
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, paddingTop: 64 },
  progressBar: { height: 4, backgroundColor: colors.surfaceContainer, borderRadius: 2, overflow: 'hidden', marginBottom: 32 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  scrollContent: { paddingBottom: 40 },
  step: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5, marginTop: 4 },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 12, lineHeight: 22 },
  appsList: { marginTop: 32, gap: 16 },
  appCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant + '30', elevation: 1 },
  appCardActive: { borderColor: colors.primary + '50', backgroundColor: colors.primaryContainer + '30' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryContainer, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconCircleActive: { backgroundColor: colors.primary },
  appInfo: { flex: 1 },
  appName: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  appDesc: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 },
  connectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.primaryContainer },
  connectBtnText: { color: colors.onPrimaryContainer, fontSize: 13, fontWeight: '700' },
  disconnectBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.error + '50' },
  disconnectBtnText: { color: colors.error },
  bottomActions: { marginTop: 40 },
  continueButton: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4 },
  continueLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  buttonContent: { height: 52 },
});
