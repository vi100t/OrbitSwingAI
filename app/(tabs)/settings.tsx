import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import GlassCard from '@/components/ui/GlassCard';
import {
  ChevronRight,
  Bell,
  CloudSun as CloudSync,
  Moon,
  CircleHelp as HelpCircle,
  BookOpen,
  User,
} from 'lucide-react-native';
import { useStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useStore();
  const { signOut } = useAuth();

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const SettingSwitch = ({
    title,
    description,
    value,
    onToggle,
    icon,
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D1D6', true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : '#F4F4F4'}
      />
    </View>
  );

  const SettingLink = ({
    title,
    icon,
    onPress,
  }: {
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <View style={styles.settingIcon}>{icon}</View>
      <Text style={styles.linkTitle}>{title}</Text>
      <ChevronRight size={20} color={Colors.secondaryText} />
    </TouchableOpacity>
  );

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Settings" />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Account</Text>

          <GlassCard style={styles.card}>
            <SettingLink
              title="Profile Settings"
              icon={<User size={22} color={Colors.primary} />}
              onPress={() => router.push('/settings/profile')}
            />
          </GlassCard>

          <Text style={styles.sectionTitle}>App Settings</Text>

          <GlassCard style={styles.card}>
            <SettingSwitch
              title="Notifications"
              description="Receive reminders for tasks and habits"
              value={settings.notifications}
              onToggle={() => toggleSetting('notifications')}
              icon={<Bell size={22} color={Colors.primary} />}
            />

            <View style={styles.divider} />

            <SettingSwitch
              title="Dark Mode"
              description="Use dark theme throughout the app"
              value={settings.darkMode}
              onToggle={() => toggleSetting('darkMode')}
              icon={<Moon size={22} color={Colors.primary} />}
            />

            <View style={styles.divider} />

            <SettingSwitch
              title="Cloud Sync"
              description="Sync your data across all devices"
              value={settings.cloudSync}
              onToggle={() => toggleSetting('cloudSync')}
              icon={<CloudSync size={22} color={Colors.primary} />}
            />
          </GlassCard>

          <Text style={styles.sectionTitle}>Help & Support</Text>

          <GlassCard style={styles.card}>
            <SettingLink
              title="Tutorials"
              icon={<BookOpen size={22} color={Colors.primary} />}
              onPress={() => {}}
            />

            <View style={styles.divider} />

            <SettingLink
              title="Help Center"
              icon={<HelpCircle size={22} color={Colors.primary} />}
              onPress={() => {}}
            />
          </GlassCard>

          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginVertical: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkTitle: {
    flex: 1,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
  },
  appVersion: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
  },
  spacer: {
    height: 100,
  },
});
