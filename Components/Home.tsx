
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Linking,
//   StatusBar,
//   Platform,
//   TextInput,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList, Customer } from "../types";
// import { db, auth, waitForAuth, isUserAuthenticated } from "../firebaseConfig";
// import { collection, query, orderBy, onSnapshot, Unsubscribe, doc, deleteDoc } from "firebase/firestore";
// import { signOut, onAuthStateChanged } from "firebase/auth";

// type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
// type Props = { navigation: HomeNavProp };

// export default function HomeScreen({ navigation }: Props) {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [authChecked, setAuthChecked] = useState<boolean>(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   useEffect(() => {
//     let firestoreUnsubscribe: Unsubscribe | null = null;

//     // Set up authentication state listener
//     const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
//       console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
//       setAuthChecked(true);

//       if (!user) {
//         console.log("No authenticated user, redirecting to login");
//         setLoading(false);
//         navigation.replace("Login");
//         return;
//       }

//       console.log("User authenticated, setting up Firestore listener");
      
//       try {
//         // Set up Firestore listener for customers
//         const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        
//         firestoreUnsubscribe = onSnapshot(
//           q,
//           (snapshot) => {
//             console.log("Firestore data received:", snapshot.docs.length, "documents");
            
//             const customerList = snapshot.docs.map((doc) => {
//               const data = doc.data();
//               console.log("Customer data:", doc.id, data);
              
//               return {
//                 id: doc.id,
//                 name: data.name || "",
//                 phone: data.phone || "",
//                 address: data.address || "",
//                 photoURL: data.photoURL || data.photo || null,
//                 notifyDate: data.notifyDate?.toDate ? data.notifyDate.toDate() : data.notifyDate,
//                 notificationMethod: data.notificationMethod || 'sms',
//                 customMessage: data.customMessage || '',
//                 createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
//               } as Customer;
//             });

//             setCustomers(customerList);
//             setFilteredCustomers(customerList);
//             setLoading(false);
//             setRefreshing(false);
//           },
//           (error) => {
//             console.error("Firestore onSnapshot error:", error);
//             console.error("Error code:", error.code);
//             console.error("Error message:", error.message);
            
//             setLoading(false);
//             setRefreshing(false);
            
//             // Handle specific error cases
//             switch (error.code) {
//               case 'permission-denied':
//                 Alert.alert(
//                   "Permission Denied",
//                   "You don't have permission to access the customer data. This might be due to Firestore security rules.",
//                   [
//                     { text: "Retry", onPress: () => setLoading(true) },
//                     { text: "Logout", onPress: handleLogout }
//                   ]
//                 );
//                 break;
              
//               case 'unauthenticated':
//                 Alert.alert(
//                   "Authentication Required",
//                   "Please log in again to continue.",
//                   [{ text: "OK", onPress: () => navigation.replace("Login") }]
//                 );
//                 break;
              
//               case 'unavailable':
//                 Alert.alert(
//                   "Service Unavailable",
//                   "Unable to connect to the database. Please check your internet connection and try again.",
//                   [{ text: "Retry", onPress: () => setLoading(true) }]
//                 );
//                 break;
              
//               default:
//                 Alert.alert(
//                   "Error Loading Data",
//                   `Failed to load customers: ${error.message}`,
//                   [
//                     { text: "Retry", onPress: () => setLoading(true) },
//                     { text: "Logout", onPress: handleLogout }
//                   ]
//                 );
//             }
//           }
//         );
//       } catch (error) {
//         console.error("Error setting up Firestore listener:", error);
//         setLoading(false);
//         Alert.alert("Error", "Failed to initialize data connection");
//       }
//     });

//     // Cleanup function
//     return () => {
//       console.log("Cleaning up subscriptions");
//       authUnsubscribe();
//       if (firestoreUnsubscribe) {
//         firestoreUnsubscribe();
//       }
//     };
//   }, [navigation]);

//   // Search functionality
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredCustomers(customers);
//     } else {
//       const filtered = customers.filter((customer) =>
//         customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         customer.address.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredCustomers(filtered);
//     }
//   }, [searchQuery, customers]);

//   const onRefresh = () => {
//     console.log("Refreshing data...");
//     setRefreshing(true);
//     // The onSnapshot listener will automatically handle the refresh
//     setTimeout(() => {
//       if (refreshing) {
//         setRefreshing(false);
//       }
//     }, 5000); // Timeout after 5 seconds
//   };

