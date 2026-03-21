import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Pressable } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { profileApi } from '../services/api';
import { signOut, supabase } from '../services/supabase';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get();
      setProfile(data);
    } catch (e) {
      console.log('Profile error:', e.message);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfile({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            plan: 'free',
          });
        }
      } catch (e2) { console.log(e2); }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { Alert } = require('react-native');
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try { await signOut(); } catch (e) { console.log(e); }
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Edit Profile', icon: 'account-edit-outline', onPress: () => navigation.navigate('EditProfile') },
        { label: 'Billing & Plan', icon: 'credit-card-outline', onPress: () => navigation.navigate('Billing'), badge: profile?.plan || 'free' },
        { label: 'Connected Apps', icon: 'link-variant', onPress: () => navigation.navigate('ConnectedApps') },
        { label: 'Notifications', icon: 'bell-outline', onPress: () => navigation.navigate('Notifications') },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { label: 'Settings', icon: 'cog-outline', onPress: () => navigation.navigate('Settings') },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(profile?.full_name || 'U').split(' ').map(n => n?.[0] || '').join('').toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{profile?.full_name || 'Loading...'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
          <View style={styles.planBadge}>
            <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
            <Text style={styles.planText}>{(profile?.plan || 'free').toUpperCase()} Plan</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.menuSection}>
            <Text style={styles.sectionLabel}>{section.title}</Text>
            <View style={styles.menuGroup}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity
                  key={iIdx}
                  style={[styles.menuItem, iIdx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.outlineVariant} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
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
  header: { paddingTop: 54, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  profileCard: {
    alignItems: 'center', padding: 24,
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, marginBottom: 24,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: colors.primaryContainer },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryContainer,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: colors.onPrimaryContainer },
  profileName: { fontSize: 20, fontWeight: '800', color: colors.onSurface, marginTop: 12 },
  profileEmail: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryContainer + '30',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8,
  },
  planText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  menuSection: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: colors.primary,
    letterSpacing: 1.5, marginBottom: 8, marginLeft: 4,
  },
  menuGroup: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '15' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primaryContainer + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badgeContainer: { backgroundColor: colors.primaryContainer + '40', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 18, borderRadius: 28, borderWidth: 1.5, borderColor: colors.error,
    marginTop: 8, cursor: 'pointer',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.error },
});
