import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { profileApi } from '../services/api';

export default function BillingScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try { setProfile(await profileApi.get()); } catch (e) { console.log(e); }
    };
    fetch();
  }, []);

  const plans = [
    { name: 'Free', price: '$0', period: '/month', current: profile?.plan === 'free' || !profile?.plan, features: ['100 messages/day', '500K tokens/month', '2 connected apps', 'Basic AI model'] },
    { name: 'Pro', price: '$12', period: '/month', current: profile?.plan === 'pro', recommended: true, features: ['Unlimited messages', '5M tokens/month', 'Unlimited apps', 'Advanced AI model', 'Priority support'] },
    { name: 'Enterprise', price: 'Custom', period: '', current: profile?.plan === 'enterprise', features: ['All Pro features', 'Unlimited tokens', 'Custom AI tuning', 'Dedicated support', 'SSO & audit logs'] },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.primary} size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Billing & Plan</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Current Plan Badge */}
        <View style={styles.currentPlan}>
          <MaterialCommunityIcons name="star-circle" size={28} color={colors.primary} />
          <View>
            <Text style={styles.currentLabel}>Current Plan</Text>
            <Text style={styles.currentValue}>{(profile?.plan || 'free').toUpperCase()}</Text>
          </View>
        </View>

        {/* Plan Cards */}
        {plans.map((plan, i) => (
          <View key={i} style={[styles.planCard, plan.recommended && styles.planRecommended, plan.current && styles.planCurrent]}>
            {plan.recommended && <View style={styles.recBadge}><Text style={styles.recText}>RECOMMENDED</Text></View>}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </View>
            {plan.features.map((f, j) => (
              <View key={j} style={styles.featureRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color={plan.current ? colors.primary : '#059669'} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
            <Button
              mode={plan.current ? 'outlined' : 'contained'}
              style={plan.current ? styles.currentBtn : styles.upgradeBtn}
              labelStyle={plan.current ? styles.currentBtnLabel : styles.upgradeBtnLabel}
              onPress={() => plan.current ? null : null}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
            </Button>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  currentPlan: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.primaryContainer + '20', borderRadius: 16, padding: 16, marginBottom: 20,
  },
  currentLabel: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '600' },
  currentValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  planCard: {
    backgroundColor: colors.surfaceContainerLowest, borderRadius: 20, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: colors.outlineVariant + '30',
  },
  planRecommended: { borderColor: colors.primary, borderWidth: 2 },
  planCurrent: { borderColor: colors.primary + '50' },
  recBadge: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 10 },
  recText: { fontSize: 9, fontWeight: '800', color: colors.onPrimary, letterSpacing: 1 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  planName: { fontSize: 18, fontWeight: '800', color: colors.onSurface },
  planPrice: { fontSize: 24, fontWeight: '800', color: colors.primary },
  planPeriod: { fontSize: 12, color: colors.onSurfaceVariant },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  featureText: { fontSize: 13, color: colors.onSurfaceVariant },
  upgradeBtn: { borderRadius: 24, backgroundColor: colors.primary, marginTop: 12 },
  upgradeBtnLabel: { color: colors.onPrimary, fontWeight: '700' },
  currentBtn: { borderRadius: 24, borderColor: colors.outlineVariant, marginTop: 12 },
  currentBtnLabel: { color: colors.onSurfaceVariant },
});
