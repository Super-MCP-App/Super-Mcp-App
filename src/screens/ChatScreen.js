import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { Text, IconButton, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { conversationsApi, messagesApi } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, title } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [useMcp, setUseMcp] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    if (conversationId) loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const conv = await conversationsApi.get(conversationId);
      const msgs = conv?.messages || conv || [];
      const remoteMsgs = Array.isArray(msgs) ? msgs.filter(m => m.role !== 'system') : [];
      
      setMessages(prev => {
        const existingIds = new Set(remoteMsgs.map(m => m.id));
        const optimisticMsgs = prev.filter(m => !existingIds.has(m.id) && m.id > 1000000000000);
        return [...remoteMsgs, ...optimisticMsgs];
      });
    } catch (e) {
      console.log('Load messages error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && !selectedImage) || sending) return;

    const userMsg = { 
      id: Date.now(), 
      role: 'user', 
      content: text, 
      imageUri: selectedImage?.uri,
      created_at: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const base64Image = selectedImage?.base64;
    setSelectedImage(null);
    setSending(true);

    try {
      const response = await messagesApi.send(conversationId, text, useMcp, base64Image);
      const aiMsg = response?.aiMessage || response?.ai_message || response;
      if (aiMsg && aiMsg.content) {
        setMessages(prev => [...prev, { id: aiMsg.id || Date.now() + 1, role: 'assistant', content: aiMsg.content, created_at: new Date().toISOString() }]);
      }
    } catch (e) {
      Alert.alert('Send Error', e.message || 'Failed to get response');
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleNewChat = async () => {
    setMenuVisible(false);
    try {
      setLoading(true);
      const preferredModel = await AsyncStorage.getItem('preferred_model');
      const newConv = await conversationsApi.create('New Chat', preferredModel || undefined);
      navigation.replace('ChatDetail', { conversationId: newConv.id, title: newConv.title });
    } catch (e) {
      Alert.alert('Error', 'Could not create new chat');
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMenuVisible(false);
    Alert.alert('Clear Chat', 'Remove all messages from this view?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  };

  const handleSearchToggle = () => {
    setMenuVisible(false);
    setIsSearching(s => !s);
    if (isSearching) setSearchQuery('');
  };

  const filteredMessages = isSearching && searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  if (!conversationId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <MaterialCommunityIcons name="chat-off-outline" size={48} color={colors.outlineVariant} />
        <Text style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>No conversation selected</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Chat'}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1, gap: 4 }}>
             <MaterialCommunityIcons name={useMcp ? "lightning-bolt" : "lightning-bolt-outline"} size={10} color={useMcp ? colors.primary : colors.onSurfaceVariant} />
             <Text style={[styles.headerSub, !useMcp && { color: colors.onSurfaceVariant }]}>{useMcp ? 'MCP Active' : 'MCP Disabled'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleNewChat} style={styles.menuBtn}>
          <MaterialCommunityIcons name="message-plus-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Search Bar (visible when searching) */}
      {isSearching && (
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurfaceVariant} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={handleSearchToggle}>
            <MaterialCommunityIcons name="close" size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      )}

      {/* 3-Dot Dropdown Menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuDropdown}>
            <View style={[styles.menuItem, { justifyContent: 'space-between' }]}>
               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                 <MaterialCommunityIcons name="auto-fix" size={18} color={useMcp ? colors.primary : colors.onSurface} />
                 <Text style={styles.menuItemText}>MCP Tools</Text>
               </View>
               <Switch value={useMcp} onValueChange={setUseMcp} color={colors.primary} style={{ transform: [{ scale: 0.8 }] }} />
            </View>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleSearchToggle}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.onSurface} />
              <Text style={styles.menuItemText}>Search Chat</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
              <MaterialCommunityIcons name="delete-sweep-outline" size={18} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Clear Chat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {filteredMessages.length === 0 ? (
            <View style={styles.centerState}>
              <MaterialCommunityIcons name={isSearching ? "magnify-close" : "chat-processing-outline"} size={40} color={colors.outlineVariant} />
              <Text style={styles.emptyTitle}>{isSearching ? 'No messages found' : 'Start the conversation'}</Text>
              <Text style={styles.emptySubtitle}>{isSearching ? 'Try a different search' : 'Ask anything below!'}</Text>
            </View>
          ) : (
            filteredMessages.map((msg) => (
              <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={styles.aiAvatar}>
                    <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.onPrimary} />
                  </View>
                )}
                <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                  {msg.role === 'user' ? (
                    <View>
                      {msg.imageUri && (
                        <Image source={{ uri: msg.imageUri }} style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 8 }} />
                      )}
                      {msg.content ? <Text style={[styles.bubbleText, styles.userBubbleText]}>{msg.content}</Text> : null}
                    </View>
                  ) : (
                    <View>
                      <Markdown style={markdownStyles}>
                        {msg.content?.replace('open_connect_figma_screen', '')}
                      </Markdown>
                      {msg.content?.includes('open_connect_figma_screen') && (
                        <TouchableOpacity 
                          style={styles.connectFigmaBtn} 
                          onPress={() => navigation.getParent()?.navigate('Apps')}
                        >
                          <MaterialCommunityIcons name="vector-bezier" size={16} color={colors.white} />
                          <Text style={styles.connectFigmaText}>Connect Figma Account</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
          {sending && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <View style={styles.aiAvatar}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color={colors.onPrimary} />
              </View>
              <View style={[styles.bubbleContent, styles.aiBubbleContent]}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Image Preview & Input Bar */}
      <View style={{ backgroundColor: colors.background, paddingBottom: Platform.OS === 'ios' ? 24 : 8, borderTopWidth: 1, borderTopColor: colors.outlineVariant + '15' }}>
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.imagePreviewRemove} onPress={() => setSelectedImage(null)}>
              <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.paperclipBtn}>
            <MaterialCommunityIcons name="paperclip" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <RNTextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={selectedImage ? "Add a caption..." : "Message AI..."}
            placeholderTextColor={colors.onSurfaceVariant}
            multiline
            returnKeyType="default"
            color={colors.onSurface}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: (input.trim() || selectedImage) ? colors.primary : colors.surfaceContainerLow }]}
            onPress={handleSend}
            disabled={(!input.trim() && !selectedImage) || sending}
          >
            <MaterialCommunityIcons name="send" size={20} color={(input.trim() || selectedImage) ? colors.onPrimary : colors.outlineVariant} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = {
  body: { color: colors.onSurface, fontSize: 14, lineHeight: 22 },
  code_block: { backgroundColor: colors.surfaceVariant, padding: 12, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, marginTop: 8, marginBottom: 8 },
  code_inline: { backgroundColor: colors.surfaceVariant, paddingHorizontal: 4, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  fence: { backgroundColor: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, marginTop: 8, marginBottom: 8 },
  link: { color: colors.primary, textDecorationLine: 'none' },
  paragraph: { marginTop: 4, marginBottom: 4 },
  strong: { fontWeight: '700' },
  em: { fontStyle: 'italic' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 50 : 36, paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '20' },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, paddingHorizontal: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  headerSub: { fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 1 },
  menuBtn: { padding: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 10, backgroundColor: colors.surfaceContainerLow, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15' },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14 },
  // Dropdown Menu
  menuOverlay: { flex: 1 },
  menuDropdown: {
    position: 'absolute',
    right: 12, top: Platform.OS === 'ios' ? 92 : 76,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuItemText: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
  menuDivider: { height: 1, backgroundColor: colors.outlineVariant + '20', marginHorizontal: 12 },
  // Messages
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
  bubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },
  bubbleContent: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '90%' },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubbleContent: { backgroundColor: colors.surfaceContainerLowest, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20, color: colors.onSurface },
  userBubbleText: { color: colors.onPrimary },
  typingDots: { color: colors.primary, fontSize: 16, letterSpacing: 2 },
  imagePreviewContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexDirection: 'row' },
  imagePreview: { width: 70, height: 70, borderRadius: 12, borderWidth: 1, borderColor: colors.outlineVariant + '30' },
  imagePreviewRemove: { position: 'absolute', top: 4, left: 74, backgroundColor: '#fff', borderRadius: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8 },
  paperclipBtn: { padding: 10, marginRight: 2 },
  textInput: { flex: 1, backgroundColor: colors.surfaceContainerLow, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 14, color: colors.onSurface, maxHeight: 100, marginRight: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  connectFigmaBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#F24E1E', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'flex-start', gap: 6 },
  connectFigmaText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