//   const handleLogout = async () => {
//     Alert.alert(
//       "Logout",
//       "Are you sure you want to logout?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Logout",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               console.log("Logging out user");
//               await signOut(auth);
//               navigation.replace("Login");
//             } catch (error) {
//               console.error("Logout error:", error);
//               Alert.alert("Error", "Failed to logout. Please try again.");
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleDeleteCustomer = async (customerId: string, customerName: string) => {
//     Alert.alert(
//       "Delete Customer",
//       `Are you sure you want to delete ${customerName}? This action cannot be undone.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setDeletingId(customerId);
//               await deleteDoc(doc(db, "customers", customerId));
//               Alert.alert("Success", `${customerName} has been deleted successfully.`);
//             } catch (error) {
//               console.error("Delete error:", error);
//               Alert.alert("Error", "Failed to delete customer. Please try again.");
//             } finally {
//               setDeletingId(null);
//             }
//           }
//         }
//       ]
//     );  
//   };

//   const handleEditCustomer = (customer: Customer) => {
//     navigation.navigate("AddCustomer", { customerToEdit: customer });
//   };

//   const handleCallCustomer = (phone: string) => {
//     if (!phone) {
//       Alert.alert("Error", "No phone number available");
//       return;
//     }

//     Alert.alert(
//       "Call Customer",
//       `Call ${phone}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Call",
//           onPress: () => {
//             Linking.openURL(`tel:${phone}`).catch((error) => {
//               console.error("Failed to make call:", error);
//               Alert.alert("Error", "Unable to make phone call");
//             });
//           }
//         }
//       ]
//     );
//   };

//   const handleMessageCustomer = (phone: string) => {
//     if (!phone) {
//       Alert.alert("Error", "No phone number available");
//       return;
//     }

//     Alert.alert(
//       "Send Message",
//       `Send SMS to ${phone}?`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Message",
//           onPress: () => {
//             Linking.openURL(`sms:${phone}`).catch((error) => {
//               console.error("Failed to send message:", error);
//               Alert.alert("Error", "Unable to send message");
//             });
//           }
//         }
//       ]
//     );
//   };

//   const renderCustomerCard = ({ item }: { item: Customer }) => (
//     <TouchableOpacity
//       style={styles.customerCard}
//       onPress={() => {
//         Alert.alert("Customer Details", `View details for ${item.name}`);
//       }}
//       activeOpacity={0.7}
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.photoContainer}>
//           {item.photoURL ? (
//             <Image 
//               source={{ uri: item.photoURL }} 
//               style={styles.customerPhoto}
//               onError={(error) => console.log("Image load error:", error)}
//             />
//           ) : (
//             <View style={styles.placeholderPhoto}>
//               <Text style={styles.placeholderText}>
//                 {item.name?.charAt(0)?.toUpperCase() || "?"}
//               </Text>
//             </View>
//           )}
//         </View>
        
//         <View style={styles.customerInfo}>
//           <View style={styles.nameRow}>
//             <Text style={styles.customerName} numberOfLines={1}>{item.name || "No Name"}</Text>
//             {item.notifyDate && (
//               <View style={styles.reminderBadge}>
//                 <Text style={styles.reminderText}>!</Text>
//               </View>
//             )}
//           </View>
          
//           <TouchableOpacity onPress={() => handleCallCustomer(item.phone)} style={styles.infoRow}>
//             <Text style={styles.infoIcon}>📞</Text>
//             <Text style={styles.customerPhone} numberOfLines={1}>{item.phone || "No Phone"}</Text>
//           </TouchableOpacity>
          
//           <View style={styles.infoRow}>
//             <Text style={styles.infoIcon}>📍</Text>
//             <Text style={styles.customerAddress} numberOfLines={1}>{item.address || "No Address"}</Text>
//           </View>
          
