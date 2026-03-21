import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { Text, IconButton, Switch, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { signOut } from '../services/supabase';

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);

  const mcpProviders = [
    { id: 'figma', name: 'Figma', icon: 'vector-bezier', desc: 'Read design files and components', color: '#F24E1E' },
    { id: 'canva', name: 'Canva', icon: 'palette-outline', desc: 'Access and export Canva designs', color: '#00C4CC' },
    { id: 'kite', name: 'Kite', icon: 'chart-line', desc: 'Secure financial data access', color: colors.primary },
  ];
  const [mcpConnected, setMcpConnected] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load API Key safely
    const { data: profile } = await supabase.from('profiles').select('nvidia_api_key').eq('id', user.id).single();
    if (profile?.nvidia_api_key) setApiKey('•••••••••••••••••••••••••'); // Mask immediately

    // Load MCP Connections
    const { data: apps } = await supabase.from('connected_apps').select('provider').eq('user_id', user.id);
    const connMap = {};
    (apps || []).forEach(a => { connMap[a.provider] = true; });
    setMcpConnected(connMap);
  };

  const saveApiKey = async (newKey) => {
    if (newKey === '•••••••••••••••••••••••••') return; // Do not save masked string
    setIsSavingKey(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('profiles').update({ nvidia_api_key: newKey }).eq('id', user.id);
      Alert.alert('Success', 'API Key updated successfully');
      setApiKey('•••••••••••••••••••••••••');
    } catch(e) {
      Alert.alert('Error', 'Failed to update key');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleMcpToggle = (id) => {
    const isConnected = mcpConnected[id];
    Alert.alert(
      isConnected ? 'Disconnect' : 'Connect',
      isConnected ? `Disconnect ${id} MCP server?` : `Connect to ${id} MCP server?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: isConnected ? 'Disconnect' : 'Connect', onPress: async () => {
           const { data: { user } } = await supabase.auth.getUser();
           if (isConnected) {
             await supabase.from('connected_apps').delete().eq('user_id', user.id).eq('provider', id);
             setMcpConnected(prev => ({ ...prev, [id]: false }));
           } else {
             await supabase.from('connected_apps').upsert({
               user_id: user.id, provider: id, status: 'connected', access_token: `mock_token_${Date.now()}`
             }, { onConflict: 'user_id, provider' });
             setMcpConnected(prev => ({ ...prev, [id]: true }));
           }
        } },
      ]
    );
  };

  const sections = [
    {
      title: 'APPEARANCE',
      items: [
        { label: 'Dark Mode', icon: 'weather-night', desc: 'Switch to dark theme', toggle: true, value: darkMode, onToggle: setDarkMode },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      items: [
        { label: 'Push Notifications', icon: 'bell-ring-outline', desc: 'Receive push alerts', toggle: true, value: pushNotif, onToggle: setPushNotif },
        { label: 'Email Notifications', icon: 'email-outline', desc: 'Receive email updates', toggle: true, value: emailNotif, onToggle: setEmailNotif },
      ],
    },
    {
      title: 'AI CONFIGURATION',
      custom: () => (
        <View style={styles.group}>
          <View style={[styles.row, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBg}><MaterialCommunityIcons name="key-outline" size={20} color={colors.primary} /></View>
              <View>
                <Text style={styles.rowLabel}>NVIDIA API Key</Text>
                <Text style={styles.rowDesc}>Your personal key for LLM access</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={apiKey}
                onChangeText={setApiKey}
                mode="outlined"
                secureTextEntry={apiKey === '•••••••••••••••••••••••••'}
                style={{ flex: 1, height: 40, backgroundColor: 'transparent' }}
                placeholder="Enter new key"
                outlineColor={colors.outlineVariant}
                activeOutlineColor={colors.primary}
              />
              <Button 
                mode="contained" 
                onPress={() => saveApiKey(apiKey)} 
                loading={isSavingKey}
                disabled={isSavingKey || apiKey === '•••••••••••••••••••••••••' || !apiKey}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      ),
    },
    {
      title: 'AI MODEL',
      items: [
        { label: 'Default Model', icon: 'robot-outline', desc: 'NVIDIA Nemotron Ultra 253B', nav: false },
      ],
    },
    {
      title: 'DATA',
      items: [
        { label: 'Clear Chat History', icon: 'delete-sweep-outline', desc: 'Delete all conversations', action: () => Alert.alert('Clear History', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive' }]) },
        { label: 'Export Data', icon: 'download-outline', desc: 'Download your data', action: () => Alert.alert('Export', 'Data export will be sent to your email') },
      ],
    },
    {
      title: 'ABOUT',
      items: [
        { label: 'Version', icon: 'information-outline', desc: 'Super Mcp v1.0.0' },
        { label: 'Privacy Policy', icon: 'shield-lock-outline', desc: 'View privacy policy' },
        { label: 'Terms of Service', icon: 'file-document-outline', desc: 'View terms' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            {section.custom ? (
              section.custom()
            ) : (
              <View style={styles.group}>
                {section.items.map((item, iIdx) => (
                  <TouchableOpacity
                    key={iIdx}
                    style={[styles.row, iIdx < section.items.length - 1 && styles.rowBorder]}
                    onPress={item.action || (() => {})}
                    activeOpacity={item.toggle ? 1 : 0.7}
                  >
                    <View style={styles.rowLeft}>
                      <View style={styles.iconBg}>
                        <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.rowLabel}>{item.label}</Text>
                        <Text style={styles.rowDesc}>{item.desc}</Text>
                      </View>
                    </View>
                    {item.toggle ? (
                      <Switch value={item.value} onValueChange={item.onToggle} color={colors.primary} />
                    ) : (
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {/* MCP Connections Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MCP CONNECTIONS</Text>
          <View style={styles.group}>
            {mcpProviders.map((p, i) => (
              <View key={p.id} style={[styles.row, i < mcpProviders.length - 1 && styles.rowBorder]}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBg, { backgroundColor: p.color + '20' }]}>
                    <MaterialCommunityIcons name={p.icon} size={20} color={p.color} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{p.name}</Text>
                    <Text style={styles.rowDesc}>{p.desc}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.mcpBtn, { backgroundColor: mcpConnected[p.id] ? '#D1FAE5' : colors.surfaceContainerLow }]}
                  onPress={() => handleMcpToggle(p.id)}
                >
                  <MaterialCommunityIcons name={mcpConnected[p.id] ? 'check-circle' : 'link-plus'} size={14} color={mcpConnected[p.id] ? '#059669' : colors.primary} />
                  <Text style={[styles.mcpBtnText, { color: mcpConnected[p.id] ? '#059669' : colors.primary }]}>{mcpConnected[p.id] ? 'Connected' : 'Connect'}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={async () => {
            Alert.alert('Logout', 'Sign out?', [
              { text: 'Cancel' },
              { text: 'Logout', style: 'destructive', onPress: async () => { await signOut(); } },
            ]);
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: colors.primary, letterSpacing: 1.5, marginBottom: 8 },
  group: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryContainer + '30', justifyContent: 'center', alignItems: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '600', color: colors.onSurface },
  rowDesc: { fontSize: 11, color: colors.onSurfaceVariant, marginTop: 1 },
  mcpBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  mcpBtnText: { fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, borderRadius: 28, borderWidth: 1.5, borderColor: colors.error, marginTop: 8,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
});
