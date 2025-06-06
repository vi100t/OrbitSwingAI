import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Label } from '@/types/task';

interface LabelFilterProps {
  labels: Label[];
  selectedLabels: string[];
  onSelectLabel: (labelId: string) => void;
}

export function LabelFilter({
  labels,
  selectedLabels,
  onSelectLabel,
}: LabelFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {labels.map((label) => (
          <TouchableOpacity
            key={label.id}
            style={[
              styles.filterChip,
              { borderColor: label.color },
              selectedLabels.includes(label.id) && {
                backgroundColor: label.color,
              },
            ]}
            onPress={() => onSelectLabel(label.id)}
          >
            <Text
              style={[
                styles.filterText,
                { color: label.color },
                selectedLabels.includes(label.id) && styles.selectedFilterText,
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
  scrollView: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
});
