import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { colors } from '../theme/colors';
import { tasksApi } from '../services/api';

const tabs = ['all', 'running', 'completed', 'failed'];

export default function TasksScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adding, setAdding] = useState(false);

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

  const handleAddTask = async () => {
    if (!newTitle.trim()) { Alert.alert('Error', 'Task title is required'); return; }
    setAdding(true);
    try {
      const task = await tasksApi.create(newTitle.trim(), newDesc.trim());
      setTasks(prev => [task, ...prev]);
      setNewTitle('');
      setNewDesc('');
      setShowAddModal(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create task');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await tasksApi.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
          } catch (e) {
            Alert.alert('Error', e.message || 'Could not delete task');
          }
        },
      },
    ]);
  };

  const renderRightActions = (id) => (
    <View style={styles.deleteAction}>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(id)}>
        <MaterialCommunityIcons name="delete-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );

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
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={18} color={colors.onPrimary} />
          <Text style={styles.addBtnText}>Add Task</Text>
        </TouchableOpacity>
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
          <Swipeable
            key={task.id}
            renderRightActions={() => renderRightActions(task.id)}
            overshootRight={false}
            containerStyle={styles.swipeableContainer}
          >
            <TouchableOpacity
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
          </Swipeable>
        )) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No {activeTab === 'all' ? '' : activeTab} tasks</Text>
            <Text style={styles.emptySubtitle}>Tap "Add Task" to create your first task</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAddModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Task</Text>
            <Text style={styles.modalLabel}>Title *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.onSurfaceVariant}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              returnKeyType="next"
            />
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Optional details..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              numberOfLines={3}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddModal(false); setNewTitle(''); setNewDesc(''); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.createBtn, adding && { opacity: 0.6 }]} onPress={handleAddTask} disabled={adding}>
                <Text style={styles.createBtnText}>{adding ? 'Creating...' : 'Create Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '700' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceContainerLow },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  tabTextActive: { color: colors.onPrimary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  swipeableContainer: { marginBottom: 10, borderRadius: 16 },
  taskCard: { padding: 16, backgroundColor: colors.surfaceContainerLowest, borderRadius: 16 },
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
  deleteAction: { width: 72, borderTopRightRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden', marginBottom: 10 },
  deleteBtn: { flex: 1, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.onSurface, marginBottom: 20 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 1, marginBottom: 6 },
  modalInput: {
    backgroundColor: colors.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: colors.onSurface, marginBottom: 16,
  },
  modalTextarea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.outlineVariant, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: colors.onSurfaceVariant },
  createBtn: { flex: 2, padding: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' },
  createBtnText: { fontSize: 15, fontWeight: '700', color: colors.onPrimary },
});
