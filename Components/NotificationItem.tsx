import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Platform } from 'react-native';

interface StoredReminder {
  id: string;
  name: string;
  phone: string;
  date: string;
  messageType: 'default' | 'custom';
  customMessage?: string;
  created: string;
  sent: boolean;
  notificationId: string | null;
  viewed?: boolean;
}

interface NotificationItemProps {
  item: StoredReminder;
  isMarathi: boolean;
  onRemove: (id: string) => void;
  onMarkAsViewed: (id: string) => void;
}

interface Translations {
  sendReminder: string;
  markAsViewed: string;
  error: string;
  noPhone: string;
  cancel: string;
  messageSent: string;
  messageSentSuccess: string;
  sendVia: string;
  sms: string;
  whatsapp: string;
}

const translations = {
  marathi: {
    sendReminder: 'पाठवा',
    markAsViewed: 'वाचले',
    error: 'त्रुटी',
    noPhone: 'फोन नंबर उपलब्ध नाही',
    cancel: 'रद्द',
    messageSent: 'पाठविले',
    messageSentSuccess: 'स्मरणपत्र यशस्वीरित्या पाठविले.',
    sendVia: 'माध्यम निवडा',
    sms: 'एसएमएस',
    whatsapp: 'व्हाट्सअॅप',
  },
  english: {
    sendReminder: 'Send',
    markAsViewed: 'Mark Read',
    error: 'Error',
    noPhone: 'Phone number not available',
    cancel: 'Cancel',
    messageSent: 'Sent',
    messageSentSuccess: 'Reminder sent successfully.',
    sendVia: 'Select Medium',
    sms: 'SMS',
    whatsapp: 'WhatsApp',
  },
};

const NotificationItem: React.FC<NotificationItemProps> = ({ 
  item, 
  isMarathi, 
  onRemove, 
  onMarkAsViewed 
}) => {
  const t: Translations = isMarathi ? translations.marathi : translations.english;
  
  const scheduledDate = new Date(item.date);
  const now = new Date();
  const isOverdue = scheduledDate < now;
  
  // Calculate time difference
  const timeDiff = now.getTime() - scheduledDate.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursOverdue = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  let timeAgo = '';
  if (daysOverdue > 0) {
    timeAgo = `${daysOverdue}${isMarathi ? 'द' : 'd'}`;
  } else if (hoursOverdue > 0) {
    timeAgo = `${hoursOverdue}${isMarathi ? 'त' : 'h'}`;
  } else {
    timeAgo = isMarathi ? 'आता' : 'now';
  }

  const sendReminderMessage = async () => {
    if (!item.phone) {
      Alert.alert(t.error, t.noPhone);
      return;
    }

    const defaultMessage = `नमस्कार ${item.name}, ही तुम्हाला दिलेली आठवण आहे की तुमच्या उपकरणाची सर्व्हिसिंग बाकी आहे. कृपया 8446682152 या क्रमांकावर संपर्क साधा.`;
    const message = item.customMessage || defaultMessage;
    
    Alert.alert(
      t.sendVia,
      `${item.name} • ${item.phone}`,
      [
        { text: t.cancel, style: "cancel" },
        { text: `📱 ${t.sms}`, onPress: () => sendViaSMS(message) },
        { text: `💬 ${t.whatsapp}`, onPress: () => sendViaWhatsApp(message) }
      ]
    );
  };

  const sendViaSMS = async (message: string) => {
    try {
      const encodedMessage = encodeURIComponent(message);
      const smsUrl = Platform.OS === 'ios' 
        ? `sms:${item.phone}&body=${encodedMessage}`
        : `sms:${item.phone}?body=${encodedMessage}`;
      
      const canOpen = await Linking.canOpenURL(smsUrl);
      if (canOpen) {
        await Linking.openURL(smsUrl);
        onMarkAsViewed(item.id);
        Alert.alert(t.messageSent, t.messageSentSuccess);
      } else {
        Alert.alert(t.error, "SMS app not available");
      }
    } catch (error) {
      Alert.alert(t.error, "Cannot send SMS");
    }
  };

  const sendViaWhatsApp = async (message: string) => {
    try {
      let phoneNumber = item.phone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
        phoneNumber = '91' + phoneNumber;
      }
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        onMarkAsViewed(item.id);
        Alert.alert(t.messageSent, t.messageSentSuccess);
      } else {
        Alert.alert(t.error, "WhatsApp not installed");
      }
    } catch (error) {
      Alert.alert(t.error, "Cannot open WhatsApp");
    }
  };
  
  return (
    <View style={[styles.card, !item.viewed && styles.cardUnread]}>
      <View style={styles.row}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={[styles.iconCircle, !item.viewed && styles.iconCircleUnread]}>
            <Text style={styles.icon}>🔔</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {!item.viewed && <View style={styles.dot} />}
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={[styles.time, isOverdue && styles.overdue]}>
                {scheduledDate.toLocaleDateString(isMarathi ? 'mr-IN' : 'en-IN', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </Text>
              {isOverdue && (
                <>
                  <Text style={styles.separator}>•</Text>
                  <Text style={styles.timeAgo}>{timeAgo}</Text>
                </>
              )}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {item.customMessage || `नमस्कार ${item.name}, ही तुम्हाला दिलेली आठवण आहे...`}
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => onRemove(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.btnPrimary}
          onPress={sendReminderMessage}
          activeOpacity={0.7}
        >
          <Text style={styles.btnPrimaryText}>💬 {t.sendReminder}</Text>
        </TouchableOpacity>
        
        {!item.viewed && (
          <TouchableOpacity 
            style={styles.btnSecondary}
            onPress={() => onMarkAsViewed(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.btnSecondaryText}>✓</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardUnread: {
    backgroundColor: '#F0F8FF',
    borderColor: '#4A90E2',
    borderWidth: 1.5,
  },
  
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  
  leftSection: {
    flexDirection: 'row',
    flex: 1,
  },
  
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconCircleUnread: {
    backgroundColor: '#DBEAFE',
  },
  icon: {
    fontSize: 18,
  },
  
  content: {
    flex: 1,
  },
  
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A90E2',
    marginLeft: 6,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  phone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  separator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#059669',
  },
  overdue: {
    color: '#DC2626',
  },
  timeAgo: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  
  rightSection: {
    marginLeft: 8,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  btnSecondary: {
    width: 44,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  btnSecondaryText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default NotificationItem;