//           {item.notifyDate && (
//             <View style={styles.infoRow}>
//               <Text style={styles.infoIcon}>🔔</Text>
//               <Text style={styles.notificationDate} numberOfLines={1}>
//                 {new Date(item.notifyDate).toLocaleDateString()}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => handleCallCustomer(item.phone)}
//           >
//             <Text style={styles.actionIcon}>📞</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={styles.actionButton}
//             onPress={() => handleMessageCustomer(item.phone)}
//           >
//             <Text style={styles.actionIcon}>💬</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity
//             style={[styles.actionButton, styles.editButton]}
//             onPress={() => handleEditCustomer(item)}
//           >
//             <Text style={styles.actionIcon}>✏️</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionButton, styles.deleteButton]}
//             onPress={() => handleDeleteCustomer(item.id, item.name)}
//             disabled={deletingId === item.id}
//           >
//             {deletingId === item.id ? (
//               <ActivityIndicator size="small" color="#dc3545" />
//             ) : (
//               <Text style={styles.actionIcon}>🗑️</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyState}>
//       <Text style={styles.emptyStateIcon}>👥</Text>
//       <Text style={styles.emptyStateTitle}>
//         {searchQuery ? "No customers found" : "No Customers Yet"}
//       </Text>
//       <Text style={styles.emptyStateDescription}>
//         {searchQuery 
//           ? `No customers match "${searchQuery}"`
//           : "Start by adding your first customer to build your customer base"
//         }
//       </Text>
//       {!searchQuery && (
//         <TouchableOpacity
//           style={styles.addFirstCustomerButton}
//           onPress={() => navigation.navigate("AddCustomer")}
//         >
//           <Text style={styles.addFirstCustomerButtonText}>Add First Customer</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   // Show loading screen while checking auth
//   if (!authChecked) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//           <Text style={styles.loadingText}>Checking authentication...</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       {/* Compact Header */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <View style={styles.titleContainer}>
//             <Text style={styles.headerIcon}>👥</Text>
//             <View>
//               <Text style={styles.headerTitle}>Customers</Text>
//               <Text style={styles.headerSubtitle}>
//                 {filteredCustomers.length} total{searchQuery ? ' (filtered)' : ''}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//             <Text style={styles.logoutIcon}>↗️</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Compact Search Box */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchInputContainer}>
//           <Text style={styles.searchIcon}>🔍</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search customers..."
//             placeholderTextColor="#999"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity
//               style={styles.clearSearchButton}
//               onPress={() => setSearchQuery("")}
//             >
//               <Text style={styles.clearSearchText}>✕</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>

//       {/* Content */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//           <Text style={styles.loadingText}>Loading customers...</Text>
//         </View>
//       ) : filteredCustomers.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={filteredCustomers}
//           keyExtractor={(item) => item.id || Math.random().toString()}
//           renderItem={renderCustomerCard}
//           contentContainerStyle={styles.listContainer}
//           refreshControl={
//             <RefreshControl 
//               refreshing={refreshing} 
//               onRefresh={onRefresh}
//               colors={['#007bff']}
//               tintColor="#007bff"
//             />
//           }
//           showsVerticalScrollIndicator={false}
//           removeClippedSubviews={true}
//           maxToRenderPerBatch={20}
//           windowSize={10}
//           initialNumToRender={15}
//           getItemLayout={(data, index) => (
//             { length: 85, offset: 85 * index, index }
//           )}
//         />
//       )}

//       {/* Floating Add Button */}
//       {!loading && (
//         <TouchableOpacity
//           style={styles.floatingAddButton}
//           onPress={() => navigation.navigate("AddCustomer")}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.floatingAddButtonText}>+</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   header: {
//     backgroundColor: "#fff",
//     paddingTop: Platform.OS === 'ios' ? 45 : 15,
//     paddingBottom: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e1e5e9",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   titleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   headerIcon: {
//     fontSize: 24,
//     marginRight: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 1,
//   },
//   logoutButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#dc3545",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#dc3545",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   logoutIcon: {
//     fontSize: 16,
//     color: "#fff",
//   },
//   searchContainer: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   searchInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderColor: "#e1e5e9",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   searchIcon: {
//     fontSize: 16,
//     marginRight: 8,
//     color: "#666",
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 8,
//     fontSize: 14,
//     color: "#333",
//   },
//   clearSearchButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     backgroundColor: "#666",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   clearSearchText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: "#666",
//     fontWeight: "500",
//   },
//   listContainer: {
//     padding: 12,
//     paddingBottom: 80,
//   },
//   customerCard: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginBottom: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   cardContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//   },
//   photoContainer: {
//     marginRight: 12,
//   },
//   customerPhoto: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f0f0f0",
//   },
//   placeholderPhoto: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   placeholderText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   customerInfo: {
//     flex: 1,
//     marginRight: 8,
//   },
//   nameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     flex: 1,
//   },
//   reminderBadge: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: "#28a745",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 6,
//   },
//   reminderText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   infoIcon: {
//     fontSize: 10,
//     width: 14,
//     marginRight: 6,
//   },
//   customerPhone: {
//     fontSize: 12,
//     color: "#007bff",
//     fontWeight: "500",
//     flex: 1,
//   },
//   customerAddress: {
//     fontSize: 12,
//     color: "#666",
//     flex: 1,
//   },
//   notificationDate: {
//     fontSize: 12,
//     color: "#28a745",
//     fontWeight: "500",
//     flex: 1,
//   },
//   actionButtons: {
//     flexDirection: "column",
//     gap: 4,
//   },
//   actionButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 6,
//     backgroundColor: "#f8f9fa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#e1e5e9",
//   },
//   actionIcon: {
//     fontSize: 12,
//   },
//   editButton: {
//     backgroundColor: "#e3f2fd",
//     borderColor: "#bbdefb",
//   },
//   deleteButton: {
//     backgroundColor: "#ffebee",
//     borderColor: "#ffcdd2",
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//     backgroundColor: "#f8f9fa",
//   },
//   emptyStateIcon: {
//     fontSize: 60,
//     marginBottom: 16,
//     opacity: 0.6,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   emptyStateDescription: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 24,
//     paddingHorizontal: 20,
//   },
//   addFirstCustomerButton: {
//     backgroundColor: "#007bff",
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     shadowColor: "#007bff",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   addFirstCustomerButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   floatingAddButton: {
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#007bff",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   floatingAddButtonText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//     lineHeight: 20,
//   },
// });
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
  TextInput,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Customer } from "../types";
