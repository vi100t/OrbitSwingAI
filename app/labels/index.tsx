import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import GlassCard from '@/components/ui/GlassCard';
import { useSupabase } from '@/hooks/useSupabase';
import { Plus, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = [
  '#FF6B6B', // Red
  '#FF9F43', // Orange
  '#FFD93D', // Yellow
  '#6BCB77', // Green
  '#4D96FF', // Blue
  '#9B59B6', // Purple
  '#E84393', // Pink
  '#00B894', // Teal
];

export default function LabelsScreen() {
  const router = useRouter();
  const { labels, createLabel, deleteLabel, fetchLabels } = useSupabase();
  const { session } = useAuth();
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    fetchLabels();
  }, []);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      Alert.alert('Error', 'Please enter a label name');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to create labels');
      return;
    }

    try {
      await createLabel({
        name: newLabelName.trim(),
        color: selectedColor,
        user_id: session.user.id,
      });
      setNewLabelName('');
    } catch (error) {
      console.error('Error creating label:', error);
      Alert.alert('Error', 'Failed to create label');
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      await deleteLabel(labelId);
    } catch (error) {
      console.error('Error deleting label:', error);
      Alert.alert('Error', 'Failed to delete label');
    }
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="Labels" showBack showNotifications={false} />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          <GlassCard style={styles.card}>
            <View style={styles.createLabelContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.labelInput}
                  value={newLabelName}
                  onChangeText={setNewLabelName}
                  placeholder="New label name"
                  placeholderTextColor={Colors.secondaryText}
                />
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateLabel}
                >
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.colorPicker}>
                {COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.labelsList}>
              {labels.map((label) => (
                <View key={label.id} style={styles.labelItem}>
                  <View style={styles.labelInfo}>
                    <View
                      style={[
                        styles.labelColor,
                        { backgroundColor: label.color },
                      ]}
                    />
                    <Text style={styles.labelName}>{label.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteLabel(label.id)}
                  >
                    <X size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </GlassCard>
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
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
  },
  createLabelContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  labelInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: Colors.primary,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelsList: {
    gap: 12,
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  labelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  labelName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.text,
  },
  deleteButton: {
    padding: 4,
  },
});
