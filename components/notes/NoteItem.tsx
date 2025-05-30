import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';
import { Database } from '@/types/supabase';

type Props = {
  note: Database['public']['Tables']['notes']['Row'] & { tags: string[] };
  onPress: () => void;
};

const NoteItem: React.FC<Props> = ({ note, onPress }) => {
  console.log('NoteItem - Received note:', note);

  // Get a random pastel color based on the note's id
  const getNoteColor = () => {
    const colors = [
      Colors.bubble1,
      Colors.bubble2,
      Colors.bubble3,
      Colors.bubble4,
      Colors.bubble5,
      Colors.bubble6,
    ];

    // Use a hash of the note id to pick a consistent color
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };

    const index = Math.abs(hashCode(note.id)) % colors.length;
    return colors[index];
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <GlassCard
        style={[styles.card, { borderTopColor: getNoteColor() }] as any}
      >
        <View style={styles.container}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>

          <Text style={styles.content} numberOfLines={4}>
            {note.content || ''}
          </Text>

          <Text style={styles.date}>
            {dayjs(note.updated_at).format('MMM D, YYYY')}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginBottom: 16,
    borderTopWidth: 4,
  },
  container: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
});

export default NoteItem;