import { db, auth, waitForAuth, isUserAuthenticated } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, Unsubscribe, doc, deleteDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
type Props = { navigation: HomeNavProp };

export default function HomeScreen({ navigation }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let firestoreUnsubscribe: Unsubscribe | null = null;

    // Set up authentication state listener
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.uid}` : "No user");
      setAuthChecked(true);

      if (!user) {
        console.log("No authenticated user, redirecting to login");
        setLoading(false);
        navigation.replace("Login");
        return;
      }

      console.log("User authenticated, setting up Firestore listener");
      
      try {
        // Set up Firestore listener for customers
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        
        firestoreUnsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log("Firestore data received:", snapshot.docs.length, "documents");
            
            const customerList = snapshot.docs.map((doc) => {
              const data = doc.data();
              console.log("Customer data:", doc.id, data);
              
              return {
                id: doc.id,
                name: data.name || "",
                phone: data.phone || "",
                address: data.address || "",
                photoURL: data.photoBase64 || data.photo || null,
                notifyDate: data.notifyDate?.toDate ? data.notifyDate.toDate() : data.notifyDate,
                notificationMethod: data.notificationMethod || 'sms',
                customMessage: data.customMessage || '',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              } as Customer;
            });

            setCustomers(customerList);
            setFilteredCustomers(customerList);
            setLoading(false);
            setRefreshing(false);
          },
          (error) => {
            console.error("Firestore onSnapshot error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            setLoading(false);
            setRefreshing(false);
            
            // Handle specific error cases
            switch (error.code) {
              case 'permission-denied':
                Alert.alert(
                  "Permission Denied",
                  "You don't have permission to access the customer data. This might be due to Firestore security rules.",
                  [
                    { text: "Retry", onPress: () => setLoading(true) },
                    { text: "Logout", onPress: handleLogout }
                  ]
                );
                break;
              
              case 'unauthenticated':
                Alert.alert(
                  "Authentication Required",
                  "Please log in again to continue.",
                  [{ text: "OK", onPress: () => navigation.replace("Login") }]
                );
                break;
              
              case 'unavailable':
                Alert.alert(
                  "Service Unavailable",
                  "Unable to connect to the database. Please check your internet connection and try again.",
                  [{ text: "Retry", onPress: () => setLoading(true) }]
                );
                break;
              
              default:
                Alert.alert(
                  "Error Loading Data",
                  `Failed to load customers: ${error.message}`,
                  [
                    { text: "Retry", onPress: () => setLoading(true) },
                    { text: "Logout", onPress: handleLogout }
                  ]
                );
            }
          }
        );
      } catch (error) {
        console.error("Error setting up Firestore listener:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to initialize data connection");
      }
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up subscriptions");
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, [navigation]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const onRefresh = () => {
    console.log("Refreshing data...");
    setRefreshing(true);
    // The onSnapshot listener will automatically handle the refresh
    setTimeout(() => {
      if (refreshing) {
        setRefreshing(false);
      }
    }, 5000); // Timeout after 5 seconds
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
              console.log("Logging out user");
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

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customerName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(customerId);
              await deleteDoc(doc(db, "customers", customerId));
              Alert.alert("Success", `${customerName} has been deleted successfully.`);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete customer. Please try again.");
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );  
  };

  const handleEditCustomer = (customer: Customer) => {
    navigation.navigate("AddCustomer", { customerToEdit: customer });
  };

  const handleCallCustomer = (phone: string) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    Alert.alert(
      "Call Customer",
      `Call ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch((error) => {
              console.error("Failed to make call:", error);
              Alert.alert("Error", "Unable to make phone call");
            });
          }
        }
      ]
    );
  };

  const handleMessageCustomer = (phone: string) => {
    if (!phone) {
      Alert.alert("Error", "No phone number available");
      return;
    }

    Alert.alert(
      "Send Message",
      `Send SMS to ${phone}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => {
            Linking.openURL(`sms:${phone}`).catch((error) => {
              console.error("Failed to send message:", error);
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
        navigation.navigate("ViewCustomer", { customer: item });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.photoContainer}>
          {/* {item.photoURL ? (
            <Image 
              source={{ uri: item.photoURL }} 
              style={styles.customerPhoto}
              onError={(error) => console.log("Image load error:", error)}
            />
          ) : ( */}
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>
                {item.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          {/* )} */}
        </View>
        
        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.customerName} numberOfLines={1}>{item.name || "No Name"}</Text>
            {item.notifyDate && (
              <View style={styles.reminderBadge}>
                <Text style={styles.reminderText}>!</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsRow}>
            <TouchableOpacity onPress={() => handleCallCustomer(item.phone)} style={styles.phoneContainer}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.customerPhone} numberOfLines={1}>{item.phone || "No Phone"}</Text>
            </TouchableOpacity>
            
            <View style={styles.addressContainer}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.customerAddress} numberOfLines={1}>{item.address || "No Address"}</Text>
            </View>
          </View>
          
          {item.notifyDate && (
            <View style={styles.reminderRow}>
              <Text style={styles.infoIcon}>🔔</Text>
              <Text style={styles.notificationDate} numberOfLines={1}>
                {new Date(item.notifyDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCallCustomer(item.phone)}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMessageCustomer(item.phone)}
          >
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditCustomer(item)}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCustomer(item.id, item.name)}
            disabled={deletingId === item.id}
          >
            {deletingId === item.id ? (
              <ActivityIndicator size="small" color="#dc3545" />
            ) : (
              <Text style={styles.actionIcon}>🗑️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? "No customers found" : "No Customers Yet"}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery 
          ? `No customers match "${searchQuery}"`
          : "Start by adding your first customer to build your customer base"
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.addFirstCustomerButton}
          onPress={() => navigation.navigate("AddCustomer")}
        >
          <Text style={styles.addFirstCustomerButtonText}>Add First Customer</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Show loading screen while checking auth
  if (!authChecked) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerIcon}>👥</Text>
            <View>
              <Text style={styles.headerTitle}>Customers</Text>
              <Text style={styles.headerSubtitle}>
                {filteredCustomers.length} total{searchQuery ? ' (filtered)' : ''}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>↗️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Compact Search Box */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery("")}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : filteredCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id || Math.random().toString()}
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
          removeClippedSubviews={true}
          maxToRenderPerBatch={20}
          windowSize={10}
          initialNumToRender={15}
          getItemLayout={(data, index) => (
            { length: 68, offset: 68 * index, index }
          )}
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
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'ios' ? 45 : 15,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 1,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc3545",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 16,
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#666",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  clearSearchButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#666",
    justifyContent: "center",
    alignItems: "center",
  },
  clearSearchText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
    padding: 8,
    paddingBottom: 80,
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    minHeight: 60,
  },
  photoContainer: {
    marginRight: 8,
  },
  customerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
  },
  placeholderPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    flex: 1,
  },
  reminderBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#28a745",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  reminderText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.5,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 10,
    width: 12,
    marginRight: 4,
  },
  customerPhone: {
    fontSize: 12,
    color: "#007bff",
    fontWeight: "500",
    flex: 1,
  },
  customerAddress: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 2,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e1e5e9",
  },
  actionIcon: {
    fontSize: 10,
  },
  editButton: {
    backgroundColor: "#e3f2fd",
    borderColor: "#bbdefb",
  },
  deleteButton: {
    backgroundColor: "#ffebee",
    borderColor: "#ffcdd2",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f8f9fa",
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addFirstCustomerButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addFirstCustomerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  floatingAddButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingAddButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 20,
  },
});