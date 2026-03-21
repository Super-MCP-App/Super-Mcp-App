import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Linking } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabase';

export default function OnboardingStep2({ navigation }) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveKey = async () => {
    if (!apiKey) {
      Alert.alert('Key Required', 'Please enter your NVIDIA API key to enable AI features.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ nvidia_api_key: apiKey })
        .eq('id', user.id);

      if (error) throw error;
      
      navigation.navigate('Onboarding3');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: '66%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>Step 2 of 3</Text>
        <Text style={styles.title}>Enable AI Access</Text>
        <Text style={styles.subtitle}>Super Mcp requires your personal NVIDIA API key to power the AI models. Your key is stored securely and never shared.</Text>

        <View style={styles.form}>
          <TextInput
            label="NVIDIA API Key"
            value={apiKey}
            onChangeText={setApiKey}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="key-outline" />}
          />
          <Button
            mode="text"
            onPress={() => Linking.openURL('https://build.nvidia.com/')}
            labelStyle={styles.linkLabel}
            style={styles.linkButton}
          >
            Get an API key from NVIDIA
          </Button>
        </View>

        <View style={styles.bottomActions}>
          <Button
            mode="contained"
            onPress={handleSaveKey}
            loading={loading}
            disabled={loading}
            style={styles.continueButton}
            labelStyle={styles.continueLabel}
            contentStyle={styles.buttonContent}
          >
            Save & Continue
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Onboarding3')}
            labelStyle={styles.skipLabel}
          >
            Skip (AI will be disabled)
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  scrollContent: {
    flexGrow: 1,
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
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 12,
    lineHeight: 22,
  },
  form: {
    marginTop: 40,
    gap: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  inputOutline: {
    borderRadius: 12,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  linkLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
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
