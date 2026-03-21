import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors } from '../theme/colors';

export default function OnboardingStep3({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '100%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Choose your plan</Text>

        {/* Free Plan */}
        <View style={styles.planCard}>
          <Text style={styles.planName}>Free</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$0</Text>
            <Text style={styles.priceUnit}>/mo</Text>
          </View>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• 100 AI messages per day</Text>
            <Text style={styles.feature}>• 2 connected apps</Text>
            <Text style={styles.feature}>• Basic analytics</Text>
          </View>
          <Button
            mode="outlined"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            style={styles.freePlanButton}
            labelStyle={styles.freePlanLabel}
            contentStyle={styles.buttonContent}
          >
            Start Free
          </Button>
        </View>

        {/* Pro Plan */}
        <View style={styles.proCard}>
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
          <Text style={styles.planName}>Pro</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>$12</Text>
            <Text style={styles.priceUnit}>/mo</Text>
          </View>
          <View style={styles.featureList}>
            <Text style={styles.feature}>• Unlimited AI messages</Text>
            <Text style={styles.feature}>• Unlimited apps</Text>
            <Text style={styles.feature}>• Advanced analytics</Text>
            <Text style={styles.feature}>• Priority support</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            style={styles.proPlanButton}
            labelStyle={styles.proPlanLabel}
            contentStyle={styles.buttonContent}
          >
            Start Pro Trial
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  planCard: {
    padding: 24,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant + '30',
    marginBottom: 16,
  },
  proCard: {
    padding: 24,
    backgroundColor: colors.primaryContainer,
    borderRadius: 16,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    position: 'relative',
    overflow: 'visible',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: colors.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.onSurface,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onSurface,
  },
  priceUnit: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginLeft: 4,
  },
  featureList: {
    marginTop: 16,
    gap: 6,
  },
  feature: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  freePlanButton: {
    borderRadius: 28,
    borderColor: colors.primary,
    borderWidth: 1.5,
    marginTop: 24,
  },
  freePlanLabel: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  proPlanButton: {
    borderRadius: 28,
    backgroundColor: colors.primary,
    elevation: 4,
    marginTop: 24,
  },
  proPlanLabel: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  buttonContent: {
    height: 48,
  },
});
