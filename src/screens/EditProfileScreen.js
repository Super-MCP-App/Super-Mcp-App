import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { profileApi } from '../services/api';

export default function EditProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await profileApi.get();
        setProfile({ full_name: data.full_name || '', email: data.email || '', phone: data.phone || '', bio: data.bio || '' });
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile.full_name) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      await profileApi.update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
      });
      Alert.alert('Saved', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.changeAvatarBtn}>
            <MaterialCommunityIcons name="camera" size={16} color={colors.primary} />
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={profile.full_name}
            onChangeText={t => setProfile({ ...profile, full_name: t })}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Email"
            value={profile.email}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            disabled
            left={<TextInput.Icon icon="email" />}
          />
          <TextInput
            label="Phone"
            value={profile.phone}
            onChangeText={t => setProfile({ ...profile, phone: t })}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />
          <TextInput
            label="Bio"
            value={profile.bio}
            onChangeText={t => setProfile({ ...profile, bio: t })}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="text" />}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
          labelStyle={styles.saveLabel}
          contentStyle={styles.saveContent}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.onPrimaryContainer },
  changeAvatarBtn: { flexDirection: 'row', gap: 6, marginTop: 12, padding: 8 },
  changeAvatarText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderRadius: 12 },
  saveBtn: { borderRadius: 28, backgroundColor: colors.primary, marginTop: 24 },
  saveLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  saveContent: { height: 52 },
});
