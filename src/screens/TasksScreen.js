import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { tasksApi } from '../services/api';

const tabs = ['all', 'running', 'completed', 'failed'];

export default function TasksScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list(activeTab === 'all' ? undefined : activeTab);
      setTasks(data || []);
    } catch (e) {
      console.log('Fetch error:', e.message);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchTasks(); }, [activeTab]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchTasks);
    return unsubscribe;
  }, [navigation]);

  const getStatusColor = (status) => {
    if (status === 'running') return colors.primary;
    if (status === 'completed') return '#059669';
    return colors.error;
  };
  const getStatusBg = (status) => {
    if (status === 'running') return colors.primaryContainer + '30';
    if (status === 'completed') return '#D1FAE5';
    return colors.error + '15';
  };
  const getStatusIcon = (status) => {
    if (status === 'running') return 'progress-clock';
    if (status === 'completed') return 'check-circle';
    return 'alert-circle';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} colors={[colors.primary]} />}
      >
        {tasks.length > 0 ? tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
            activeOpacity={0.7}
          >
            <View style={styles.taskHeader}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBg(task.status) }]}>
                <MaterialCommunityIcons name={getStatusIcon(task.status)} size={14} color={getStatusColor(task.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>{task.status}</Text>
              </View>
              <Text style={styles.taskTime}>{timeAgo(task.created_at)}</Text>
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.description && <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>}
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${(task.progress || 0) * 100}%`,
                  backgroundColor: getStatusColor(task.status),
                }]} />
              </View>
              <Text style={styles.progressText}>{Math.round((task.progress || 0) * 100)}%</Text>
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.metaText}>🧠 {(task.model || 'default').split('/').pop()}</Text>
              <Text style={styles.metaText}>🪙 {task.tokens_used || 0} tokens</Text>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No {activeTab === 'all' ? '' : activeTab} tasks</Text>
            <Text style={styles.emptySubtitle}>Tasks will appear here as you run AI operations</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function timeAgo(d) {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'now'; if (m < 60) return m + 'm';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h'; return Math.floor(h / 24) + 'd';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  tabTextActive: { color: colors.onPrimary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  taskCard: {
    padding: 16, backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, marginBottom: 10,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  taskTime: { fontSize: 11, color: colors.outline },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  taskDesc: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  progressBg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.surfaceContainer },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '700', color: colors.onSurfaceVariant, width: 32, textAlign: 'right' },
  taskMeta: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaText: { fontSize: 11, color: colors.outline, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
});
