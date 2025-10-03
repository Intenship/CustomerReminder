// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Linking,
//   StatusBar,
//   Platform,
//   Share,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RouteProp } from "@react-navigation/native";
// import { RootStackParamList, Customer } from "../types";
// import { db } from "../firebaseConfig";
// import { doc, deleteDoc } from "firebase/firestore";

// type ViewCustomerNavProp = NativeStackNavigationProp<RootStackParamList, "ViewCustomer">;
// type ViewCustomerRouteProp = RouteProp<RootStackParamList, "ViewCustomer">;

// type Props = {
//   navigation: ViewCustomerNavProp;
//   route: ViewCustomerRouteProp;
// };

// export default function ViewCustomerScreen({ navigation, route }: Props) {
//   const { customer } = route.params;
//   const [deleting, setDeleting] = useState<boolean>(false);

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleEdit = () => {
//     navigation.navigate("AddCustomer", { customerToEdit: customer });
//   };

//   const handleCall = () => {
//     if (!customer.phone) {
//       Alert.alert("Error", "No phone number available");
//       return;
//     }

//     Alert.alert(
//       "Call Customer",
//       `Call ${customer.name}?\n${customer.phone}`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Call",
//           onPress: () => {
//             Linking.openURL(`tel:${customer.phone}`).catch((error) => {
//               console.error("Failed to make call:", error);
//               Alert.alert("Error", "Unable to make phone call");
//             });
//           }
//         }
//       ]
//     );
//   };

//   const handleMessage = () => {
//     if (!customer.phone) {
//       Alert.alert("Error", "No phone number available");
//       return;
//     }

//     Alert.alert(
//       "Send Message",
//       `Send SMS to ${customer.name}?\n${customer.phone}`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Message",
//           onPress: () => {
//             Linking.openURL(`sms:${customer.phone}`).catch((error) => {
//               console.error("Failed to send message:", error);
//               Alert.alert("Error", "Unable to send message");
//             });
//           }
//         }
//       ]
//     );
//   };

//   // NEW: Handle map navigation
//   const handleNavigate = () => {
//     if (!customer.address) {
//       Alert.alert("Error", "No address available for navigation");
//       return;
//     }

//     Alert.alert(
//       "Navigate to Customer",
//       `Open maps and navigate to:\n${customer.address}`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Navigate",
//           onPress: () => {
//             openMapsApp(customer.address);
//           }
//         }
//       ]
//     );
//   };

//   // NEW: Open maps app with navigation
//   const openMapsApp = (address: string) => {
//     const encodedAddress = encodeURIComponent(address);

//     // Try different map apps based on platform
//     const mapUrls: string[] = Platform.select({
//       ios: [
//         `maps:0,0?q=${encodedAddress}`, // Apple Maps
//         `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`, // Google Maps
//         `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
//       ],
//       android: [
//         `google.navigation:q=${encodedAddress}`, // Google Maps Navigation
//         `geo:0,0?q=${encodedAddress}`, // Generic maps intent
//         `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
//       ],
//       default: [
//         `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
//       ]
//     }) || [
//       `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`
//     ];

//     // Try to open the first available map app
//     const tryOpenMaps = async (urls: string[]) => {
//       for (const url of urls) {
//         try {
//           const supported = await Linking.canOpenURL(url);
//           if (supported) {
//             await Linking.openURL(url);
//             return true;
//           }
//         } catch (error) {
//           console.log(`Failed to open ${url}:`, error);
//           continue;
//         }
//       }
//       return false;
//     };

//     tryOpenMaps(mapUrls).then((success) => {
//       if (!success) {
//         Alert.alert(
//           "Error",
//           "Unable to open maps application. Please check if you have a maps app installed."
//         );
//       }
//     });
//   };

//   const handleShare = async () => {
//     try {
//       const shareContent = `Customer Details:
// Name: ${customer.name}
// Phone: ${customer.phone || 'N/A'}
// Address: ${customer.address || 'N/A'}
// ${customer.notifyDate ? `Reminder: ${new Date(customer.notifyDate).toLocaleDateString()}` : ''}
// ${customer.customMessage ? `Message: ${customer.customMessage}` : ''}`;

//       await Share.share({
//         message: shareContent,
//         title: `${customer.name} - Contact Details`,
//       });
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   const handleDelete = () => {
//     Alert.alert(
//       "Delete Customer",
//       `Are you sure you want to delete ${customer.name}?\n\nThis action cannot be undone.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setDeleting(true);
//               await deleteDoc(doc(db, "customers", customer.id));
//               Alert.alert(
//                 "Success",
//                 `${customer.name} has been deleted successfully.`,
//                 [{ text: "OK", onPress: () => navigation.goBack() }]
//               );
//             } catch (error) {
//               console.error("Delete error:", error);
//               Alert.alert("Error", "Failed to delete customer. Please try again.");
//               setDeleting(false);
//             }
//           }
//         }
//       ]
//     );
//   };

//   const formatDate = (date: Date | string) => {
//     if (!date) return 'Not set';
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return dateObj.toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const formatCreatedDate = (date: Date | string) => {
//     if (!date) return 'Unknown';
//     const dateObj = typeof date === 'string' ? new Date(date) : date;
//     return dateObj.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#007bff" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={handleBack}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Customer Details</Text>
//         <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//           <Text style={styles.shareIcon}>↗️</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Profile Section */}
//         <View style={styles.profileSection}>
//           <View style={styles.profileImageContainer}>
//             {customer.photoURL ? (
//               <Image
//                 source={{ uri: customer.photoURL }}
//                 style={styles.profileImage}
//                 onError={(error) => console.log("Image load error:", error)}
//               />
//             ) : (
//               <View style={styles.placeholderImage}>
//                 <Text style={styles.placeholderText}>
//                   {customer.name?.charAt(0)?.toUpperCase() || "?"}
//                 </Text>
//               </View>
//             )}
//           </View>

//           <Text style={styles.customerName}>{customer.name || "Unnamed Customer"}</Text>
//           <Text style={styles.customerSince}>
//             Customer since {formatCreatedDate(customer.createdAt)}
//           </Text>

//           {customer.notifyDate && (
//             <View style={styles.reminderBadge}>
//               <Text style={styles.reminderIcon}>🔔</Text>
//               <Text style={styles.reminderText}>Reminder Set</Text>
//             </View>
//           )}
//         </View>

//         {/* Quick Actions - UPDATED with Navigate action */}
//         <View style={styles.quickActions}>
//           <TouchableOpacity style={[styles.actionCard, styles.callAction]} onPress={handleCall}>
//             <Text style={styles.actionIcon}>📞</Text>
//             <Text style={styles.actionTitle}>Call</Text>
//             <Text style={styles.actionSubtitle}>Make a call</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionCard, styles.messageAction]} onPress={handleMessage}>
//             <Text style={styles.actionIcon}>💬</Text>
//             <Text style={styles.actionTitle}>Message</Text>
//             <Text style={styles.actionSubtitle}>Send SMS</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionCard, styles.navigateAction]}
//             onPress={handleNavigate}
//             disabled={!customer.address}
//           >
//             <Text style={styles.actionIcon}>🗺️</Text>
//             <Text style={styles.actionTitle}>Navigate</Text>
//             <Text style={styles.actionSubtitle}>Open maps</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={[styles.actionCard, styles.editAction]} onPress={handleEdit}>
//             <Text style={styles.actionIcon}>✏️</Text>
//             <Text style={styles.actionTitle}>Edit</Text>
//             <Text style={styles.actionSubtitle}>Modify details</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Contact Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Contact Information</Text>

//           <View style={styles.infoCard}>
//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>👤</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Full Name</Text>
//                 <Text style={styles.infoValue}>{customer.name || "Not provided"}</Text>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📞</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Phone Number</Text>
//                 <TouchableOpacity onPress={handleCall}>
//                   <Text style={[styles.infoValue, styles.phoneValue]}>
//                     {customer.phone || "Not provided"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📍</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Address</Text>
//                 {/* UPDATED: Made address clickable for navigation */}
//                 <TouchableOpacity onPress={handleNavigate} disabled={!customer.address}>
//                   <Text style={[
//                     styles.infoValue,
//                     customer.address ? styles.addressValue : null
//                   ]}>
//                     {customer.address || "Not provided"}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Reminder Information */}
//         {(customer.notifyDate || customer.customMessage) && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Reminder Details</Text>

//             <View style={styles.infoCard}>
//               {customer.notifyDate && (
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIcon}>
//                     <Text style={styles.icon}>🗓️</Text>
//                   </View>
//                   <View style={styles.infoContent}>
//                     <Text style={styles.infoLabel}>Reminder Date</Text>
//                     <Text style={styles.infoValue}>{formatDate(customer.notifyDate)}</Text>
//                   </View>
//                 </View>
//               )}

//               <View style={styles.infoItem}>
//                 <View style={styles.infoIcon}>
//                   <Text style={styles.icon}>📨</Text>
//                 </View>
//                 <View style={styles.infoContent}>
//                   {/* <Text style={styles.infoLabel}>Notification Method</Text>
//                   <Text style={styles.infoValue}>
//                     {customer.notificationMethod === 'sms' ? 'SMS' :
//                      customer.notificationMethod === 'email' ? 'Email' : 'SMS'}
//                   </Text> */}
//                 </View>
//               </View>

//               {customer.customMessage && (
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIcon}>
//                     <Text style={styles.icon}>💭</Text>
//                   </View>
//                   <View style={styles.infoContent}>
//                     <Text style={styles.infoLabel}>Custom Message</Text>
//                     <Text style={styles.infoValue}>{customer.customMessage}</Text>
//                   </View>
//                 </View>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Account Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Account Information</Text>

//           <View style={styles.infoCard}>
//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📅</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Date Added</Text>
//                 <Text style={styles.infoValue}>{formatDate(customer.createdAt)}</Text>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>🆔</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>Customer ID</Text>
//                 <Text style={styles.infoValueSmall}>{customer.id}</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Danger Zone */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Actions</Text>

//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={handleDelete}
//             disabled={deleting}
//           >
//             <Text style={styles.deleteIcon}>🗑️</Text>
//             <View style={styles.deleteContent}>
//               <Text style={styles.deleteTitle}>
//                 {deleting ? "Deleting..." : "Delete Customer"}
//               </Text>
//               <Text style={styles.deleteSubtitle}>
//                 This action cannot be undone
//               </Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     paddingBottom: 16,
//     paddingHorizontal: 20,
//     backgroundColor: "#007bff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   backIcon: {
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     flex: 1,
//     textAlign: "center",
//   },
//   shareButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   shareIcon: {
//     fontSize: 16,
//     color: "#fff",
//   },
//   content: {
//     flex: 1,
//   },
//   profileSection: {
//     backgroundColor: "#fff",
//     alignItems: "center",
//     paddingVertical: 32,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   profileImageContainer: {
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "#f0f0f0",
//     borderWidth: 4,
//     borderColor: "#fff",
//   },
//   placeholderImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 4,
//     borderColor: "#fff",
//   },
//   placeholderText: {
//     color: "#fff",
//     fontSize: 36,
//     fontWeight: "bold",
//   },
//   customerName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   customerSince: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 16,
//   },
//   reminderBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e8f5e8",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#c3e6c3",
//   },
//   reminderIcon: {
//     fontSize: 14,
//     marginRight: 4,
//   },
//   reminderText: {
//     fontSize: 12,
//     color: "#28a745",
//     fontWeight: "600",
//   },
//   quickActions: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     gap: 8, // Reduced gap to fit 4 items
//   },
//   actionCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12, // Reduced padding
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   callAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#28a745",
//   },
//   messageAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#007bff",
//   },
//   // NEW: Navigate action styling
//   navigateAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#ff6b35",
//   },
//   editAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#ffc107",
//   },
//   actionIcon: {
//     fontSize: 20, // Reduced icon size
//     marginBottom: 6,
//   },
//   actionTitle: {
//     fontSize: 12, // Reduced font size
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 2,
//   },
//   actionSubtitle: {
//     fontSize: 10, // Reduced font size
//     color: "#666",
//     textAlign: "center",
//   },
//   section: {
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 12,
//   },
//   infoCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   infoIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f8f9fa",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   icon: {
//     fontSize: 18,
//   },
//   infoContent: {
//     flex: 1,
//     paddingTop: 2,
//   },
//   infoLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: "#1a1a1a",
//     fontWeight: "500",
//     lineHeight: 22,
//   },
//   infoValueSmall: {
//     fontSize: 14,
//     color: "#666",
//     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
//   },
//   phoneValue: {
//     color: "#007bff",
//     textDecorationLine: "underline",
//   },
//   // NEW: Address value styling
//   addressValue: {
//     color: "#ff6b35",
//     textDecorationLine: "underline",
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//     borderLeftWidth: 4,
//     borderLeftColor: "#dc3545",
//   },
//   deleteIcon: {
//     fontSize: 20,
//     marginRight: 12,
//   },
//   deleteContent: {
//     flex: 1,
//   },
//   deleteTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#dc3545",
//     marginBottom: 2,
//   },
//   deleteSubtitle: {
//     fontSize: 12,
//     color: "#999",
//   },
// });
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Alert,
//   Linking,
//   StatusBar,
//   Platform,
//   Share,
//   ActivityIndicator,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RouteProp } from "@react-navigation/native";
// import { RootStackParamList, Customer } from "../types";
// import { db } from "../firebaseConfig";
// import { doc, deleteDoc } from "firebase/firestore";

// type ViewCustomerNavProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "ViewCustomer"
// >;
// type ViewCustomerRouteProp = RouteProp<RootStackParamList, "ViewCustomer">;

// type Props = {
//   navigation: ViewCustomerNavProp;
//   route: ViewCustomerRouteProp;
// };

// // Translation object
// const translations = {
//   en: {
//     customerDetails: "Customer Details",
//     customerSince: "Customer since",
//     reminderSet: "Reminder Set",
//     productImage: "Product Image",
//     photoFailed: "Photo failed to load",
//     call: "Call",
//     makeCall: "Make a call",
//     message: "Message",
//     sendSMS: "Send SMS",
//     navigate: "Navigate",
//     openMaps: "Open maps",
//     edit: "Edit",
//     modifyDetails: "Modify details",
//     contactInfo: "Contact Information",
//     fullName: "Full Name",
//     phoneNumber: "Phone Number",
//     address: "Address",
//     notProvided: "Not provided",
//     reminderDetails: "Reminder Details",
//     reminderDate: "Reminder Date",
//     customMessage: "Custom Message",
//     accountInfo: "Account Information",
//     dateAdded: "Date Added",
//     customerId: "Customer ID",
//     actions: "Actions",
//     deleteCustomer: "Delete Customer",
//     cannotUndo: "This action cannot be undone",
//     deleting: "Deleting...",
//     callCustomer: "Call Customer",
//     callPrompt: "Call",
//     cancel: "Cancel",
//     sendMessagePrompt: "Send Message",
//     sendSMSTo: "Send SMS to",
//     navigateToCustomer: "Navigate to Customer",
//     openMapsNavigate: "Open maps and navigate to:",
//     error: "Error",
//     noPhone: "No phone number available",
//     noAddress: "No address available for navigation",
//     unableToCall: "Unable to make phone call",
//     unableToMessage: "Unable to send message",
//     unableToMaps:
//       "Unable to open maps application. Please check if you have a maps app installed.",
//     deleteConfirm: "Are you sure you want to delete",
//     success: "Success",
//     deletedSuccessfully: "has been deleted successfully.",
//     deleteFailed: "Failed to delete customer. Please try again.",
//     notSet: "Not set",
//     unknown: "Unknown",
//     unnamedCustomer: "Unnamed Customer",
//     marathi: "मराठी",
//     language: "English",
//   },
//   mr: {
//     customerDetails: "ग्राहक तपशील",
//     customerSince: "ग्राहक पासून",
//     reminderSet: "स्मरणपत्र सेट केले",
//     productImage: "उत्पादन प्रतिमा",
//     photoFailed: "फोटो लोड होऊ शकला नाही",
//     call: "कॉल करा",
//     makeCall: "कॉल करा",
//     message: "संदेश",
//     sendSMS: "SMS पाठवा",
//     navigate: "मार्ग",
//     openMaps: "नकाशा उघडा",
//     edit: "संपादित करा",
//     modifyDetails: "तपशील बदला",
//     contactInfo: "संपर्क माहिती",
//     fullName: "पूर्ण नाव",
//     phoneNumber: "फोन नंबर",
//     address: "पत्ता",
//     notProvided: "प्रदान केलेले नाही",
//     reminderDetails: "स्मरणपत्र तपशील",
//     reminderDate: "स्मरणपत्र तारीख",
//     customMessage: "सानुकूल संदेश",
//     accountInfo: "खाते माहिती",
//     dateAdded: "जोडलेली तारीख",
//     customerId: "ग्राहक आयडी",
//     actions: "क्रिया",
//     deleteCustomer: "ग्राहक हटवा",
//     cannotUndo: "ही क्रिया पूर्ववत केली जाऊ शकत नाही",
//     deleting: "हटवत आहे...",
//     callCustomer: "ग्राहकाला कॉल करा",
//     callPrompt: "कॉल करा",
//     cancel: "रद्द करा",
//     sendMessagePrompt: "संदेश पाठवा",
//     sendSMSTo: "यांना SMS पाठवा",
//     navigateToCustomer: "ग्राहकाकडे जा",
//     openMapsNavigate: "नकाशा उघडा आणि येथे जा:",
//     error: "त्रुटी",
//     noPhone: "फोन नंबर उपलब्ध नाही",
//     noAddress: "नेव्हिगेशनसाठी पत्ता उपलब्ध नाही",
//     unableToCall: "फोन कॉल करू शकत नाही",
//     unableToMessage: "संदेश पाठवू शकत नाही",
//     unableToMaps:
//       "नकाशा अॅप्लिकेशन उघडू शकत नाही. कृपया तुमच्याकडे नकाशा अॅप इन्स्टॉल आहे का तपासा.",
//     deleteConfirm: "तुम्हाला नक्की हटवायचे आहे का",
//     success: "यशस्वी",
//     deletedSuccessfully: "यशस्वीरित्या हटवले गेले.",
//     deleteFailed: "ग्राहक हटवणे अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
//     notSet: "सेट केलेले नाही",
//     unknown: "अज्ञात",
//     unnamedCustomer: "नाव नसलेला ग्राहक",
//     marathi: "मराठी",
//     language: "मराठी",
//   },
// };

// export default function ViewCustomerScreen({ navigation, route }: Props) {
//   const { customer } = route.params;
//   const [deleting, setDeleting] = useState<boolean>(false);
//   const [imageError, setImageError] = useState<boolean>(false);
//   const [isMarathi, setIsMarathi] = useState<boolean>(true);

//   const t = isMarathi ? translations.mr : translations.en;

//   useEffect(() => {
//     console.log("=== Customer Data ===");
//     console.log("Customer ID:", customer.id);
//     console.log("Customer Name:", customer.name);
//     console.log("Photo URL:", customer.photoURL);
//     console.log("Photo Base64:", customer.photoBase64 ? "EXISTS" : "NO");
//     console.log("Full Customer Object:", JSON.stringify(customer, null, 2));
//   }, [customer]);

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleEdit = () => {
//     navigation.navigate("AddCustomer", { customerToEdit: customer });
//   };

//   const handleCall = () => {
//     if (!customer.phone) {
//       Alert.alert(t.error, t.noPhone);
//       return;
//     }

//     Alert.alert(
//       t.callCustomer,
//       `${t.callPrompt} ${customer.name}?\n${customer.phone}`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.callPrompt,
//           onPress: () => {
//             Linking.openURL(`tel:${customer.phone}`).catch((error) => {
//               console.error("Failed to make call:", error);
//               Alert.alert(t.error, t.unableToCall);
//             });
//           },
//         },
//       ]
//     );
//   };

//   const handleMessage = () => {
//     if (!customer.phone) {
//       Alert.alert(t.error, t.noPhone);
//       return;
//     }

//     Alert.alert(
//       t.sendMessagePrompt,
//       `${t.sendSMSTo} ${customer.name}?\n${customer.phone}`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.message,
//           onPress: () => {
//             Linking.openURL(`sms:${customer.phone}`).catch((error) => {
//               console.error("Failed to send message:", error);
//               Alert.alert(t.error, t.unableToMessage);
//             });
//           },
//         },
//       ]
//     );
//   };

//   const handleNavigate = () => {
//     if (!customer.address) {
//       Alert.alert(t.error, t.noAddress);
//       return;
//     }

//     Alert.alert(
//       t.navigateToCustomer,
//       `${t.openMapsNavigate}\n${customer.address}`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.navigate,
//           onPress: () => {
//             openMapsApp(customer.address);
//           },
//         },
//       ]
//     );
//   };

//   const openMapsApp = (address: string) => {
//     const encodedAddress = encodeURIComponent(address);

//     const mapUrls: string[] = Platform.select({
//       ios: [
//         `maps:0,0?q=${encodedAddress}`,
//         `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`,
//         `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`,
//       ],
//       android: [
//         `google.navigation:q=${encodedAddress}`,
//         `geo:0,0?q=${encodedAddress}`,
//         `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`,
//       ],
//       default: [`https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`],
//     }) || [`https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`];

//     const tryOpenMaps = async (urls: string[]) => {
//       for (const url of urls) {
//         try {
//           const supported = await Linking.canOpenURL(url);
//           if (supported) {
//             await Linking.openURL(url);
//             return true;
//           }
//         } catch (error) {
//           console.log(`Failed to open ${url}:`, error);
//           continue;
//         }
//       }
//       return false;
//     };

//     tryOpenMaps(mapUrls).then((success) => {
//       if (!success) {
//         Alert.alert(t.error, t.unableToMaps);
//       }
//     });
//   };

//   const handleShare = async () => {
//     try {
//       const shareContent = `${t.customerDetails}:
// ${t.fullName}: ${customer.name}
// ${t.phoneNumber}: ${customer.phone || t.notProvided}
// ${t.address}: ${customer.address || t.notProvided}
// ${
//   customer.notifyDate
//     ? `${t.reminderDate}: ${new Date(customer.notifyDate).toLocaleDateString()}`
//     : ""
// }
// ${
//   customer.customMessage ? `${t.customMessage}: ${customer.customMessage}` : ""
// }`;

//       await Share.share({
//         message: shareContent,
//         title: `${customer.name} - ${t.contactInfo}`,
//       });
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   const handleDelete = () => {
//     Alert.alert(
//       t.deleteCustomer,
//       `${t.deleteConfirm} ${customer.name}?\n\n${t.cannotUndo}`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.deleteCustomer,
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setDeleting(true);
//               await deleteDoc(doc(db, "customers", customer.id));
//               Alert.alert(
//                 t.success,
//                 `${customer.name} ${t.deletedSuccessfully}`,
//                 [{ text: "OK", onPress: () => navigation.goBack() }]
//               );
//             } catch (error) {
//               console.error("Delete error:", error);
//               Alert.alert(t.error, t.deleteFailed);
//               setDeleting(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const formatDate = (date: Date | string) => {
//     if (!date) return t.notSet;
//     const dateObj = typeof date === "string" ? new Date(date) : date;
//     return dateObj.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatCreatedDate = (date: Date | string) => {
//     if (!date) return t.unknown;
//     const dateObj = typeof date === "string" ? new Date(date) : date;
//     return dateObj.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const handleImageError = (error: any) => {
//     console.error("Image load error:", error);
//     console.error("Photo URL that failed:", customer.photoURL);
//     setImageError(true);
//   };

//   const handleImageLoadStart = () => {
//     console.log("Image loading started for URL:", customer.photoURL);
//   };

//   const handleImageLoad = () => {
//     console.log("Image loaded successfully:", customer.photoURL);
//     setImageError(false);
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#007bff" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={handleBack}>
//           <Text style={styles.backIcon}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{t.customerDetails}</Text>

//         <TouchableOpacity
//           style={styles.checkboxContainer}
//           onPress={() => setIsMarathi(!isMarathi)}
//         >
//           <View style={[styles.checkbox, isMarathi && styles.checkboxChecked]}>
//             {isMarathi && <Text style={styles.checkmark}>✓</Text>}
//           </View>

//           <Text style={styles.languageText}>{t.language}</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
//           <Text style={styles.shareIcon}>↗️</Text>
//         </TouchableOpacity>
//       </View>

//       {/* <View style={styles.languageToggle}>
//         <TouchableOpacity 
//           style={styles.checkboxContainer}
//           onPress={() => setIsMarathi(!isMarathi)}
//         >
//           <View style={[styles.checkbox, isMarathi && styles.checkboxChecked]}>
//             {isMarathi && <Text style={styles.checkmark}>✓</Text>}
//           </View>
//            <Text style={styles.languageText}>{t.language}</Text>
//         </TouchableOpacity>
//       </View> */}

//       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//         {/* Profile Section */}
//         <View style={styles.profileSection}>
//           <View style={styles.profileImageContainer}>
//             <View style={styles.placeholderImage}>
//               <Text style={styles.placeholderText}>
//                 {customer.name?.charAt(0)?.toUpperCase() || "?"}
//               </Text>
//             </View>
//           </View>

//           <Text style={styles.customerName}>
//             {customer.name || t.unnamedCustomer}
//           </Text>
//           <Text style={styles.customerSince}>
//             {t.customerSince} {formatCreatedDate(customer.createdAt)}
//           </Text>

//           {customer.notifyDate && (
//             <View style={styles.reminderBadge}>
//               <Text style={styles.reminderIcon}>🔔</Text>
//               <Text style={styles.reminderText}>{t.reminderSet}</Text>
//             </View>
//           )}
//         </View>

//         {/* Water Purifier Photo Section */}
//         {(customer.photoURL || customer.photoBase64) && (
//           <View style={styles.photoSection}>
//             <Text style={styles.sectionTitle}>📷 {t.productImage}</Text>
//             <View style={styles.purifierPhotoContainer}>
//               {!imageError ? (
//                 <Image
//                   source={{
//                     uri: (customer.photoBase64 || customer.photoURL) as string,
//                   }}
//                   style={styles.purifierPhoto}
//                   onError={handleImageError}
//                   onLoadStart={handleImageLoadStart}
//                   onLoad={handleImageLoad}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <View style={styles.photoErrorContainer}>
//                   <Text style={styles.photoErrorIcon}>📷</Text>
//                   <Text style={styles.photoErrorText}>{t.photoFailed}</Text>
//                 </View>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Quick Actions */}
//         <View style={styles.quickActions}>
//           <TouchableOpacity
//             style={[styles.actionCard, styles.callAction]}
//             onPress={handleCall}
//           >
//             <Text style={styles.actionIcon}>📞</Text>
//             <Text style={styles.actionTitle}>{t.call}</Text>
//             <Text style={styles.actionSubtitle}>{t.makeCall}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionCard, styles.messageAction]}
//             onPress={handleMessage}
//           >
//             <Text style={styles.actionIcon}>💬</Text>
//             <Text style={styles.actionTitle}>{t.message}</Text>
//             <Text style={styles.actionSubtitle}>{t.sendSMS}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionCard, styles.navigateAction]}
//             onPress={handleNavigate}
//             disabled={!customer.address}
//           >
//             <Text style={styles.actionIcon}>🗺️</Text>
//             <Text style={styles.actionTitle}>{t.navigate}</Text>
//             <Text style={styles.actionSubtitle}>{t.openMaps}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionCard, styles.editAction]}
//             onPress={handleEdit}
//           >
//             <Text style={styles.actionIcon}>✏️</Text>
//             <Text style={styles.actionTitle}>{t.edit}</Text>
//             <Text style={styles.actionSubtitle}>{t.modifyDetails}</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Contact Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>{t.contactInfo}</Text>

//           <View style={styles.infoCard}>
//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>👤</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{t.fullName}</Text>
//                 <Text style={styles.infoValue}>
//                   {customer.name || t.notProvided}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📞</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{t.phoneNumber}</Text>
//                 <TouchableOpacity onPress={handleCall}>
//                   <Text style={[styles.infoValue, styles.phoneValue]}>
//                     {customer.phone || t.notProvided}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📍</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{t.address}</Text>
//                 <TouchableOpacity
//                   onPress={handleNavigate}
//                   disabled={!customer.address}
//                 >
//                   <Text
//                     style={[
//                       styles.infoValue,
//                       customer.address ? styles.addressValue : null,
//                     ]}
//                   >
//                     {customer.address || t.notProvided}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Reminder Information */}
//         {(customer.notifyDate || customer.customMessage) && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>{t.reminderDetails}</Text>

//             <View style={styles.infoCard}>
//               {customer.notifyDate && (
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIcon}>
//                     <Text style={styles.icon}>🗓️</Text>
//                   </View>
//                   <View style={styles.infoContent}>
//                     <Text style={styles.infoLabel}>{t.reminderDate}</Text>
//                     <Text style={styles.infoValue}>
//                       {formatDate(customer.notifyDate)}
//                     </Text>
//                   </View>
//                 </View>
//               )}

//               {customer.customMessage && (
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIcon}>
//                     <Text style={styles.icon}>💭</Text>
//                   </View>
//                   <View style={styles.infoContent}>
//                     <Text style={styles.infoLabel}>{t.customMessage}</Text>
//                     <Text style={styles.infoValue}>
//                       {customer.customMessage}
//                     </Text>
//                   </View>
//                 </View>
//               )}
//             </View>
//           </View>
//         )}

//         {/* Account Information */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>{t.accountInfo}</Text>

//           <View style={styles.infoCard}>
//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>📅</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{t.dateAdded}</Text>
//                 <Text style={styles.infoValue}>
//                   {formatDate(customer.createdAt)}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.infoItem}>
//               <View style={styles.infoIcon}>
//                 <Text style={styles.icon}>🆔</Text>
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{t.customerId}</Text>
//                 <Text style={styles.infoValueSmall}>{customer.id}</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Danger Zone */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>{t.actions}</Text>

//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={handleDelete}
//             disabled={deleting}
//           >
//             <Text style={styles.deleteIcon}>🗑️</Text>
//             <View style={styles.deleteContent}>
//               <Text style={styles.deleteTitle}>
//                 {deleting ? t.deleting : t.deleteCustomer}
//               </Text>
//               <Text style={styles.deleteSubtitle}>{t.cannotUndo}</Text>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   headerRightButtons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     marginRight: 3,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 4,
//     borderWidth: 2,
//     borderColor: "#007bff",
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   checkboxChecked: {
//     backgroundColor: "#007bff",
//   },
//   checkmark: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   languageText: {
//     fontSize: 12,
//     color: "#1a1a1a",
//     fontWeight: "600",
//      marginLeft: 6, 
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: Platform.OS === "ios" ? 50 : 20,
//     paddingBottom: 16,
//     paddingHorizontal: 20,
//     backgroundColor: "#81868bff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   backIcon: {
//     fontSize: 20,
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     flex: 1,
//     textAlign: "center",
//   },
//   shareButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   shareIcon: {
//     fontSize: 16,
//     color: "#fff",
//   },
//   content: {
//     flex: 1,
//   },
//   profileSection: {
//     backgroundColor: "#fff",
//     alignItems: "center",
//     paddingVertical: 32,
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   profileImageContainer: {
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     position: "relative",
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "#f0f0f0",
//     borderWidth: 4,
//     borderColor: "#fff",
//   },
//   placeholderImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 4,
//     borderColor: "#fff",
//   },
//   placeholderText: {
//     color: "#fff",
//     fontSize: 36,
//     fontWeight: "bold",
//   },
//   errorText: {
//     color: "#fff",
//     fontSize: 8,
//     marginTop: 4,
//   },
//   debugButton: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     backgroundColor: "#007bff",
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   debugText: {
//     fontSize: 12,
//   },
//   debugSection: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     padding: 12,
//     backgroundColor: "#fff3cd",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ffc107",
//   },
//   debugTitle: {
//     fontSize: 14,
//     fontWeight: "bold",
//     marginBottom: 8,
//     color: "#856404",
//   },
//   debugInfo: {
//     fontSize: 12,
//     color: "#856404",
//     marginBottom: 4,
//   },
//   customerName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 4,
//     textAlign: "center",
//   },
//   customerSince: {
//     fontSize: 14,
//     color: "#666",
//     marginBottom: 16,
//   },
//   reminderBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#e8f5e8",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#c3e6c3",
//   },
//   reminderIcon: {
//     fontSize: 14,
//     marginRight: 4,
//   },
//   reminderText: {
//     fontSize: 12,
//     color: "#28a745",
//     fontWeight: "600",
//   },
//   quickActions: {
//     flexDirection: "row",
//     paddingHorizontal: 20,
//     marginBottom: 20,
//     gap: 8,
//   },
//   checkboxLabel: {
//     fontSize: 16,
//     color: "#1a1a1a",
//     fontWeight: "500",
//   },
//   actionCard: {
//     flex: 1,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 12,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   callAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#28a745",
//   },
//   messageAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#007bff",
//   },
//   navigateAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#ff6b35",
//   },
//   editAction: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#ffc107",
//   },
//   actionIcon: {
//     fontSize: 20,
//     marginBottom: 6,
//   },
//   actionTitle: {
//     fontSize: 12,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 2,
//   },
//   actionSubtitle: {
//     fontSize: 10,
//     color: "#666",
//     textAlign: "center",
//   },
//   section: {
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     marginBottom: 12,
//   },
//   infoCard: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   infoItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 16,
//   },
//   infoIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f8f9fa",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   icon: {
//     fontSize: 18,
//   },
//   infoContent: {
//     flex: 1,
//     paddingTop: 2,
//   },
//   infoLabel: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   infoValue: {
//     fontSize: 16,
//     color: "#1a1a1a",
//     fontWeight: "500",
//     lineHeight: 22,
//   },
//   infoValueSmall: {
//     fontSize: 14,
//     color: "#666",
//     fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
//   },
//   phoneValue: {
//     color: "#007bff",
//     textDecorationLine: "underline",
//   },
//   addressValue: {
//     color: "#ff6b35",
//     textDecorationLine: "underline",
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#ffcdd2",
//     borderLeftWidth: 4,
//     borderLeftColor: "#dc3545",
//     marginBottom: 18,
//   },
//   deleteIcon: {
//     fontSize: 20,
//     marginRight: 12,
//   },
//   deleteContent: {
//     flex: 1,
//   },
//   deleteTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#dc3545",
//     marginBottom: 2,
//   },
//   deleteSubtitle: {
//     fontSize: 12,
//     color: "#999",
//   },
//   photoSection: {
//     backgroundColor: "#fff",
//     margin: 16,
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   purifierPhotoContainer: {
//     width: "100%",
//     height: 250,
//     borderRadius: 8,
//     overflow: "hidden",
//     backgroundColor: "#f0f0f0",
//   },
//   purifierPhoto: {
//     width: "100%",
//     height: "100%",
//   },
//   photoErrorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//   },
//   photoErrorIcon: {
//     fontSize: 48,
//     marginBottom: 8,
//     opacity: 0.5,
//   },
//   photoErrorText: {
//     fontSize: 14,
//     color: "#666",
//   },
//   imageLoadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.8)",
//   },
// });
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootStackParamList, Customer } from "../types";
import { db } from "../firebaseConfig";
import { doc, deleteDoc, getDoc } from "firebase/firestore";

type ViewCustomerNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "ViewCustomer"
>;
type ViewCustomerRouteProp = RouteProp<RootStackParamList, "ViewCustomer">;

type Props = {
  navigation: ViewCustomerNavProp;
  route: ViewCustomerRouteProp;
};

// Translation object
const translations = {
  en: {
    customerDetails: "Customer Details",
    customerSince: "Customer since",
    reminderSet: "Reminder Set",
    productImage: "Product Image",
    photoFailed: "Photo failed to load",
    call: "Call",
    makeCall: "Make a call",
    message: "Message",
    sendSMS: "Send SMS",
    navigate: "Navigate",
    openMaps: "Open maps",
    edit: "Edit",
    modifyDetails: "Modify details",
    contactInfo: "Contact Information",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    address: "Address",
    notProvided: "Not provided",
    reminderDetails: "Reminder Details",
    reminderDate: "Reminder Date",
    customMessage: "Custom Message",
    accountInfo: "Account Information",
    dateAdded: "Date Added",
    customerId: "Customer ID",
    actions: "Actions",
    deleteCustomer: "Delete Customer",
    cannotUndo: "This action cannot be undone",
    deleting: "Deleting...",
    callCustomer: "Call Customer",
    callPrompt: "Call",
    cancel: "Cancel",
    sendMessagePrompt: "Send Message",
    sendSMSTo: "Send SMS to",
    navigateToCustomer: "Navigate to Customer",
    openMapsNavigate: "Open maps and navigate to:",
    error: "Error",
    noPhone: "No phone number available",
    noAddress: "No address available for navigation",
    unableToCall: "Unable to make phone call",
    unableToMessage: "Unable to send message",
    unableToMaps:
      "Unable to open maps application. Please check if you have a maps app installed.",
    deleteConfirm: "Are you sure you want to delete",
    success: "Success",
    deletedSuccessfully: "has been deleted successfully.",
    deleteFailed: "Failed to delete customer. Please try again.",
    notSet: "Not set",
    unknown: "Unknown",
    unnamedCustomer: "Unnamed Customer",
    marathi: "मराठी",
    language: "English",
    loading: "Loading...",
    customerNotFound: "Customer not found",
  },
  mr: {
    customerDetails: "ग्राहक तपशील",
    customerSince: "ग्राहक पासून",
    reminderSet: "स्मरणपत्र सेट केले",
    productImage: "उत्पादन प्रतिमा",
    photoFailed: "फोटो लोड होऊ शकला नाही",
    call: "कॉल करा",
    makeCall: "कॉल करा",
    message: "संदेश",
    sendSMS: "SMS पाठवा",
    navigate: "मार्ग",
    openMaps: "नकाशा उघडा",
    edit: "संपादित करा",
    modifyDetails: "तपशील बदला",
    contactInfo: "संपर्क माहिती",
    fullName: "पूर्ण नाव",
    phoneNumber: "फोन नंबर",
    address: "पत्ता",
    notProvided: "प्रदान केलेले नाही",
    reminderDetails: "स्मरणपत्र तपशील",
    reminderDate: "स्मरणपत्र तारीख",
    customMessage: "सानुकूल संदेश",
    accountInfo: "खाते माहिती",
    dateAdded: "जोडलेली तारीख",
    customerId: "ग्राहक आयडी",
    actions: "क्रिया",
    deleteCustomer: "ग्राहक हटवा",
    cannotUndo: "ही क्रिया पूर्ववत केली जाऊ शकत नाही",
    deleting: "हटवत आहे...",
    callCustomer: "ग्राहकाला कॉल करा",
    callPrompt: "कॉल करा",
    cancel: "रद्द करा",
    sendMessagePrompt: "संदेश पाठवा",
    sendSMSTo: "यांना SMS पाठवा",
    navigateToCustomer: "ग्राहकाकडे जा",
    openMapsNavigate: "नकाशा उघडा आणि येथे जा:",
    error: "त्रुटी",
    noPhone: "फोन नंबर उपलब्ध नाही",
    noAddress: "नेव्हिगेशनसाठी पत्ता उपलब्ध नाही",
    unableToCall: "फोन कॉल करू शकत नाही",
    unableToMessage: "संदेश पाठवू शकत नाही",
    unableToMaps:
      "नकाशा अॅप्लिकेशन उघडू शकत नाही. कृपया तुमच्याकडे नकाशा अॅप इन्स्टॉल आहे का तपासा.",
    deleteConfirm: "तुम्हाला नक्की हटवायचे आहे का",
    success: "यशस्वी",
    deletedSuccessfully: "यशस्वीरित्या हटवले गेले.",
    deleteFailed: "ग्राहक हटवणे अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    notSet: "सेट केलेले नाही",
    unknown: "अज्ञात",
    unnamedCustomer: "नाव नसलेला ग्राहक",
    marathi: "मराठी",
    language: "मराठी",
    loading: "लोड करत आहे...",
    customerNotFound: "ग्राहक सापडला नाही",
  },
};

export default function ViewCustomerScreen({ navigation, route }: Props) {
  const initialCustomer = route.params.customer;
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isMarathi, setIsMarathi] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const t = isMarathi ? translations.mr : translations.en;

  // Fetch fresh customer data whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchCustomerData = async () => {
        try {
          setLoading(true);
          const customerDoc = await getDoc(doc(db, "customers", initialCustomer.id));
          
          if (customerDoc.exists()) {
            const freshData = {
              id: customerDoc.id,
              ...customerDoc.data(),
            } as Customer;
            setCustomer(freshData);
            console.log("Customer data refreshed:", freshData);
          } else {
            Alert.alert(t.error, t.customerNotFound);
            navigation.goBack();
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
          // Keep showing the old data if fetch fails
        } finally {
          setLoading(false);
        }
      };

      fetchCustomerData();
    }, [initialCustomer.id])
  );

  useEffect(() => {
    console.log("=== Customer Data ===");
    console.log("Customer ID:", customer.id);
    console.log("Customer Name:", customer.name);
    console.log("Photo URL:", customer.photoURL);
    console.log("Photo Base64:", customer.photoBase64 ? "EXISTS" : "NO");
    console.log("Full Customer Object:", JSON.stringify(customer, null, 2));
  }, [customer]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    navigation.navigate("AddCustomer", { customerToEdit: customer });
  };

  const handleCall = () => {
    if (!customer.phone) {
      Alert.alert(t.error, t.noPhone);
      return;
    }

    Alert.alert(
      t.callCustomer,
      `${t.callPrompt} ${customer.name}?\n${customer.phone}`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.callPrompt,
          onPress: () => {
            Linking.openURL(`tel:${customer.phone}`).catch((error) => {
              console.error("Failed to make call:", error);
              Alert.alert(t.error, t.unableToCall);
            });
          },
        },
      ]
    );
  };

  const handleMessage = () => {
    if (!customer.phone) {
      Alert.alert(t.error, t.noPhone);
      return;
    }

    Alert.alert(
      t.sendMessagePrompt,
      `${t.sendSMSTo} ${customer.name}?\n${customer.phone}`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.message,
          onPress: () => {
            Linking.openURL(`sms:${customer.phone}`).catch((error) => {
              console.error("Failed to send message:", error);
              Alert.alert(t.error, t.unableToMessage);
            });
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (!customer.address) {
      Alert.alert(t.error, t.noAddress);
      return;
    }

    Alert.alert(
      t.navigateToCustomer,
      `${t.openMapsNavigate}\n${customer.address}`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.navigate,
          onPress: () => {
            openMapsApp(customer.address);
          },
        },
      ]
    );
  };

  const openMapsApp = (address: string) => {
    const encodedAddress = encodeURIComponent(address);

    const mapUrls: string[] = Platform.select({
      ios: [
        `maps:0,0?q=${encodedAddress}`,
        `comgooglemaps://?daddr=${encodedAddress}&directionsmode=driving`,
        `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`,
      ],
      android: [
        `google.navigation:q=${encodedAddress}`,
        `geo:0,0?q=${encodedAddress}`,
        `https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`,
      ],
      default: [`https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`],
    }) || [`https://maps.google.com/maps?daddr=${encodedAddress}&amp;ll=`];

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
        Alert.alert(t.error, t.unableToMaps);
      }
    });
  };

  const handleShare = async () => {
    try {
      const shareContent = `${t.customerDetails}:
${t.fullName}: ${customer.name}
${t.phoneNumber}: ${customer.phone || t.notProvided}
${t.address}: ${customer.address || t.notProvided}
${
  customer.notifyDate
    ? `${t.reminderDate}: ${new Date(customer.notifyDate).toLocaleDateString()}`
    : ""
}
${
  customer.customMessage ? `${t.customMessage}: ${customer.customMessage}` : ""
}`;

      await Share.share({
        message: shareContent,
        title: `${customer.name} - ${t.contactInfo}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.deleteCustomer,
      `${t.deleteConfirm} ${customer.name}?\n\n${t.cannotUndo}`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.deleteCustomer,
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteDoc(doc(db, "customers", customer.id));
              Alert.alert(
                t.success,
                `${customer.name} ${t.deletedSuccessfully}`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(t.error, t.deleteFailed);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: any) => {
    if (!date) return t.notSet;
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && 'toDate' in date) {
      dateObj = date.toDate();
    } 
    // Handle string dates
    else if (typeof date === "string") {
      dateObj = new Date(date);
    } 
    // Handle Date objects
    else if (date instanceof Date) {
      dateObj = date;
    } 
    // Handle timestamp numbers
    else if (typeof date === "number") {
      dateObj = new Date(date);
    } 
    else {
      return t.notSet;
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return t.notSet;
    }
    
    return dateObj.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCreatedDate = (date: any) => {
    if (!date) return t.unknown;
    
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && 'toDate' in date) {
      dateObj = date.toDate();
    } 
    // Handle string dates
    else if (typeof date === "string") {
      dateObj = new Date(date);
    } 
    // Handle Date objects
    else if (date instanceof Date) {
      dateObj = date;
    } 
    // Handle timestamp numbers
    else if (typeof date === "number") {
      dateObj = new Date(date);
    } 
    else {
      return t.unknown;
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return t.unknown;
    }
    
    return dateObj.toLocaleDateString(isMarathi ? "mr-IN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleImageError = (error: any) => {
    console.error("Image load error:", error);
    console.error("Photo URL that failed:", customer.photoURL);
    setImageError(true);
  };

  const handleImageLoadStart = () => {
    console.log("Image loading started for URL:", customer.photoURL);
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", customer.photoURL);
    setImageError(false);
  };

  // Show loading indicator while fetching fresh data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007bff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.customerDetails}</Text>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsMarathi(!isMarathi)}
        >
          <View style={[styles.checkbox, isMarathi && styles.checkboxChecked]}>
            {isMarathi && <Text style={styles.checkmark}>✓</Text>}
          </View>

          <Text style={styles.languageText}>{t.language}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          </View>

          <Text style={styles.customerName}>
            {customer.name || t.unnamedCustomer}
          </Text>
          <Text style={styles.customerSince}>
            {t.customerSince} {formatCreatedDate(customer.createdAt)}
          </Text>

          {customer.notifyDate && (
            <View style={styles.reminderBadge}>
              <Text style={styles.reminderIcon}>🔔</Text>
              <Text style={styles.reminderText}>{t.reminderSet}</Text>
            </View>
          )}
        </View>

        {/* Water Purifier Photo Section */}
        {(customer.photoURL || customer.photoBase64) && (
          <View style={styles.photoSection}>
            <Text style={styles.sectionTitle}>📷 {t.productImage}</Text>
            <View style={styles.purifierPhotoContainer}>
              {!imageError ? (
                <Image
                  source={{
                    uri: (customer.photoBase64 || customer.photoURL) as string,
                  }}
                  style={styles.purifierPhoto}
                  onError={handleImageError}
                  onLoadStart={handleImageLoadStart}
                  onLoad={handleImageLoad}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoErrorContainer}>
                  <Text style={styles.photoErrorIcon}>📷</Text>
                  <Text style={styles.photoErrorText}>{t.photoFailed}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.callAction]}
            onPress={handleCall}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionTitle}>{t.call}</Text>
            <Text style={styles.actionSubtitle}>{t.makeCall}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.messageAction]}
            onPress={handleMessage}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionTitle}>{t.message}</Text>
            <Text style={styles.actionSubtitle}>{t.sendSMS}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.navigateAction]}
            onPress={handleNavigate}
            disabled={!customer.address}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>{t.navigate}</Text>
            <Text style={styles.actionSubtitle}>{t.openMaps}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.editAction]}
            onPress={handleEdit}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionTitle}>{t.edit}</Text>
            <Text style={styles.actionSubtitle}>{t.modifyDetails}</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.contactInfo}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>👤</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.fullName}</Text>
                <Text style={styles.infoValue}>
                  {customer.name || t.notProvided}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📞</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.phoneNumber}</Text>
                <TouchableOpacity onPress={handleCall}>
                  <Text style={[styles.infoValue, styles.phoneValue]}>
                    {customer.phone || t.notProvided}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📍</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.address}</Text>
                <TouchableOpacity
                  onPress={handleNavigate}
                  disabled={!customer.address}
                >
                  <Text
                    style={[
                      styles.infoValue,
                      customer.address ? styles.addressValue : null,
                    ]}
                  >
                    {customer.address || t.notProvided}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Reminder Information */}
        {(customer.notifyDate || customer.customMessage) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.reminderDetails}</Text>

            <View style={styles.infoCard}>
              {customer.notifyDate && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.icon}>🗓️</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t.reminderDate}</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(customer.notifyDate)}
                    </Text>
                  </View>
                </View>
              )}

              {customer.customMessage && (
                <View style={styles.infoItem}>
                  <View style={styles.infoIcon}>
                    <Text style={styles.icon}>💭</Text>
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{t.customMessage}</Text>
                    <Text style={styles.infoValue}>
                      {customer.customMessage}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.accountInfo}</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>📅</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.dateAdded}</Text>
                <Text style={styles.infoValue}>
                  {formatDate(customer.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Text style={styles.icon}>🆔</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t.customerId}</Text>
                <Text style={styles.infoValueSmall}>{customer.id}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.actions}</Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
            <View style={styles.deleteContent}>
              <Text style={styles.deleteTitle}>
                {deleting ? t.deleting : t.deleteCustomer}
              </Text>
              <Text style={styles.deleteSubtitle}>{t.cannotUndo}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7f5ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 3,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#007bff",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007bff",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  languageText: {
    fontSize: 12,
    color: "#1a1a1a",
    fontWeight: "600",
    marginLeft: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#4A90E2",
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
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    paddingBottom: 14,
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
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  shareIcon: {
    fontSize: 26,
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
    position: "relative",
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
  errorText: {
    color: "#fff",
    fontSize: 8,
    marginTop: 4,
  },
  debugButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#007bff",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  debugText: {
    fontSize: 12,
  },
  debugSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#856404",
  },
  debugInfo: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 4,
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
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
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
  navigateAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#ff6b35",
  },
  editAction: {
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
    textAlign: "center",
  },
  actionSubtitle: {
    fontSize: 10,
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
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  phoneValue: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  addressValue: {
    color: "#94613cff",
    // textDecorationLine: "underline",
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
    marginBottom: 18,
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
  photoSection: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purifierPhotoContainer: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  purifierPhoto: {
    width: "100%",
    height: "100%",
  },
  photoErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  photoErrorIcon: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.5,
  },
  photoErrorText: {
    fontSize: 14,
    color: "#666",
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});