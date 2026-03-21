import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

// Auth & Onboarding
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingStep1 from '../screens/OnboardingStep1';
import OnboardingStep2 from '../screens/OnboardingStep2';
import OnboardingStep3 from '../screens/OnboardingStep3';

// Main Tabs
import HomeScreen from '../screens/HomeScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import UsageScreen from '../screens/UsageScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Detail
import ChatScreen from '../screens/ChatScreen';
import BillingScreen from '../screens/BillingScreen';
import ConnectedAppsScreen from '../screens/ConnectedAppsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const tabConfig = [
  { name: 'Home', icon: 'home', iconOutline: 'home-outline', component: HomeScreen },
  { name: 'Chat', icon: 'chat', iconOutline: 'chat-outline', component: ConversationsScreen },
  { name: 'Apps', icon: 'view-grid', iconOutline: 'view-grid-outline', component: UsageScreen },
  { name: 'Tasks', icon: 'clipboard-check', iconOutline: 'clipboard-check-outline', component: TasksScreen },
  { name: 'Profile', icon: 'account', iconOutline: 'account-outline', component: ProfileScreen },
];

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'rgba(255,255,255,0.92)',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          paddingBottom: 0,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
        tabBarActiveTintColor: colors.onPrimaryContainer,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      {tabConfig.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <View style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
              ]}>
                <MaterialCommunityIcons
                  name={focused ? tab.icon : tab.iconOutline}
                  size={22}
                  color={focused ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator({ initialRoute = 'Welcome' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
          gestureEnabled: true,
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Onboarding */}
        <Stack.Screen name="Onboarding1" component={OnboardingStep1} />
        <Stack.Screen name="Onboarding2" component={OnboardingStep2} />
        <Stack.Screen name="Onboarding3" component={OnboardingStep3} />

        {/* Main */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detail Screens */}
        <Stack.Screen name="ChatDetail" component={ChatScreen} />
        <Stack.Screen name="Billing" component={BillingScreen} />
        <Stack.Screen name="ConnectedApps" component={ConnectedAppsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 56,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainerActive: {
    backgroundColor: colors.secondaryContainer,
  },
});
