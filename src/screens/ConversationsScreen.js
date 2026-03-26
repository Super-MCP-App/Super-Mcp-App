import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Pressable, Platform } from 'react-native';
import { Text, Searchbar, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { conversationsApi } from '../services/api';

export default function ConversationsScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const mcpProviders = [
    { id: 'figma', name: 'Figma', icon: 'vector-bezier', color: '#F24E1E' },
    { id: 'canva', name: 'Canva', icon: 'palette-outline', color: '#00C4CC' },
    { id: 'custom', name: 'MCP', icon: 'server-network', color: colors.primary },
  ];
  const [mcpStatus] = useState({ figma: false, canva: false, custom: false });

  const fetchConversations = useCallback(async () => {
    try {
      const data = await conversationsApi.list();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Fetch conversations error:', e.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const unsubscribe = navigation.addListener('focus', fetchConversations);
    return unsubscribe;
  }, [navigation]);

  const filtered = conversations.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = async () => {
    try {
      const preferredModel = await AsyncStorage.getItem('preferred_model');
      const conv = await conversationsApi.create('New Conversation', preferredModel || undefined);
      if (conv?.id) {
        navigation.navigate('ChatDetail', { conversationId: conv.id, title: conv.title });
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Could not create conversation');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await conversationsApi.delete(id);
            setConversations(prev => prev.filter(c => c.id !== id));
          } catch (e) { console.log(e); }
        },
      },
    ]);
  };

  const renderRightActions = (id) => (
    <View style={styles.deleteAction}>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(id)}>
        <MaterialCommunityIcons name="delete-outline" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversations</Text>
        <Text style={styles.headerCount}>{conversations.length} total</Text>
      </View>
      {/* MCP Status Strip */}
      <View style={styles.mcpStrip}>
        {mcpProviders.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.mcpChip}
            onPress={() => navigation.getParent()?.navigate('Profile', { openSettings: true })}
          >
            <View style={[styles.mcpDot, { backgroundColor: mcpStatus[p.id] ? '#059669' : colors.outlineVariant }]} />
            <MaterialCommunityIcons name={p.icon} size={13} color={mcpStatus[p.id] ? p.color : colors.onSurfaceVariant} />
            <Text style={[styles.mcpChipText, { color: mcpStatus[p.id] ? p.color : colors.onSurfaceVariant }]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.mcpManageBtn} onPress={() => navigation.getParent()?.navigate('Profile')}>
          <Text style={styles.mcpManageBtnText}>Manage MCPs</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          elevation={0}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} colors={[colors.primary]} />}
      >
        {!search && (
          <TouchableOpacity 
            style={[styles.convCard, { marginBottom: 16, backgroundColor: colors.primaryContainer }]} 
            activeOpacity={0.7}
            onPress={handleNew}
          >
            <View style={[styles.convIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="plus" size={24} color={colors.onPrimary} />
            </View>
            <View style={styles.convContent}>
              <Text style={[styles.convTitle, { color: colors.onPrimaryContainer }]}>Start a New Chat</Text>
              <Text style={[styles.convMessage, { color: colors.onPrimaryContainer, opacity: 0.8 }]}>Create a new conversation with AI</Text>
            </View>
          </TouchableOpacity>
        )}
        {filtered.length > 0 ? filtered.map(conv => (
          <Swipeable 
            key={conv.id} 
            renderRightActions={() => renderRightActions(conv.id)} 
            overshootRight={false}
            containerStyle={styles.swipeableContainer}
          >
            <TouchableOpacity
              style={styles.convCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ChatDetail', { conversationId: conv.id, title: conv.title })}
              onLongPress={() => handleDelete(conv.id)}
            >
              <View style={styles.convIcon}>
                <MaterialCommunityIcons name="chat-processing-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.convContent}>
                <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
                <Text style={styles.convMessage} numberOfLines={1}>{conv.last_message || 'No messages yet'}</Text>
              </View>
              <View style={styles.convRight}>
                <Text style={styles.convTime}>{timeAgo(conv.updated_at)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.outlineVariant} />
              </View>
            </TouchableOpacity>
          </Swipeable>
        )) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chat-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>{search ? 'No results' : 'No conversations yet'}</Text>
            <Text style={styles.emptySubtitle}>{search ? 'Try a different search' : 'Tap + to start chatting with AI'}</Text>
          </View>
        )}
      </ScrollView>
      <FAB icon="plus" style={styles.fab} color={colors.onPrimary} onPress={handleNew} />
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
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
  headerCount: { fontSize: 12, color: colors.outline, fontWeight: '600' },
  mcpStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  mcpChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surfaceContainerLow, borderRadius: 20 },
  mcpDot: { width: 6, height: 6, borderRadius: 3 },
  mcpChipText: { fontSize: 11, fontWeight: '600' },
  mcpManageBtn: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5 },
  mcpManageBtnText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 4 },
  searchBar: { borderRadius: 28, backgroundColor: colors.surfaceContainerLow, height: 44 },
  searchInput: { fontSize: 14, minHeight: 44 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  swipeableContainer: { marginBottom: 8, borderRadius: 16 },
  convCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 16,
  },
  deleteAction: { width: 72, borderTopRightRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden' },
  deleteBtn: { flex: 1, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
  convIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryContainer + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  convContent: { flex: 1, marginLeft: 14 },
  convTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface },
  convMessage: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  convRight: { alignItems: 'flex-end', gap: 4 },
  convTime: { fontSize: 11, color: colors.outline, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: colors.primary, borderRadius: 28 },
});
