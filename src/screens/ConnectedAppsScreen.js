import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { colors } from '../theme/colors';
import { integrationsApi } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

const providerIcons = {
  figma: { icon: 'palette-swatch', color: '#1e1e1e', bg: '#f0f0f0' },
  canva: { icon: 'brush', color: '#fff', bg: '#7d2ae8' },
  google_drive: { icon: 'google-drive', color: '#fff', bg: '#4285f4' },
  notion: { icon: 'notebook', color: '#fff', bg: '#000' },
};

export default function ConnectedAppsScreen({ navigation }) {
  const [apps, setApps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    try {
      const data = await integrationsApi.list();
      setApps(data || []);
    } catch (e) {
      console.log('Fetch apps error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchApps(); }, []);

  const handleConnect = async (provider) => {
    try {
      const redirectUrl = Linking.createURL('mcp-auth');
      
      let data;
      if (provider === 'figma') {
        data = await integrationsApi.figmaAuth(redirectUrl);
      } else if (provider === 'canva') {
        data = await integrationsApi.canvaAuth(redirectUrl);
      } else {
        Alert.alert('Coming Soon', `${provider} integration is coming soon!`);
        return;
      }
      
      if (data?.authUrl) {
        // Use the custom scheme matching app.json
        const result = await WebBrowser.openAuthSessionAsync(data.authUrl, redirectUrl);
        
        if (result.type === 'success' || result.type === 'dismiss') {
          // If success (handled deep link) or user dismissed, fetch apps to update UI
          fetchApps();
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Info', `${provider} OAuth requires client credentials configured in backend .env`);
    }
  };

  const handleDisconnect = async (provider) => {
    Alert.alert('Disconnect', `Disconnect ${provider}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect', style: 'destructive',
        onPress: async () => {
          try {
            await integrationsApi.disconnect(provider);
            fetchApps();
          } catch (e) { console.log(e); }
        },
      },
    ]);
  };

  const connected = apps.filter(a => a.status === 'connected');
  const available = apps.filter(a => a.status === 'available');
  const comingSoon = apps.filter(a => a.status === 'coming_soon');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Connected Apps</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApps(); }} colors={[colors.primary]} />}
      >
        {/* Connected Section */}
        {connected.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTED</Text>
            {connected.map((app) => (
              <AppCard key={app.provider} app={app} onPress={() => handleDisconnect(app.provider)} buttonLabel="Disconnect" buttonStyle="outline" />
            ))}
          </View>
        )}

        {/* Available Section */}
        {available.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AVAILABLE MCP PROVIDERS</Text>
            {available.map((app) => (
              <AppCard key={app.provider} app={app} onPress={() => handleConnect(app.provider)} buttonLabel="Connect" buttonStyle="filled" />
            ))}
          </View>
        )}

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMING SOON</Text>
            {comingSoon.map((app) => (
              <AppCard key={app.provider} app={app} onPress={() => Alert.alert('Coming Soon', `${app.provider_display_name} integration is under development`)} buttonLabel="Notify Me" buttonStyle="outline" />
            ))}
          </View>
        )}

        {apps.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="link-variant" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No MCP providers</Text>
            <Text style={styles.emptySubtitle}>Run /api/setup to seed providers</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function AppCard({ app, onPress, buttonLabel, buttonStyle }) {
  const icons = providerIcons[app.provider] || { icon: 'apps', color: '#fff', bg: colors.primary };
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.row}>
        <View style={[cardStyles.icon, { backgroundColor: icons.bg }]}>
          <MaterialCommunityIcons name={icons.icon} size={22} color={icons.color} />
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.name}>{app.provider_display_name || app.provider}</Text>
          <Text style={cardStyles.desc} numberOfLines={2}>{app.description || 'MCP integration'}</Text>
          {app.scopes && <Text style={cardStyles.scopes}>Scopes: {app.scopes}</Text>}
        </View>
      </View>
      <Button
        mode={buttonStyle === 'filled' ? 'contained' : 'outlined'}
        onPress={onPress}
        style={buttonStyle === 'filled' ? cardStyles.connectBtn : cardStyles.outlineBtn}
        labelStyle={buttonStyle === 'filled' ? cardStyles.connectLabel : cardStyles.outlineLabel}
        compact
      >
        {buttonLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, padding: 16, marginBottom: 10,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  icon: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  desc: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2, lineHeight: 18 },
  scopes: { fontSize: 10, color: colors.outline, marginTop: 4, fontFamily: 'monospace' },
  connectBtn: { borderRadius: 20, backgroundColor: colors.primary },
  connectLabel: { color: colors.onPrimary, fontWeight: '600', fontSize: 13 },
  outlineBtn: { borderRadius: 20, borderColor: colors.outlineVariant },
  outlineLabel: { color: colors.onSurfaceVariant, fontWeight: '600', fontSize: 13 },
});
