import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Mic, Bell, ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

type Props = {
  title: string;
  showBack?: boolean;
  showVoice?: boolean;
  showNotifications?: boolean;
  onVoicePress?: () => void;
};

const Header: React.FC<Props> = ({
  title,
  showBack = false,
  showVoice = false,
  showNotifications = true,
  onVoicePress,
}) => {
  const router = useRouter();

  // Create a background component that adapts to the platform
  const Background = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
      return <View style={styles.headerBgWeb}>{children}</View>;
    }
    return (
      <BlurView intensity={40} tint="light" style={styles.headerBg}>
        {children}
      </BlurView>
    );
  };

  return (
    <Background>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightContainer}>
          {showVoice && (
            <TouchableOpacity onPress={onVoicePress} style={styles.iconButton}>
              <Mic size={20} color={Colors.text} />
            </TouchableOpacity>
          )}

          {showNotifications && (
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 1,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.glassShadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerBgWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Colors.text,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});

export default Header;
