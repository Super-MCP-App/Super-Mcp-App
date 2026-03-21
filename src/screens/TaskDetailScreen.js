import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, ProgressBar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { tasksApi } from '../services/api';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params || {};
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await tasksApi.get(taskId);
        setTask(data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    if (taskId) fetchTask();
  }, [taskId]);

  if (loading || !task) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.onSurfaceVariant }}>Loading task...</Text>
      </View>
    );
  }

  const statusColor = task.status === 'running' ? colors.primary : task.status === 'completed' ? '#059669' : colors.error;
  const statusBg = task.status === 'running' ? colors.primaryContainer + '30' : task.status === 'completed' ? '#D1FAE530' : colors.error + '15';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status */}
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <MaterialCommunityIcons
            name={task.status === 'running' ? 'progress-clock' : task.status === 'completed' ? 'check-circle' : 'alert-circle'}
            size={18} color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>{task.status}</Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>
        {task.description && <Text style={styles.description}>{task.description}</Text>}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{Math.round((task.progress || 0) * 100)}%</Text>
          </View>
          <ProgressBar progress={task.progress || 0} color={statusColor} style={styles.progressBar} />
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {[
            { label: 'Model', value: (task.model || 'default').split('/').pop(), icon: 'robot' },
            { label: 'Tokens Used', value: task.tokens_used || '0', icon: 'chart-donut' },
            { label: 'Created', value: task.created_at ? new Date(task.created_at).toLocaleString() : '-', icon: 'clock-outline' },
            { label: 'Updated', value: task.updated_at ? new Date(task.updated_at).toLocaleString() : '-', icon: 'update' },
          ].map((d, i) => (
            <View key={i} style={styles.detailCard}>
              <MaterialCommunityIcons name={d.icon} size={18} color={colors.primary} />
              <Text style={styles.detailLabel}>{d.label}</Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        {task.status === 'running' && (
          <Button
            mode="outlined"
            icon="stop"
            style={styles.actionBtn}
            labelStyle={{ color: colors.error }}
            onPress={async () => {
              try { await tasksApi.update(task.id, { status: 'failed' }); navigation.goBack(); } catch (e) { console.log(e); }
            }}
          >
            Cancel Task
          </Button>
        )}
        {task.status === 'completed' && task.result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Result</Text>
            <Text style={styles.resultText}>{JSON.stringify(task.result, null, 2)}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12,
  },
  statusText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.onSurface, marginBottom: 8 },
  description: { fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 22, marginBottom: 20 },
  progressSection: { marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: colors.onSurface },
  progressValue: { fontSize: 13, fontWeight: '700', color: colors.primary },
  progressBar: { height: 8, borderRadius: 4 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  detailCard: {
    width: '47%', padding: 14, backgroundColor: colors.surfaceContainerLowest, borderRadius: 14,
  },
  detailLabel: { fontSize: 10, fontWeight: '600', color: colors.outline, textTransform: 'uppercase', marginTop: 6 },
  detailValue: { fontSize: 13, fontWeight: '700', color: colors.onSurface, marginTop: 2 },
  actionBtn: { borderRadius: 24, borderColor: colors.error },
  resultCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, padding: 16, marginTop: 12 },
  resultLabel: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  resultText: { fontSize: 12, fontFamily: 'monospace', color: colors.onSurface },
});
