import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBg from '@/components/ui/GlassBg';
import Header from '@/components/shared/Header';
import Colors from '@/constants/Colors';
import GlassCard from '@/components/ui/GlassCard';
import { Plus, X } from 'lucide-react-native';
import { useSupabase } from '@/hooks/useSupabase';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = [
  '#7C4DFF', // Purple
  '#FF4081', // Pink
  '#FF6D00', // Orange
  '#00BFA5', // Teal
  '#FFD600', // Yellow
  '#2979FF', // Blue
  '#FF1744', // Red
  '#00E676', // Green
];

export default function LabelsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { labels, createLabel, deleteLabel, fetchLabels } = useSupabase();
  const { session } = useAuth();
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    fetchLabels();
  }, []);

  useEffect(() => {
    if (params.selectedLabels) {
      try {
        const parsedLabels = JSON.parse(params.selectedLabels as string);
        setSelectedLabels(parsedLabels);
      } catch (error) {
        console.error('Error parsing selected labels:', error);
      }
    }
  }, [params.selectedLabels]);

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
      setSelectedLabels((prev) => prev.filter((id) => id !== labelId));
    } catch (error) {
      console.error('Error deleting label:', error);
      Alert.alert('Error', 'Failed to delete label');
    }
  };

  const handleLabelSelect = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSave = () => {
    const path =
      params.from === 'edit' ? `/tasks/${params.taskId}` : '/tasks/new';
    router.push({
      pathname: path,
      params: {
        selectedLabels: JSON.stringify(selectedLabels),
        from: params.from,
        taskId: params.taskId,
      },
    });
  };

  return (
    <GlassBg>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header
          title="Labels"
          showBack
          showNotifications={false}
          rightComponent={
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Done</Text>
            </TouchableOpacity>
          }
        />

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
                <View
                  key={label.id}
                  style={[
                    styles.labelItem,
                    selectedLabels.includes(label.id) &&
                      styles.selectedLabelItem,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.labelInfo}
                    onPress={() => handleLabelSelect(label.id)}
                  >
                    <View
                      style={[
                        styles.labelColor,
                        { backgroundColor: label.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.labelName,
                        selectedLabels.includes(label.id) &&
                          styles.selectedLabelName,
                      ]}
                    >
                      {label.name}
                    </Text>
                  </TouchableOpacity>
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
  selectedLabelItem: {
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
  },
  labelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
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
  selectedLabelName: {
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
