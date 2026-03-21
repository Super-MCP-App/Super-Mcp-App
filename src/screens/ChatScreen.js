import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput as RNTextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { colors } from '../theme/colors';
import { conversationsApi, messagesApi } from '../services/api';

export default function ChatScreen({ route, navigation }) {
  const { conversationId, title } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    if (conversationId) loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const conv = await conversationsApi.get(conversationId);
      const msgs = conv?.messages || conv || [];
      const remoteMsgs = Array.isArray(msgs) ? msgs.filter(m => m.role !== 'system') : [];
      setMessages(prev => (prev.length > 0 ? prev : remoteMsgs));
    } catch (e) {
      console.log('Load messages error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { id: Date.now(), role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const response = await messagesApi.send(conversationId, text);
      const aiMsg = response?.aiMessage || response?.ai_message || response;
      if (aiMsg && aiMsg.content) {
        setMessages(prev => [...prev, { id: aiMsg.id || Date.now() + 1, role: 'assistant', content: aiMsg.content, created_at: new Date().toISOString() }]);
      }
    } catch (e) {
      Alert.alert('Send Error', e.message || 'Failed to get response');
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: '⚠️ ' + (e.message || 'Failed to get response'), created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 200);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Chat'}</Text>
          <Text style={styles.headerSub}>NVIDIA Nemotron Ultra</Text>
        </View>
        <IconButton icon="dots-vertical" iconColor={colors.onSurfaceVariant} size={20} onPress={() => {}} />
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: false })}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerState}>
            <MaterialCommunityIcons name="chat-outline" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyTitle}>Start a conversation</Text>
            <Text style={styles.emptySubtitle}>Send a message to begin chatting with AI</Text>
          </View>
        ) : (
          <>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                {msg.role === 'assistant' && (
                  <View style={styles.aiAvatar}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: colors.onPrimary }}>AI</Text>
                  </View>
                )}
                <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
                  {msg.role === 'user' ? (
                    <Text style={[styles.bubbleText, styles.userBubbleText]}>{msg.content}</Text>
                  ) : (
                    <Markdown style={markdownStyles}>
                      {msg.content}
                    </Markdown>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
        {sending && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <View style={styles.aiAvatar}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: colors.onPrimary }}>AI</Text>
            </View>
            <View style={[styles.bubbleContent, styles.aiBubbleContent]}>
              <Text style={styles.typingDots}>● ● ●</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <RNTextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.outline}
          multiline
          maxLength={4000}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (input.trim() && !sending) && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <MaterialCommunityIcons name="send" size={20} color={input.trim() && !sending ? colors.onPrimary : colors.outlineVariant} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
const markdownStyles = {
  body: {
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 22,
  },
  code_block: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
  fence: {
    backgroundColor: colors.onSurface,
    color: colors.surfaceContainerLowest,
    padding: 12,
    borderRadius: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'none',
  },
  paragraph: {
    marginTop: 4,
    marginBottom: 4,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15', paddingBottom: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface },
  headerSub: { fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 1 },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.onSurface, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
  bubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2,
  },
  bubbleContent: { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '90%' },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubbleContent: { backgroundColor: colors.surfaceContainerLowest, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20, color: colors.onSurface },
  userBubbleText: { color: colors.onPrimary },
  typingDots: { color: colors.primary, fontSize: 16, letterSpacing: 2 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: colors.outlineVariant + '15', backgroundColor: colors.background,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  textInput: {
    flex: 1, backgroundColor: colors.surfaceContainerLow, borderRadius: 24, paddingHorizontal: 18,
    paddingVertical: 10, fontSize: 14, color: colors.onSurface, maxHeight: 100, marginRight: 8,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerLow,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnActive: { backgroundColor: colors.primary },
});
