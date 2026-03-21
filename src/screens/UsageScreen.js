import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { usageApi } from '../services/api';

export default function UsageScreen() {
  const [stats, setStats] = useState({ totalTokens: 0, totalApiCalls: 0, totalConversations: 0, connectedApps: 0 });
  const [daily, setDaily] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      const data = await usageApi.get(7);
      setStats(data.summary || {});
      setDaily(data.daily || []);
    } catch (e) {
      console.log('Usage error:', e.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsage(); }, []);

  const maxTokens = Math.max(...daily.map(d => d.tokens || 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Usage</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsage(); }} colors={[colors.primary]} />}
      >
        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Tokens', value: formatN(stats.totalTokens), icon: 'chart-donut' },
            { label: 'API Calls', value: formatN(stats.totalApiCalls), icon: 'api' },
            { label: 'Conversations', value: stats.totalConversations, icon: 'chat-outline' },
            { label: 'Connected Apps', value: stats.connectedApps, icon: 'link-variant' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={20} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Token Usage</Text>
          {daily.length > 0 ? (
            <>
              <View style={styles.chartBars}>
                {daily.map((d, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={[styles.bar, { height: Math.max(((d.tokens || 0) / maxTokens) * 120, 4) }]} />
                    <Text style={styles.barLabel}>{d.date?.slice(5) || ''}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyChart}>
              <MaterialCommunityIcons name="chart-bar" size={40} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No usage data yet</Text>
              <Text style={styles.emptySubtext}>Start chatting to generate usage data</Text>
            </View>
          )}
        </View>

        {/* Token breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.chartTitle}>Summary</Text>
          {[
            { label: 'Tokens this period', value: formatN(stats.totalTokens), color: colors.primary },
            { label: 'API calls this period', value: formatN(stats.totalApiCalls), color: '#10b981' },
            { label: 'Active conversations', value: stats.totalConversations, color: '#f59e0b' },
          ].map((item, i) => (
            <View key={i} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
              <Text style={styles.breakdownValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function formatN(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    width: '47%', padding: 16, backgroundColor: colors.surfaceContainerLowest, borderRadius: 16,
    borderWidth: 1, borderColor: colors.outlineVariant + '20',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.onSurface, marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.outline, textTransform: 'uppercase', marginTop: 2 },
  chartCard: {
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: 20, marginBottom: 16,
  },
  chartTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginBottom: 16 },
  chartBars: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 140,
  },
  barColumn: { flex: 1, alignItems: 'center' },
  bar: { width: '100%', backgroundColor: colors.primaryContainer, borderRadius: 6 },
  barLabel: { fontSize: 9, color: colors.outline, marginTop: 4, fontWeight: '600' },
  emptyChart: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, fontWeight: '600', color: colors.onSurface, marginTop: 8 },
  emptySubtext: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  breakdownCard: {
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: 20,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15',
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 14, fontWeight: '500', color: colors.onSurface },
  breakdownValue: { fontSize: 16, fontWeight: '800', color: colors.onSurface },
});
