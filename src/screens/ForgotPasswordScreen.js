import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors } from '../theme/colors';

// Ensure you replace this URL with your local dev IP (e.g., http://192.168.1.10:3000/api/auth) 
// or production URL when deploying.
const API_URL = 'https://super-mcp-app.vercel.app/api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      Alert.alert('OTP Sent', 'Check your email for the 6-digit OTP.');
      setStep(2);
    } catch (error) {
      Alert.alert('Error', error.message || 'Check your internet connection or backend URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Error', 'Please enter the OTP and a new password');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      Alert.alert('Success', 'Your password has been reset successfully. You can now log in.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message || 'Check your internet connection or backend URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Enter your email to receive an OTP' 
              : 'Enter the OTP and your new password'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                activeOutlineColor={colors.primary}
                outlineColor={colors.outlineVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email-outline" />}
              />

              <Button
                mode="contained"
                onPress={handleSendOtp}
                loading={loading}
                disabled={loading}
                style={styles.actionButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="6-Digit OTP"
                value={otp}
                onChangeText={setOtp}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                activeOutlineColor={colors.primary}
                outlineColor={colors.outlineVariant}
                keyboardType="number-pad"
                maxLength={6}
                left={<TextInput.Icon icon="lock-plus-outline" />}
              />
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                activeOutlineColor={colors.primary}
                outlineColor={colors.outlineVariant}
                secureTextEntry={secureText}
                left={<TextInput.Icon icon="lock-outline" />}
                right={<TextInput.Icon icon={secureText ? 'eye-off' : 'eye'} onPress={() => setSecureText(!secureText)} />}
              />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                style={styles.actionButton}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          )}

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            labelStyle={styles.linkLabel}
            disabled={loading}
          >
            Back to Login
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: colors.onPrimary, fontSize: 28, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderRadius: 12 },
  actionButton: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4, marginTop: 8 },
  buttonLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  buttonContent: { height: 52 },
  linkLabel: { color: colors.primary, fontSize: 13 },
});
