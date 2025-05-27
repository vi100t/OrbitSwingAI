import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/hooks/useSupabase';
import { UserProfile, NotificationPreferences, WorkHours } from '@/types/user';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading, error, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotificationPreference = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setFormData((prev) => {
      const currentPrefs = prev.notification_preferences || {
        email: true,
        push: true,
        reminders: true,
      };
      return {
        ...prev,
        notification_preferences: {
          ...currentPrefs,
          [key]: value,
        },
      };
    });
  };

  const updateWorkHours = (key: keyof WorkHours, value: string | number[]) => {
    setFormData((prev) => {
      const currentHours = prev.work_hours || {
        start: '09:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5],
      };
      return {
        ...prev,
        work_hours: {
          ...currentHours,
          [key]: value,
        },
      };
    });
  };

  if (loading) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Profile Settings" />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  if (error) {
    return (
      <GlassBg>
        <SafeAreaView style={styles.container} edges={['top']}>
          <Header title="Profile Settings" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading profile</Text>
          </View>
        </SafeAreaView>
      </GlassBg>
    );
  }

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Profile Settings" />
        <ScrollView style={styles.content}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, first_name: text }))
                }
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, last_name: text }))
                }
                placeholder="Enter last name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={formData.display_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, display_name: text }))
                }
                placeholder="Enter display name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, bio: text }))
                }
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Theme</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.theme || 'system'}
                  onValueChange={(value: 'system' | 'light' | 'dark') =>
                    setFormData((prev) => ({ ...prev, theme: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="System" value="system" />
                  <Picker.Item label="Light" value="light" />
                  <Picker.Item label="Dark" value="dark" />
                </Picker>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Language</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.language || 'en'}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, language: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="English" value="en" />
                  <Picker.Item label="Spanish" value="es" />
                  <Picker.Item label="French" value="fr" />
                </Picker>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Timezone</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.timezone || 'UTC'}
                  onValueChange={(value: string) =>
                    setFormData((prev) => ({ ...prev, timezone: value }))
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="UTC" value="UTC" />
                  <Picker.Item label="EST" value="America/New_York" />
                  <Picker.Item label="PST" value="America/Los_Angeles" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            <View style={styles.switchGroup}>
              <Text style={styles.label}>Email Notifications</Text>
              <Switch
                value={formData.notification_preferences?.email ?? true}
                onValueChange={(value) =>
                  updateNotificationPreference('email', value)
                }
              />
            </View>
            <View style={styles.switchGroup}>
              <Text style={styles.label}>Push Notifications</Text>
              <Switch
                value={formData.notification_preferences?.push ?? true}
                onValueChange={(value) =>
                  updateNotificationPreference('push', value)
                }
              />
            </View>
            <View style={styles.switchGroup}>
              <Text style={styles.label}>Reminders</Text>
              <Switch
                value={formData.notification_preferences?.reminders ?? true}
                onValueChange={(value) =>
                  updateNotificationPreference('reminders', value)
                }
              />
            </View>
          </View>

          {/* Work Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Hours</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                value={formData.work_hours?.start || '09:00'}
                onChangeText={(text) => updateWorkHours('start', text)}
                placeholder="09:00"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                value={formData.work_hours?.end || '17:00'}
                onChangeText={(text) => updateWorkHours('end', text)}
                placeholder="17:00"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GlassBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.error,
  },
});
