import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const services = [
  { icon: 'cloud-outline', name: 'Cloud Store' },
  { icon: 'file-document-outline', name: 'Documents' },
  { icon: 'code-tags', name: 'Dev Tools' },
  { icon: 'shopping-outline', name: 'E-Commerce' },
  { icon: 'palette-outline', name: 'Design' },
  { icon: 'forum-outline', name: 'Messaging' },
];

export default function OnboardingStep2({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>

      <Text style={styles.step}>Step 2 of 3</Text>
      <Text style={styles.title}>Connect an app</Text>

      <View style={styles.grid}>
        {services.map((service, idx) => (
          <View key={idx} style={styles.serviceCard}>
            <MaterialCommunityIcons
              name={service.icon}
              size={32}
              color={colors.primary}
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceName}>{service.name}</Text>
            <TouchableOpacity style={styles.connectButton} activeOpacity={0.7}>
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.bottomActions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Onboarding3')}
          style={styles.continueButton}
          labelStyle={styles.continueLabel}
          contentStyle={styles.buttonContent}
        >
          Continue
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('MainTabs')}
          labelStyle={styles.skipLabel}
        >
          Skip
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
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onSurface,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 32,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant + '18',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  serviceIcon: {
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 12,
  },
  connectButton: {
    width: '100%',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSecondaryContainer,
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
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
});
