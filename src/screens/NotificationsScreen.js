import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { notificationsApi } from '../services/api';

const typeIcons = {
  system: { icon: 'information', color: colors.primary, bg: colors.primaryContainer + '30' },
  integration: { icon: 'link-variant', color: '#059669', bg: '#D1FAE530' },
  task: { icon: 'clipboard-check', color: '#d97706', bg: '#FEF3C730' },
  chat: { icon: 'chat', color: colors.primary, bg: colors.primaryContainer + '30' },
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data || []);
    } catch (e) { console.log(e); }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead([id]);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) { console.log(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.log(e); }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unread > 0 && <Text style={styles.headerSub}>{unread} unread</Text>}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
      >
        {notifications.length > 0 ? notifications.map(n => {
          const t = typeIcons[n.type] || typeIcons.system;
          return (
            <TouchableOpacity key={n.id} style={[styles.notifCard, !n.read && styles.unread]} onPress={() => handleMarkRead(n.id)} activeOpacity={0.7}>
              <View style={[styles.notifIcon, { backgroundColor: t.bg }]}>
                <MaterialCommunityIcons name={t.icon} size={20} color={t.color} />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <Text style={styles.notifTime}>{timeAgo(n.created_at)}</Text>
              </View>
              {!n.read && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        }) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function timeAgo(d) {
  if (!d) return ''; const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'; return Math.floor(h / 24) + 'd ago';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  headerSub: { fontSize: 11, color: colors.primary, fontWeight: '600', marginTop: 1 },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.primaryContainer + '30' },
  markAllText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 16,
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, marginBottom: 8,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  notifIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  notifBody: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  notifTime: { fontSize: 10, color: colors.outline, marginTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
});
