import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Label } from '@/types/task';

interface LabelSelectorProps {
  labels: Label[];
  selectedLabels: string[];
  onSelectLabel: (labelId: string) => void;
}

export function LabelSelector({
  labels,
  selectedLabels,
  onSelectLabel,
}: LabelSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Labels</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {labels.map((label) => (
          <TouchableOpacity
            key={label.id}
            style={[
              styles.labelChip,
              { backgroundColor: label.color },
              selectedLabels.includes(label.id) && styles.selectedLabelChip,
            ]}
            onPress={() => onSelectLabel(label.id)}
          >
            <Text
              style={[
                styles.labelText,
                selectedLabels.includes(label.id) && styles.selectedLabelText,
              ]}
            >
              {label.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  scrollView: {
    flexDirection: 'row',
  },
  labelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  selectedLabelChip: {
    opacity: 0.8,
  },
  labelText: {
    fontSize: 14,
    color: '#1F2937',
  },
  selectedLabelText: {
    color: '#FFFFFF',
  },
});
