import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const options = [
  { icon: 'account', title: 'Personal Use', desc: 'For individual projects' },
  { icon: 'account-group', title: 'Team Workspace', desc: 'Collaborate with squads' },
  { icon: 'briefcase', title: 'Agency / Business', desc: 'Scale production' },
];

export default function OnboardingStep1({ navigation }) {
  const [selected, setSelected] = useState(0);

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '33%' }]} />
      </View>

      <Text style={styles.step}>Step 1 of 3</Text>
      <Text style={styles.title}>How will you use it?</Text>

      <View style={styles.options}>
        {options.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.optionCard, selected === idx && styles.optionCardActive]}
            onPress={() => setSelected(idx)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, selected === idx && styles.iconCircleActive]}>
              <MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionDesc}>{item.desc}</Text>
            </View>
            {selected === idx && (
              <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomActions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Onboarding2')}
          style={styles.continueButton}
          labelStyle={styles.continueLabel}
          contentStyle={styles.buttonContent}
        >
          Continue
        </Button>

      </View>
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
  step: {
    fontSize: 13,
    color: colors.secondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  options: {
    marginTop: 32,
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.outlineVariant + '50',
    backgroundColor: colors.surfaceContainerLowest,
  },
  optionCardActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryContainer + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onSurface,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  bottomActions: {
    marginTop: 'auto',
    paddingBottom: 40,
    gap: 8,
  },
  continueButton: {
    borderRadius: 28,
    backgroundColor: colors.primary,
    elevation: 4,
  },
  continueLabel: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonContent: {
    height: 52,
  },
  skipLabel: {
    color: colors.primary,
    fontWeight: '600',
  },
});
