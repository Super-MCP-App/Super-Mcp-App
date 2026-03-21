import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <View style={styles.glowDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.25, transform: [{ scale: 1 - i * 0.15 }] }]} />
            ))}
          </View>
        </View>
        <Text style={styles.title}>Super Mcp</Text>
        <Text style={styles.subtitle}>Your intelligent workspace powered by AI</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          { icon: 'chat-processing-outline', label: 'AI Chat', desc: 'NVIDIA Nemotron Ultra' },
          { icon: 'link-variant', label: 'MCP Apps', desc: 'Figma, Canva & more' },
          { icon: 'clipboard-check-outline', label: 'Smart Tasks', desc: 'Automated workflows' },
        ].map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <MaterialCommunityIcons name={f.icon} size={22} color={colors.primary} />
            <Text style={styles.featureLabel}>{f.label}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Register')}
          style={styles.primaryBtn}
          labelStyle={styles.primaryLabel}
          contentStyle={styles.btnContent}
        >
          Get Started
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryBtn}
          labelStyle={styles.secondaryLabel}
          contentStyle={styles.btnContent}
        >
          I already have an account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingTop: 80 },
  logoContainer: { position: 'relative', marginBottom: 24 },
  logo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16,
  },
  logoText: { color: colors.onPrimary, fontSize: 32, fontWeight: '800' },
  glowDots: { position: 'absolute', top: -4, right: -4, gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  title: { fontSize: 34, fontWeight: '800', color: colors.onSurface, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 8, maxWidth: 260 },
  features: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  featureCard: {
    flex: 1, padding: 16, backgroundColor: colors.surfaceContainerLowest, borderRadius: 16,
    alignItems: 'center', gap: 6,
  },
  featureLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurface },
  featureDesc: { fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center' },
  actions: { gap: 12 },
  primaryBtn: { borderRadius: 28, backgroundColor: colors.primary, elevation: 6 },
  primaryLabel: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  secondaryBtn: { borderRadius: 28, borderColor: colors.outlineVariant, borderWidth: 1.5 },
  secondaryLabel: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  btnContent: { height: 52 },
});
