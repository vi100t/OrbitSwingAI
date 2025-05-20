import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import { Note } from '@/types/note';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';

type Props = {
  note: Note;
  onPress: () => void;
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 50) / 2; // Accounting for margins and padding

const NoteItem: React.FC<Props> = ({ note, onPress }) => {
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
      <GlassCard style={[styles.card, { borderTopColor: getNoteColor() }]}>
        <View style={styles.container}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>
          
          <Text style={styles.content} numberOfLines={4}>
            {note.content}
          </Text>
          
          <Text style={styles.date}>
            {dayjs(note.updatedAt).format('MMM D, YYYY')}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 180,
    marginBottom: 16,
    borderTopWidth: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  content: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.secondaryText,
    lineHeight: 20,
    flex: 1,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 8,
  },
});

export default NoteItem;