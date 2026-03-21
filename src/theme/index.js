import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primaryContainer,
    onPrimaryContainer: colors.onPrimaryContainer,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryContainer,
    onSecondaryContainer: colors.onSecondaryContainer,
    tertiary: colors.tertiary,
    tertiaryContainer: colors.tertiaryContainer,
    onTertiaryContainer: colors.onTertiaryContainer,
    surface: colors.surface,
    onSurface: colors.onSurface,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.onSurfaceVariant,
    background: colors.background,
    onBackground: colors.onBackground,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    error: colors.error,
    errorContainer: colors.errorContainer,
    onError: colors.onError,
    inverseSurface: colors.inverseSurface,
    inversePrimary: colors.inversePrimary,
    surfaceDisabled: colors.surfaceContainerHigh,
    elevation: {
      level0: colors.surfaceContainerLowest,
      level1: colors.surfaceContainerLow,
      level2: colors.surfaceContainer,
      level3: colors.surfaceContainerHigh,
      level4: colors.surfaceContainerHighest,
      level5: colors.surfaceContainerHighest,
    },
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export { colors };
