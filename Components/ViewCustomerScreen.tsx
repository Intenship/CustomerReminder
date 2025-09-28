import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  StatusBar,
  Platform,
  Share,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList, Customer } from "../types";
import { db } from "../firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";

type ViewCustomerNavProp = NativeStackNavigationProp<RootStackParamList, "ViewCustomer">;
type ViewCustomerRouteProp = RouteProp<RootStackParamList, "ViewCustomer">;

type Props = {
  navigation: ViewCustomerNavProp;
  route: ViewCustomerRouteProp;
};

export default function ViewCustomerScreen({ navigation, route }: Props) {
  const { customer } = route.params;
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    navigation.navigate("AddCustomer", { customerToEdit: customer });
  };

  const handleCall = () => {
    if (!customer.phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    Alert.alert(
      "Call Customer",
      `Call ${customer.name}?\n${customer.phone}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${customer.phone}`).catch((error) => {
              console.error("Failed to make call:", error);
              Alert.alert("Error", "Unable to make phone call");
            });
          }
        }
      ]
    );
  };

  const handleMessage = () => {
    if (!customer.phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    Alert.alert(
      "Send Message",
      `Send SMS to ${customer.name}?\n${customer.phone}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => {
            Linking.openURL(`sms:${customer.phone}`).catch((error) => {
              console.error("Failed to send message:", error);
              Alert.alert("Error", "Unable to send message");
            });
          }
        }
      ]
    );
  };

  // NEW: Handle map navigation
  const handleNavigate = () => {
    if (!customer.address) {
      Alert.alert("Error", "No address available for navigation");
      return;
    }

    Alert.alert(
      "Navigate to Customer",
      `Open maps and navigate to:\n${customer.address}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Navigate",
          onPress: () => {
            openMapsApp(customer.address);
          }
        }
      ]
    );
  };

  // NEW: Open maps app with navigation
  const openMapsApp = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    
    // Try different map apps based on platform
    const mapUrls: string[] = Platform.select({
      ios: [
        `maps:0,0?q=${encodedAddress}`, // Apple Maps
        `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`, // Google Maps
        `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
      ],
      android: [
        `google.navigation:q=${encodedAddress}`, // Google Maps Navigation
        `geo:0,0?q=${encodedAddress}`, // Generic maps intent
        `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
      ],
      default: [
        `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
      ]
    }) || [
      `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
    ];

    // Try to open the first available map app
    const tryOpenMaps = async (urls: string[]) => {
      for (const url of urls) {
        try {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
            return true;
          }
        } catch (error) {
          console.log(`Failed to open ${url}:`, error);
          continue;
        }
      }
      return false;
    };

    tryOpenMaps(mapUrls).then((success) => {
      if (!success) {
        Alert.alert(
          "Error", 
          "Unable to open maps application. Please check if you have a maps app installed."
        );
      }
    });
  };

  const handleShare = async () => {
    try {
      const shareContent = `Customer Details:
Name: ${customer.name}
Phone: ${customer.phone || 'N/A'}
Address: ${customer.address || 'N/A'}
${customer.notifyDate ? `Reminder: ${new Date(customer.notifyDate).toLocaleDateString()}` : ''}
${customer.customMessage ? `Message: ${customer.customMessage}` : ''}`;

      await Share.share({
        message: shareContent,
        title: `${customer.name} - Contact Details`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customer.name}?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteDoc(doc(db, "customers", customer.id));
              Alert.alert(
                "Success", 
                `${customer.name} has been deleted successfully.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete customer. Please try again.");
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCreatedDate = (date: Date | string) => {
    if (!date) return 'Unknown';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {customer.photoURL ? (
              <Image 
                source={{ uri: customer.photoURL }} 
                style={styles.profileImage}
                onError={(error) => console.log("Image load error:", error)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {customer.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.customerName}>{customer.name || "Unnamed Customer"}</Text>
          <Text style={styles.customerSince}>
            Customer since {formatCreatedDate(customer.createdAt)}
          </Text>
          
          {customer.notifyDate && (
            <View style={styles.reminderBadge}>
              <Text style={styles.reminderIcon}>🔔</Text>
              <Text style={styles.reminderText}>Reminder Set</Text>
            </View>
          )}
        </View>

        {/* Quick Actions - UPDATED with Navigate action */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.actionCard, styles.callAction]} onPress={handleCall}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionTitle}>Call</Text>
            <Text style={styles.actionSubtitle}>Make a call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, styles.messageAction]} onPress={handleMessage}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>Message</Text>
            <Text style={styles.actionSubtitle}>Send SMS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.navigateAction]} 
            onPress={handleNavigate}
            disabled={!customer.address}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>Navigate</Text>
            <Text style={styles.actionSubtitle}>Open maps</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, styles.editAction]} onPress={handleEdit}>
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionTitle}>Edit</Text>
            <Text style={styles.actionSubtitle}>Modify details</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>👤</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{customer.name || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📞</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <TouchableOpacity onPress={handleCall}>
                  <Text style={[styles.infoValue, styles.phoneValue]}>
                    {customer.phone || "Not provided"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📍</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                {/* UPDATED: Made address clickable for navigation */}
                <TouchableOpacity onPress={handleNavigate} disabled={!customer.address}>
                  <Text style={[
                    styles.infoValue, 
                    customer.address ? styles.addressValue : null
                  ]}>
                    {customer.address || "Not provided"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Reminder Information */}
        {(customer.notifyDate || customer.customMessage) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Details</Text>
            
            <View style={styles.infoCard}>
              {customer.notifyDate && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.icon}>🗓️</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Reminder Date</Text>
                    <Text style={styles.infoValue}>{formatDate(customer.notifyDate)}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Text style={styles.icon}>📨</Text>
                </View>
                <View style={styles.infoContent}>
                  {/* <Text style={styles.infoLabel}>Notification Method</Text>
                  <Text style={styles.infoValue}>
                    {customer.notificationMethod === 'sms' ? 'SMS' : 
                     customer.notificationMethod === 'email' ? 'Email' : 'SMS'}
                  </Text> */}
                </View>
              </View>

              {customer.customMessage && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.icon}>💭</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Custom Message</Text>
                    <Text style={styles.infoValue}>{customer.customMessage}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📅</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date Added</Text>
                <Text style={styles.infoValue}>{formatDate(customer.createdAt)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>🆔</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Customer ID</Text>
                <Text style={styles.infoValueSmall}>{customer.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
            <View style={styles.deleteContent}>
              <Text style={styles.deleteTitle}>
                {deleting ? "Deleting..." : "Delete Customer"}
              </Text>
              <Text style={styles.deleteSubtitle}>
                This action cannot be undone
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#007bff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareIcon: {
    fontSize: 16,
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    borderWidth: 4,
    borderColor: "#fff",
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  customerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
    textAlign: "center",
  },
  customerSince: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  reminderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#c3e6c3",
  },
  reminderIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  reminderText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8, // Reduced gap to fit 4 items
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12, // Reduced padding
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  callAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  messageAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  // NEW: Navigate action styling
  navigateAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b35",
  },
  editAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  actionIcon: {
    fontSize: 20, // Reduced icon size
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12, // Reduced font size
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 10, // Reduced font size
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
    lineHeight: 22,
  },
  infoValueSmall: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  phoneValue: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  // NEW: Address value styling
  addressValue: {
    color: "#ff6b35",
    textDecorationLine: "underline",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#ffcdd2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc3545",
  },
  deleteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  deleteContent: {
    flex: 1,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 2,
  },
  deleteSubtitle: {
    fontSize: 12,
    color: "#999",
  },
});