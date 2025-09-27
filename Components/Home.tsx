// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  StatusBar,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Customer } from "../types";
import { db, auth } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
type Props = { navigation: HomeNavProp };

export default function HomeScreen({ navigation }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            name: data.name,
            phone: data.phone,
            address: data.address,
            photoURL: data.photoURL ?? data.photo ?? null,
            // If notifyDate is a Firestore Timestamp, convert to JS Date
            notifyDate:
              data.notifyDate && data.notifyDate.toDate ? data.notifyDate.toDate() : data.notifyDate,
            createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null,
          } as Customer;
        });
        setCustomers(list);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.error("onSnapshot error:", error);
        setLoading(false);
        setRefreshing(false);
        
        // Handle permission errors more gracefully
        if (error.code === 'permission-denied') {
          Alert.alert(
            "Permission Error",
            "You don't have permission to access this data. Please check your Firestore rules.",
            [
              { text: "Retry", onPress: () => setLoading(true) },
              { text: "Logout", onPress: handleLogout }
            ]
          );
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // The onSnapshot listener will automatically handle the refresh
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleCallCustomer = (phone: string) => {
    Alert.alert(
      "Call Customer",
      `Call ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert("Error", "Unable to make phone call");
            });
          }
        }
      ]
    );
  };

  const handleMessageCustomer = (phone: string) => {
    Alert.alert(
      "Send Message",
      `Send SMS to ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => {
            Linking.openURL(`sms:${phone}`).catch(() => {
              Alert.alert("Error", "Unable to send message");
            });
          }
        }
      ]
    );
  };

  const renderCustomerCard = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => {
        // Navigate to customer details or edit screen when implemented
        Alert.alert("Customer Details", `View details for ${item.name}`);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.photoContainer}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.customerPhoto} />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>
                {item.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <TouchableOpacity onPress={() => handleCallCustomer(item.phone)}>
            <Text style={styles.customerPhone}>📞 {item.phone}</Text>
          </TouchableOpacity>
          <Text style={styles.customerAddress} numberOfLines={2}>
            📍 {item.address}
          </Text>
          {item.notifyDate && (
            <Text style={styles.notificationDate}>
              🔔 Reminder: {new Date(item.notifyDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCallCustomer(item.phone)}
        >
          <Text style={styles.actionButtonText}>📞 Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleMessageCustomer(item.phone)}
        >
          <Text style={styles.actionButtonText}>💬 Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            // Navigate to edit customer screen when implemented
            Alert.alert("Edit Customer", `Edit details for ${item.name}`);
          }}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>No Customers Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Start by adding your first customer to build your customer base
      </Text>
      <TouchableOpacity
        style={styles.addFirstCustomerButton}
        onPress={() => navigation.navigate("AddCustomer")}
      >
        <Text style={styles.addFirstCustomerButtonText}>Add First Customer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Customer Manager</Text>
          <Text style={styles.headerSubtitle}>
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : customers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id ?? Math.random().toString()}
          renderItem={renderCustomerCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#007bff']}
              tintColor="#007bff"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      {!loading && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => navigation.navigate("AddCustomer")}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingAddButtonText}>+</Text>
        </TouchableOpacity>
      )}
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
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#dc3545",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  photoContainer: {
    marginRight: 16,
  },
  customerPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#e1e5e9",
  },
  placeholderPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0056b3",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  customerPhone: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 4,
    fontWeight: "500",
  },
  customerAddress: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    borderColor: "#bbdefb",
  },
  editButtonText: {
    fontSize: 13,
    color: "#1976d2",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f8f9fa",
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  addFirstCustomerButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFirstCustomerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007bff",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingAddButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 24,
  },
});