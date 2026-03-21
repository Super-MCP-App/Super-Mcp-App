import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { signUp, signInWithGoogle } from '../services/supabase';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert('Success', 'Account created! Let\'s set up your profile.', [
        { text: 'Continue', onPress: () => navigation.navigate('Onboarding1') }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Super Mcp today</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            activeOutlineColor={colors.primary}
            outlineColor={colors.outlineVariant}
            left={<TextInput.Icon icon="account-outline" />}
          />
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
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
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
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
            labelStyle={styles.registerLabel}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            mode="outlined"
            onPress={() => signInWithGoogle()}
            style={styles.googleButton}
            labelStyle={styles.googleLabel}
            contentStyle={styles.buttonContent}
            icon="google"
            textColor={colors.onSurface}
          >
            Continue with Google
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            labelStyle={styles.linkLabel}
          >
            Already have an account? Sign In
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  logoText: { color: colors.onPrimary, fontSize: 28, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', color: colors.onSurface },
  subtitle: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  form: { gap: 16 },
  input: { backgroundColor: 'transparent' },
  inputOutline: { borderRadius: 12 },
  registerButton: { borderRadius: 28, backgroundColor: colors.primary, elevation: 4, marginTop: 8 },
  registerLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  buttonContent: { height: 52 },
  linkLabel: { color: colors.primary, fontSize: 13 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  divider: { flex: 1, height: 1, backgroundColor: colors.outlineVariant + '40' },
  dividerText: { marginHorizontal: 16, fontSize: 12, color: colors.onSurfaceVariant, fontWeight: '600' },
  googleButton: { borderRadius: 28, borderColor: colors.outlineVariant, borderWidth: 1 },
  googleLabel: { fontWeight: '600', fontSize: 15 },
});
