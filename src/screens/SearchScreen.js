import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { conversationsApi, tasksApi } from '../services/api';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [convs, tsks] = await Promise.allSettled([
        conversationsApi.list(),
        tasksApi.list(),
      ]);
      if (convs.status === 'fulfilled') setConversations(convs.value || []);
      if (tsks.status === 'fulfilled') setTasks(tsks.value || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const filtered = {
    conversations: conversations.filter(c =>
      c.title?.toLowerCase().includes(query.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(query.toLowerCase())
    ),
    tasks: tasks.filter(t =>
      t.title?.toLowerCase().includes(query.toLowerCase()) ||
      t.description?.toLowerCase().includes(query.toLowerCase())
    ),
  };

  const hasResults = filtered.conversations.length > 0 || filtered.tasks.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Searchbar
          placeholder="Search conversations, tasks..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          elevation={0}
          autoFocus
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {query.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="magnify" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Search your workspace</Text>
            <Text style={styles.emptySubtitle}>Find conversations, tasks, and more</Text>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-search-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No results for "{query}"</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          <>
            {filtered.conversations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CONVERSATIONS</Text>
                {filtered.conversations.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.resultCard}
                    onPress={() => navigation.navigate('ChatDetail', { conversationId: c.id, title: c.title })}
                  >
                    <View style={styles.resultIcon}>
                      <MaterialCommunityIcons name="chat-processing-outline" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultTitle}>{c.title}</Text>
                      {c.last_message && <Text style={styles.resultDesc} numberOfLines={1}>{c.last_message}</Text>}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={colors.outlineVariant} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {filtered.tasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TASKS</Text>
                {filtered.tasks.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.resultCard}
                    onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                  >
                    <View style={[styles.resultIcon, { backgroundColor: '#D1FAE530' }]}>
                      <MaterialCommunityIcons name="clipboard-check-outline" size={18} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultTitle}>{t.title}</Text>
                      <Text style={styles.resultDesc}>{t.status} • {Math.round((t.progress || 0) * 100)}%</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={colors.outlineVariant} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 12, gap: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  searchBar: { flex: 1, borderRadius: 24, backgroundColor: colors.surfaceContainerLow, height: 44 },
  searchInput: { fontSize: 14, minHeight: 44 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 10 },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 14, marginBottom: 6, gap: 12,
  },
  resultIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primaryContainer + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  resultTitle: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  resultDesc: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
});
