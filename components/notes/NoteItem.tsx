import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import GlassCard from '@/components/ui/GlassCard';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';
import { Database } from '@/types/supabase';
import { Tag } from 'lucide-react-native';

type Props = {
  note: {
    id: string;
    user_id: string;
    title: string;
    content: string | null;
    created_at: string;
    updated_at: string;
    tags?: string[];
  };
  onPress: () => void;
};

const NoteItem: React.FC<Props> = ({ note, onPress }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [shouldFade, setShouldFade] = useState(false);
  const tagsContainerRef = useRef<View>(null);

  useEffect(() => {
    if (note.tags && containerWidth > 0) {
      const tagWidth = 80;
      const maxTags = Math.floor((containerWidth - 20) / tagWidth);
      setShouldFade(note.tags.length > maxTags);
    }
  }, [note.tags, containerWidth]);

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
          <View style={styles.topSection}>
            <Text style={styles.title} numberOfLines={1}>
              {note.title || 'Untitled Note'}
            </Text>

            <Text style={styles.content} numberOfLines={8}>
              {note.content || ''}
            </Text>
          </View>

          <View style={styles.bottomSection}>
            {note.tags && note.tags.length > 0 && (
              <View
                style={styles.tagsContainer}
                ref={tagsContainerRef}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
              >
                {note.tags?.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.tag,
                      shouldFade &&
                        index === (note.tags?.length ?? 0) - 1 &&
                        styles.fadeTag,
                    ]}
                  >
                    <Tag size={12} color={Colors.primary} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.date}>
              {dayjs(note.updated_at).format('MMM D, YYYY')}
            </Text>
          </View>
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
    borderTopWidth: 4,
    // marginBottom: 16,
  },
  container: {
    padding: 12,
  },
  topSection: {
    marginBottom: 12,
  },
  bottomSection: {
    marginTop: 'auto',
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
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
    marginBottom: 8,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 77, 255, 0.1)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 3,
  },
  date: {
    fontSize: 12,
    color: Colors.secondaryText,
    textAlign: 'right',
  },
  fadeTag: {
    opacity: 0.3,
  },
});

export default NoteItem;
