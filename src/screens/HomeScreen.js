import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { profileApi, conversationsApi, usageApi } from '../services/api';
import { supabase } from '../services/supabase';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({ totalTokens: 0, totalApiCalls: 0, totalConversations: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const results = await Promise.allSettled([
      profileApi.get(),
      conversationsApi.list(),
      usageApi.get(7),
    ]);

    if (results[0].status === 'fulfilled') {
      setProfile(results[0].value);
    } else {
      // Fallback from supabase auth
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setProfile({ full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', email: user.email });
      } catch {}
    }

    if (results[1].status === 'fulfilled') {
      setConversations(Array.isArray(results[1].value) ? results[1].value : []);
    }

    if (results[2].status === 'fulfilled') {
      setStats(results[2].value?.summary || {});
    }

    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>{profile?.full_name || 'Loading...'}</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')}>
            <MaterialCommunityIcons name="magnify" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: 'chat-plus-outline', label: 'New Chat', color: colors.primary, onPress: async () => {
              try {
                const conv = await conversationsApi.create('New Chat');
                if (conv?.id) navigation.navigate('ChatDetail', { conversationId: conv.id, title: conv.title });
              } catch (e) { console.log(e); }
            }},
            { icon: 'link-variant', label: 'Apps', color: '#059669', onPress: () => navigation.navigate('ConnectedApps') },
            { icon: 'clipboard-check-outline', label: 'Tasks', color: '#d97706', onPress: () => navigation.navigate('Tasks') },
            { icon: 'bell-outline', label: 'Alerts', color: '#ef4444', onPress: () => navigation.navigate('Notifications') },
          ].map((a, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={a.onPress} activeOpacity={0.7}>
              <View style={[styles.actionIcon, { backgroundColor: a.color + '15' }]}>
                <MaterialCommunityIcons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Tokens', value: formatN(stats.totalTokens), icon: 'chart-donut' },
            { label: 'API Calls', value: formatN(stats.totalApiCalls), icon: 'api' },
            { label: 'Chats', value: conversations.length, icon: 'chat-outline' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <MaterialCommunityIcons name={s.icon} size={18} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Conversations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Conversations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {conversations.length > 0 ? conversations.slice(0, 5).map(conv => (
          <TouchableOpacity
            key={conv.id}
            style={styles.convCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatDetail', { conversationId: conv.id, title: conv.title })}
          >
            <View style={styles.convIcon}>
              <MaterialCommunityIcons name="chat-processing-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
              <Text style={styles.convMsg} numberOfLines={1}>{conv.last_message || 'No messages yet'}</Text>
            </View>
            <Text style={styles.convTime}>{timeAgo(conv.updated_at)}</Text>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyConv}>
            <Text style={styles.emptyText}>No conversations yet — tap "New Chat" to start</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatN(n) { if (!n) return '0'; if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
function timeAgo(d) { if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return 'now'; if (m < 60) return m + 'm'; const h = Math.floor(m / 60); if (h < 24) return h + 'h'; return Math.floor(h / 24) + 'd'; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 54, paddingHorizontal: 20, paddingBottom: 16 },
  greeting: { fontSize: 13, color: colors.onSurfaceVariant, fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: colors.onSurface, marginTop: 2 },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  actionCard: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 16, backgroundColor: colors.surfaceContainerLowest, borderRadius: 16 },
  actionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.onSurface },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  statCard: { flex: 1, padding: 14, backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.onSurface },
  statLabel: { fontSize: 10, fontWeight: '600', color: colors.outline, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  convCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 8,
    padding: 14, backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, gap: 12,
  },
  convIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryContainer + '30', justifyContent: 'center', alignItems: 'center' },
  convTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  convMsg: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  convTime: { fontSize: 10, color: colors.outline },
  emptyConv: { marginHorizontal: 20, padding: 24, borderRadius: 14, backgroundColor: colors.surfaceContainerLowest, alignItems: 'center' },
  emptyText: { fontSize: 13, color: colors.onSurfaceVariant },
});
