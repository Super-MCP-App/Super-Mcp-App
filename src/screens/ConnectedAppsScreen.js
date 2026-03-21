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
  github: { icon: 'github', color: '#fff', bg: '#24292e' },
  slack: { icon: 'slack', color: '#fff', bg: '#4A154B' },
  discord: { icon: 'discord', color: '#fff', bg: '#5865F2' },
  kite: { icon: 'chart-line', color: '#fff', bg: '#0084FF' },
  custom: { icon: 'server-network', color: '#fff', bg: '#10B981' },
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
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>MCP Apps</Text>
          <TouchableOpacity onPress={() => { setRefreshing(true); fetchApps(); }} style={styles.refreshBtn}>
            <MaterialCommunityIcons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mcpStrip}>
          {apps.map(app => {
            const icons = providerIcons[app.provider] || { icon: 'apps', color: colors.onSurfaceVariant };
            const isConnected = app.status === 'connected';
            return (
              <View key={app.provider} style={styles.mcpChip}>
                <View style={[styles.mcpDot, { backgroundColor: isConnected ? '#059669' : colors.outlineVariant }]} />
                <MaterialCommunityIcons name={icons.icon} size={14} color={isConnected ? (icons.bg === '#fff' ? colors.primary : icons.bg) : colors.onSurfaceVariant} />
                <Text style={[styles.mcpChipText, { color: isConnected ? colors.onSurface : colors.onSurfaceVariant }]}>
                  {app.provider_display_name || app.provider}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApps(); }} colors={[colors.primary]} />}
      >
        {/* Connected Section */}
        {connected.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTED APPS</Text>
            <View style={styles.grid}>
              {connected.map((app) => (
                <GridCard key={app.provider} app={app} onPress={() => handleDisconnect(app.provider)} buttonLabel="Manage" status="connected" />
              ))}
            </View>
          </View>
        )}

        {/* Available Section */}
        {available.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPLORE MCP PROVIDERS</Text>
            <View style={styles.grid}>
              {available.map((app) => (
                <GridCard key={app.provider} app={app} onPress={() => handleConnect(app.provider)} buttonLabel="Connect" status="available" />
              ))}
            </View>
          </View>
        )}

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMING SOON</Text>
            <View style={styles.grid}>
              {comingSoon.map((app) => (
                <GridCard key={app.provider} app={app} onPress={() => Alert.alert('Coming Soon', `${app.provider_display_name} integration is under development`)} buttonLabel="Notify" status="coming_soon" />
              ))}
            </View>
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

function GridCard({ app, onPress, buttonLabel, status }) {
  const icons = providerIcons[app.provider] || { icon: 'apps', color: '#fff', bg: colors.primary };
  const isConnected = status === 'connected';
  const isComing = status === 'coming_soon';

  return (
    <TouchableOpacity 
      style={[styles.gridCard, isConnected && styles.gridCardConnected]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.gridIcon, { backgroundColor: icons.bg }]}>
        <MaterialCommunityIcons name={icons.icon} size={28} color={icons.color} />
        {isConnected && (
          <View style={styles.activeBadge}>
            <MaterialCommunityIcons name="check" size={10} color="#fff" />
          </View>
        )}
      </View>
      <Text style={styles.gridName} numberOfLines={1}>{app.provider_display_name || app.provider}</Text>
      <Text style={styles.gridDesc} numberOfLines={2}>{app.description || 'MCP integration'}</Text>
      
      <View style={[styles.gridBtn, isConnected ? styles.gridBtnConnected : (isComing ? styles.gridBtnComing : styles.gridBtnAvailable)]}>
        <Text style={[styles.gridBtnText, isConnected && { color: colors.primary }]}>{buttonLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15', backgroundColor: colors.background },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: colors.onSurface, letterSpacing: -0.5 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primaryContainer + '30', justifyContent: 'center', alignItems: 'center' },
  mcpStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 },
  mcpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surfaceContainerLow, borderRadius: 20, borderWidth: 1, borderColor: colors.outlineVariant + '10' },
  mcpDot: { width: 6, height: 6, borderRadius: 3 },
  mcpChipText: { fontSize: 11, fontWeight: '700' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginBottom: 24, marginTop: 12 },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gridCard: {
    width: '48%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant + '15',
    marginBottom: 4,
  },
  gridCardConnected: {
    borderColor: colors.primary + '30',
    backgroundColor: colors.primaryContainer + '08',
  },
  gridIcon: {
    width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  activeBadge: {
    position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, 
    backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
  },
  gridName: { fontSize: 15, fontWeight: '800', color: colors.onSurface, textAlign: 'center' },
  gridDesc: { fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4, lineHeight: 14, height: 28 },
  gridBtn: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, width: '100%', alignItems: 'center' },
  gridBtnAvailable: { backgroundColor: colors.primary },
  gridBtnConnected: { backgroundColor: colors.primaryContainer + '40' },
  gridBtnComing: { backgroundColor: colors.surfaceContainerHigh },
  gridBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
});
