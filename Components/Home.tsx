
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Linking,
//   StatusBar,
//   Platform,
//   TextInput,
//   Modal,
// } from "react-native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList, Customer } from "../types";
// import { db, auth } from "../firebaseConfig";
// import { 
//   collection, 
//   query, 
//   orderBy, 
//   onSnapshot, 
//   Unsubscribe, 
//   doc, 
//   deleteDoc,
//   QueryDocumentSnapshot,
//   DocumentData
// } from "firebase/firestore";
// import { signOut, onAuthStateChanged } from "firebase/auth";

// type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
// type Props = { navigation: HomeNavProp };

// type FilterPeriod = 'all' | '15days' | '1month' | '6months' | '1year' | '2years';

// interface FilterOption {
//   label: string;
//   value: FilterPeriod;
//   days: number | null;
// }

// const FILTER_OPTIONS: FilterOption[] = [
//   { label: 'सर्व नोंदी', value: 'all', days: null },
//   { label: 'गेले १५ दिवस', value: '15days', days: 15 },
//   { label: 'गेला १ महिना', value: '1month', days: 30 },
//   { label: 'गेले ६ महिने', value: '6months', days: 180 },
//   { label: 'गेले १ वर्ष', value: '1year', days: 365 },
//   { label: 'गेली २ वर्षे', value: '2years', days: 730 },
// ];

// const FILTER_OPTIONS_EN: FilterOption[] = [
//   { label: 'All Records', value: 'all', days: null },
//   { label: 'Last 15 Days', value: '15days', days: 15 },
//   { label: 'Last 1 Month', value: '1month', days: 30 },
//   { label: 'Last 6 Months', value: '6months', days: 180 },
//   { label: 'Last 1 Year', value: '1year', days: 365 },
//   { label: 'Last 2 Years', value: '2years', days: 730 },
// ];

// const translations = {
//   marathi: {
//     customers: 'ग्राहक',
//     of: 'पैकी',
//     total: 'एकूण',
//     search: 'ग्राहक शोधा...',
//     filterByPeriod: 'कालावधीनुसार फिल्टर करा',
//     loading: 'ग्राहक लोड करत आहे...',
//     authChecking: 'प्रमाणीकरण तपासत आहे...',
//     noCustomers: 'अद्याप कोणतेही ग्राहक नाहीत',
//     noCustomersFound: 'ग्राहक आढळले नाहीत',
//     noMatch: 'तुमच्या फिल्टरशी कोणताही ग्राहक जुळत नाही',
//     buildBase: 'तुमचा ग्राहक आधार तयार करण्यासाठी पहिला ग्राहक जोडून सुरुवात करा',
//     addFirstCustomer: 'पहिला ग्राहक जोडा',
//     previous: '← मागील',
//     next: 'पुढील →',
//     page: 'पान',
//     logout:'लॉगआउट',
//     logoutConfirm: 'तुम्हाला खात्रीपूर्वक लॉगआउट करायचे आहे का?',
//     cancel: 'रद्द करा',
//     deleteCustomer: 'ग्राहक हटवा',
//     deleteConfirm: 'तुम्हाला खात्रीपूर्वक',
//     deleteConfirm2: 'हटवायचे आहे का? ही क्रिया पूर्ववत करता येणार नाही.',
//     delete: 'हटवा',
//     success: 'यशस्वी',
//     deletedSuccess: 'यशस्वीरित्या हटवले गेले आहे.',
//     error: 'त्रुटी',
//     deleteError: 'ग्राहक हटवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
//     callCustomer: 'ग्राहकाला कॉल करा',
//     callConfirm: 'वर कॉल करायचा का?',
//     call: 'कॉल करा',
//     sendMessage: 'संदेश पाठवा',
//     messageConfirm: 'वर एसएमएस पाठवायचा का?',
//     noPhone: 'फोन नंबर उपलब्ध नाही',
//     noName: 'नाव नाही',
//     noAddress: 'पत्ता नाही',
//     language: 'मराठी',
//   },
//   english: {
//     customers: 'Customers',
//     of: 'of',
//     total: 'total',
//     search: 'Search customers...',
//     filterByPeriod: 'Filter by Period',
//     loading: 'Loading customers...',
//     authChecking: 'Checking authentication...',
//     noCustomers: 'No customers yet',
//     noCustomersFound: 'No customers found',
//     noMatch: 'No customers match your filters',
//     buildBase: 'Start building your customer base by adding your first customer',
//     addFirstCustomer: 'Add First Customer',
//     previous: '← Previous',
//     next: 'Next →',
//     page: 'Page',
//     logout:'Logout',
//     logoutConfirm: 'Are you sure you want to logout?',
//     cancel: 'Cancel',
//     deleteCustomer: 'Delete Customer',
//     deleteConfirm: 'Are you sure you want to delete',
//     deleteConfirm2: '? This action cannot be undone.',
//     delete: 'Delete',
//     success: 'Success',
//     deletedSuccess: 'has been deleted successfully.',
//     error: 'Error',
//     deleteError: 'Failed to delete customer. Please try again.',
//     callCustomer: 'Call Customer',
//     callConfirm: 'Call',
//     call: 'Call',
//     sendMessage: 'Send Message',
//     messageConfirm: 'Send SMS to',
//     noPhone: 'Phone number not available',
//     noName: 'No name',
//     noAddress: 'No address',
//     language: 'English',
//   },
// };

// const PAGE_SIZE = 10;

// export default function HomeScreen({ navigation }: Props) {
//   const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
//   const [displayedCustomers, setDisplayedCustomers] = useState<Customer[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>('all');
//   const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [refreshing, setRefreshing] = useState<boolean>(false);
//   const [authChecked, setAuthChecked] = useState<boolean>(false);
//   const [deletingId, setDeletingId] = useState<string | null>(null);
//   const [loadingMore, setLoadingMore] = useState<boolean>(false);
//   const [hasMore, setHasMore] = useState<boolean>(true);
//   const [totalCount, setTotalCount] = useState<number>(0);
//   const [isMarathi, setIsMarathi] = useState<boolean>(true);

//   const t = isMarathi ? translations.marathi : translations.english;
//   const filterOptions = isMarathi ? FILTER_OPTIONS : FILTER_OPTIONS_EN;

//   useEffect(() => {
//     let firestoreUnsubscribe: Unsubscribe | null = null;

//     const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
//       setAuthChecked(true);

//       if (!user) {
//         setLoading(false);
//         navigation.replace("Login");
//         return;
//       }
      
//       try {
//         const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        
//         firestoreUnsubscribe = onSnapshot(
//           q,
//           (snapshot) => {
//             const customerList = snapshot.docs.map((doc) => {
//               const data = doc.data();
              
//               return {
//                 id: doc.id,
//                 name: data.name || "",
//                 phone: data.phone || "",
//                 address: data.address || "",
//                 photoURL: data.photoBase64 || data.photo || null,
//                 notifyDate: data.notifyDate?.toDate ? data.notifyDate.toDate() : data.notifyDate,
//                 notificationMethod: data.notificationMethod || 'sms',
//                 customMessage: data.customMessage || '',
//                 createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
//               } as Customer;
//             });

//             setAllCustomers(customerList);
//             setTotalCount(customerList.length);
            
//             if (loading) {
//               const firstPage = customerList.slice(0, PAGE_SIZE);
//               setDisplayedCustomers(firstPage);
//               setHasMore(customerList.length > PAGE_SIZE);
//               setLoading(false);
//               setRefreshing(false);
//             }
//           },
//           (error) => {
//             setLoading(false);
//             setRefreshing(false);
//             Alert.alert(t.error, error.message);
//           }
//         );
//       } catch (error) {
//         setLoading(false);
//         Alert.alert(t.error, "Failed to connect");
//       }
//     });

//     return () => {
//       authUnsubscribe();
//       if (firestoreUnsubscribe) {
//         firestoreUnsubscribe();
//       }
//     };
//   }, [navigation]);

//   const applyFiltersToAllData = (): Customer[] => {
//     let filtered = [...allCustomers];
    
//     if (selectedFilter !== 'all') {
//       const filterOption = filterOptions.find(opt => opt.value === selectedFilter);
//       if (filterOption && filterOption.days) {
//         const cutoffDate = new Date();
//         cutoffDate.setDate(cutoffDate.getDate() - filterOption.days);
        
//         filtered = filtered.filter(customer => {
//           const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
//           return createdAt && createdAt >= cutoffDate;
//         });
//       }
//     }
    
//     if (searchQuery.trim() !== "") {
//       const searchLower = searchQuery.toLowerCase();
//       filtered = filtered.filter((customer) =>
//         customer.name.toLowerCase().includes(searchLower) ||
//         customer.phone.toLowerCase().includes(searchLower) ||
//         customer.address.toLowerCase().includes(searchLower)
//       );
//     }
    
//     return filtered;
//   };

//   const fetchFirstPage = async () => {
//     try {
//       setLoading(true);
//       const filtered = applyFiltersToAllData();
//       const firstPage = filtered.slice(0, PAGE_SIZE);
//       setDisplayedCustomers(firstPage);
//       setHasMore(filtered.length > PAGE_SIZE);
//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleNextPage = async () => {
//     if (loadingMore || !hasMore) return;
    
//     try {
//       setLoadingMore(true);
//       const filtered = applyFiltersToAllData();
//       const currentLength = displayedCustomers.length;
//       const nextPage = filtered.slice(currentLength, currentLength + PAGE_SIZE);
      
//       if (nextPage.length > 0) {
//         setDisplayedCustomers([...displayedCustomers, ...nextPage]);
//         setHasMore(currentLength + nextPage.length < filtered.length);
//       } else {
//         setHasMore(false);
//       }
//       setLoadingMore(false);
//     } catch (error) {
//       setLoadingMore(false);
//     }
//   };

//   const handlePreviousPage = async () => {
//     if (loadingMore || displayedCustomers.length <= PAGE_SIZE) return;
    
//     try {
//       setLoadingMore(true);
//       const newLength = Math.max(PAGE_SIZE, displayedCustomers.length - PAGE_SIZE);
//       const filteredData: Customer[]  = applyFiltersToAllData();
//       const newDisplayed = filteredData.slice(0, newLength);
//       setDisplayedCustomers(newDisplayed);
//       setHasMore(newLength < filteredData.length);
//       setLoadingMore(false);
//     } catch (error) {
//       setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     if (!loading && allCustomers.length > 0) {
//       fetchFirstPage();
//     }
//   }, [selectedFilter, searchQuery]);

//   const handleFilterSelect = (filterValue: FilterPeriod) => {
//     setSelectedFilter(filterValue);
//     setShowFilterModal(false);
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchFirstPage();
//   };

//   const handleLogout = async () => {
//     Alert.alert(
//       t.logout,
//       t.logoutConfirm,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.logout,
//           style: "destructive",
//           onPress: async () => {
//             try {
//               await signOut(auth);
//               navigation.replace("Login");
//             } catch (error) {
//               Alert.alert(t.error, "Logout failed");
//             }
//           }
//         }
//       ]
//     );
//   };

//   const handleDeleteCustomer = async (customerId: string, customerName: string) => {
//     Alert.alert(
//       t.deleteCustomer,
//       `${t.deleteConfirm} ${customerName} ${t.deleteConfirm2}`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.delete,
//           style: "destructive",
//           onPress: async () => {
//             try {
//               setDeletingId(customerId);
//               await deleteDoc(doc(db, "customers", customerId));
//               Alert.alert(t.success, `${customerName} ${t.deletedSuccess}`);
//             } catch (error) {
//               Alert.alert(t.error, t.deleteError);
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
//       Alert.alert(t.error, t.noPhone);
//       return;
//     }

//     Alert.alert(
//       t.callCustomer,
//       `${t.callConfirm} ${phone}?`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.call,
//           onPress: () => {
//             Linking.openURL(`tel:${phone}`).catch(() => {
//               Alert.alert(t.error, "Cannot make call");
//             });
//           }
//         }
//       ]
//     );
//   };

//   const handleMessageCustomer = (phone: string) => {
//     if (!phone) {
//       Alert.alert(t.error, t.noPhone);
//       return;
//     }

//     Alert.alert(
//       t.sendMessage,
//       `${t.messageConfirm} ${phone}?`,
//       [
//         { text: t.cancel, style: "cancel" },
//         {
//           text: t.sendMessage,
//           onPress: () => {
//             Linking.openURL(`sms:${phone}`).catch(() => {
//               Alert.alert(t.error, "Cannot send message");
//             });
//           }
//         }
//       ]
//     );
//   };

//   const renderCustomerCard = ({ item }: { item: Customer }) => (
//     <TouchableOpacity
//       style={styles.customerCard}
//       onPress={() => navigation.navigate("ViewCustomer", { customer: item })}
//       activeOpacity={0.7}
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.photoContainer}>
//           <View style={styles.placeholderPhoto}>
//             <Text style={styles.placeholderText}>
//               {item.name?.charAt(0)?.toUpperCase() || "?"}
//             </Text>
//           </View>
//         </View>
        
//         <View style={styles.customerInfo}>
//           <View style={styles.nameRow}>
//             <Text style={styles.customerName} numberOfLines={1}>{item.name || t.noName}</Text>
//             {item.notifyDate && (
//               <View style={styles.reminderBadge}>
//                 <Text style={styles.reminderText}>!</Text>
//               </View>
//             )}
//           </View>
          
//           <View style={styles.detailsRow}>
//             <TouchableOpacity onPress={() => handleCallCustomer(item.phone)} style={styles.phoneContainer}>
//               <Text style={styles.infoIcon}>📞</Text>
//               <Text style={styles.customerPhone} numberOfLines={1}>{item.phone || t.noPhone}</Text>
//             </TouchableOpacity>
            
//             <View style={styles.addressContainer}>
//               <Text style={styles.infoIcon}>📍</Text>
//               <Text style={styles.customerAddress} numberOfLines={1}>{item.address || t.noAddress}</Text>
//             </View>
//           </View>
          
//           {item.notifyDate && (
//             <View style={styles.reminderRow}>
//               <Text style={styles.infoIcon}>🔔</Text>
//               <Text style={styles.notificationDate} numberOfLines={1}>
//                 {new Date(item.notifyDate).toLocaleDateString('mr-IN')}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.actionButtons}>
//           <TouchableOpacity style={styles.actionButton} onPress={() => handleCallCustomer(item.phone)}>
//             <Text style={styles.actionIcon}>📞</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={styles.actionButton} onPress={() => handleMessageCustomer(item.phone)}>
//             <Text style={styles.actionIcon}>💬</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditCustomer(item)}>
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
//         {searchQuery || selectedFilter !== 'all' ? t.noCustomersFound : t.noCustomers}
//       </Text>
//       <Text style={styles.emptyStateDescription}>
//         {searchQuery || selectedFilter !== 'all' ? t.noMatch : t.buildBase}
//       </Text>
//       {!searchQuery && selectedFilter === 'all' && (
//         <TouchableOpacity
//           style={styles.addFirstCustomerButton}
//           onPress={() => navigation.navigate("AddCustomer")}
//         >
//           <Text style={styles.addFirstCustomerButtonText}>{t.addFirstCustomer}</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const renderPaginationButtons = () => {
//     if (loading) return null;

//     const filtered = applyFiltersToAllData();
//     const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//     const currentPage = Math.floor(displayedCustomers.length / PAGE_SIZE);
//     const hasNext = displayedCustomers.length < filtered.length;
//     const hasPrevious = displayedCustomers.length > PAGE_SIZE;

//     if (totalPages <= 1) return null;

//     return (
//       <View style={styles.paginationContainer}>
//         <TouchableOpacity
//           style={[styles.paginationButton, !hasPrevious && styles.paginationButtonDisabled]}
//           onPress={handlePreviousPage}
//           disabled={!hasPrevious || loadingMore}
//         >
//           <Text style={[styles.paginationButtonText, !hasPrevious && styles.paginationButtonTextDisabled]}>
//             {t.previous}
//           </Text>
//         </TouchableOpacity>

//         <View style={styles.paginationInfo}>
//           <Text style={styles.paginationText}>
//             {t.page} {currentPage} {t.of} {totalPages}
//           </Text>
//           <Text style={styles.paginationSubtext}>
//             ({displayedCustomers.length} {t.of} {filtered.length})
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={[styles.paginationButton, !hasNext && styles.paginationButtonDisabled]}
//           onPress={handleNextPage}
//           disabled={!hasNext || loadingMore}
//         >
//           {loadingMore ? (
//             <ActivityIndicator size="small" color="#007bff" />
//           ) : (
//             <Text style={[styles.paginationButtonText, !hasNext && styles.paginationButtonTextDisabled]}>
//               {t.next}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   if (!authChecked) {
//     return (
//       <View style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor="#fff" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//           <Text style={styles.loadingText}>{t.authChecking}</Text>
//         </View>
//       </View>
//     );
//   }

//   const filteredTotal = applyFiltersToAllData().length;

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <View style={styles.titleContainer}>
//             <Text style={styles.headerIcon}>👥</Text>
//             <View>
//               <Text style={styles.headerTitle}>{t.customers}</Text>
//               <Text style={styles.headerSubtitle}>
//                 {displayedCustomers.length} {t.of} {filteredTotal} {filteredTotal !== totalCount ? `(${totalCount} ${t.total})` : ''}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.headerRightButtons}>
//             <TouchableOpacity 
//               style={styles.languageToggle} 
//               onPress={() => setIsMarathi(!isMarathi)}
//             >
//               <View style={styles.checkboxContainer}>
//                 <View style={[styles.checkbox, isMarathi && styles.checkboxChecked]}>
//                   {isMarathi && <Text style={styles.checkmark}>✓</Text>}
//                 </View>
//                 <Text style={styles.languageText}>{t.language}</Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <Text style={styles.logoutIcon}>📤</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <View style={styles.searchAndFilterContainer}>
//         <View style={styles.searchInputContainer}>
//           <Text style={styles.searchIcon}>🔍</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder={t.search}
//             placeholderTextColor="#999"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery("")}>
//               <Text style={styles.clearSearchText}>✕</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         <TouchableOpacity style={styles.filterButtonCompact} onPress={() => setShowFilterModal(true)}>
//           <Text style={styles.filterIconCompact}>⚙️</Text>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showFilterModal}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setShowFilterModal(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowFilterModal(false)}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{t.filterByPeriod}</Text>
//               <TouchableOpacity onPress={() => setShowFilterModal(false)}>
//                 <Text style={styles.modalCloseButton}>✕</Text>
//               </TouchableOpacity>
//             </View>
            
//             {filterOptions.map((option) => (
//               <TouchableOpacity
//                 key={option.value}
//                 style={[
//                   styles.filterOption,
//                   selectedFilter === option.value && styles.filterOptionSelected
//                 ]}
//                 onPress={() => handleFilterSelect(option.value)}
//               >
//                 <Text style={[
//                   styles.filterOptionText,
//                   selectedFilter === option.value && styles.filterOptionTextSelected
//                 ]}>
//                   {option.label}
//                 </Text>
//                 {selectedFilter === option.value && (
//                   <Text style={styles.filterOptionCheck}>✓</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007bff" />
//           <Text style={styles.loadingText}>{t.loading}</Text>
//         </View>
//       ) : displayedCustomers.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={displayedCustomers}
//           keyExtractor={(item) => item.id || Math.random().toString()}
//           renderItem={renderCustomerCard}
//           contentContainerStyle={styles.listContainer}
//           ListFooterComponent={renderPaginationButtons}
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
//           maxToRenderPerBatch={10}
//           windowSize={10}
//           initialNumToRender={10}
//         />
//       )}

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
//    headerRightButtons: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   languageToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f5f7f5ff",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   checkboxContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
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
//   },
//   header: {
//     backgroundColor: "#4A90E2",
//     paddingTop: Platform.OS === 'ios' ? 45 : 15,
//     paddingBottom: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 0,
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
//     fontSize: 26,
//     marginRight: 8,
//     backgroundColor: '#f8f9faff',
//     borderRadius: 22,
//     paddingBottom: 10,
//     paddingLeft: 6,
//     paddingRight: 6,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   headerSubtitle: {
//     fontSize: 12,
//     color: "#fff",
//     marginTop: 1,
//   },
//   logoutButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#eff2f5ff",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#f0f3f8ff",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   logoutIcon: {
//     fontSize: 20,
//     color: "#fff",
//   },
//   searchAndFilterContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     gap: 8,
//   },
//   searchInputContainer: {
//     flex: 1,
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
//   filterButtonCompact: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#e1e5e9",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   filterIconCompact: {
//     fontSize: 20,
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
//     padding: 8,
//     paddingBottom: 80,
//   },
//   customerCard: {
//     backgroundColor: "#fff",
//     borderRadius: 6,
//     marginBottom: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//     borderWidth: 1,
//     borderColor: "#f0f0f0",
//   },
//   cardContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 10,
//     minHeight: 60,
//   },
//   photoContainer: {
//     marginRight: 8,
//   },
//   customerPhoto: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#f0f0f0",
//   },
//   placeholderPhoto: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   placeholderText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   customerInfo: {
//     flex: 1,
//     marginRight: 8,
//   },
//   nameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   customerName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1a1a1a",
//     flex: 1,
//   },
//   reminderBadge: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: "#28a745",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 4,
//   },
//   reminderText: {
//     color: "#fff",
//     fontSize: 9,
//     fontWeight: "bold",
//   },
//   detailsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 2,
//   },
//   phoneContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginRight: 8,
//   },
//   addressContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1.5,
//   },
//   reminderRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   infoIcon: {
//     fontSize: 10,
//     width: 12,
//     marginRight: 4,
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
//     flexDirection: "row",
//     gap: 4,
//   },
//   actionButton: {
//     width: 26,
//     height: 30,
//     borderRadius: 4,
//     backgroundColor: "#f8f9fa",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 0.5,
//     borderColor: "#e1e5e9",
//   },
//   actionIcon: {
//     fontSize: 14,
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
//     bottom: Platform.OS === 'ios' ? 90 : 70,
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
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     width: '100%',
//     maxWidth: 400,
//     maxHeight: '80%',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#212529',
//   },
//   modalCloseButton: {
//     fontSize: 24,
//     color: '#6c757d',
//     fontWeight: '300',
//     paddingHorizontal: 8,
//   },
//   filterOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f3f5',
//   },
//   filterOptionSelected: {
//     backgroundColor: '#e7f3ff',
//   },
//   filterOptionText: {
//     fontSize: 16,
//     color: '#495057',
//   },
//   filterOptionTextSelected: {
//     color: '#007bff',
//     fontWeight: '600',
//   },
//   filterOptionCheck: {
//     fontSize: 18,
//     color: '#007bff',
//     fontWeight: 'bold',
//   },
//   paginationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//     backgroundColor: '#fff',
//     marginHorizontal: 8,
//     marginTop: 8,
//     marginBottom: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e1e5e9',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   paginationButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 6,
//     minWidth: 100,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   paginationButtonDisabled: {
//     backgroundColor: '#e9ecef',
//   },
//   paginationButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   paginationButtonTextDisabled: {
//     color: '#adb5bd',
//   },
//   paginationInfo: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   paginationText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#212529',
//   },
//   paginationSubtext: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginTop: 2,
//   },
// });


import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  StatusBar,
  Platform,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, Customer } from "../types";
import { db, auth } from "../firebaseConfig";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Unsubscribe, 
  doc, 
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import * as Notifications from 'expo-notifications';
import NotificationItem from './NotificationItem';
type HomeNavProp = NativeStackNavigationProp<RootStackParamList, "Home">;
type Props = { navigation: HomeNavProp };

type FilterPeriod = 'all' | '15days' | '1month' | '6months' | '1year' | '2years';

interface FilterOption {
  label: string;
  value: FilterPeriod;
  days: number | null;
}

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

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'सर्व नोंदी', value: 'all', days: null },
  { label: 'गेले १५ दिवस', value: '15days', days: 15 },
  { label: 'गेला १ महिना', value: '1month', days: 30 },
  { label: 'गेले ६ महिने', value: '6months', days: 180 },
  { label: 'गेले १ वर्ष', value: '1year', days: 365 },
  { label: 'गेली २ वर्षे', value: '2years', days: 730 },
];

const FILTER_OPTIONS_EN: FilterOption[] = [
  { label: 'All Records', value: 'all', days: null },
  { label: 'Last 15 Days', value: '15days', days: 15 },
  { label: 'Last 1 Month', value: '1month', days: 30 },
  { label: 'Last 6 Months', value: '6months', days: 180 },
  { label: 'Last 1 Year', value: '1year', days: 365 },
  { label: 'Last 2 Years', value: '2years', days: 730 },
];

const translations = {
  marathi: {
    customers: 'ग्राहक',
    of: 'पैकी',
    total: 'एकूण',
    search: 'ग्राहक शोधा...',
    filterByPeriod: 'कालावधीनुसार फिल्टर करा',
    loading: 'ग्राहक लोड करत आहे...',
    authChecking: 'प्रमाणीकरण तपासत आहे...',
    noCustomers: 'अद्याप कोणतेही ग्राहक नाहीत',
    noCustomersFound: 'ग्राहक आढळले नाहीत',
    noMatch: 'तुमच्या फिल्टरशी कोणताही ग्राहक जुळत नाही',
    buildBase: 'तुमचा ग्राहक आधार तयार करण्यासाठी पहिला ग्राहक जोडून सुरुवात करा',
    addFirstCustomer: 'पहिला ग्राहक जोडा',
    previous: '← मागील',
    next: 'पुढील →',
    page: 'पान',
    logout:'लॉगआउट',
    logoutConfirm: 'तुम्हाला खात्रीपूर्वक लॉगआउट करायचे आहे का?',
    cancel: 'रद्द करा',
    deleteCustomer: 'ग्राहक हटवा',
    deleteConfirm: 'तुम्हाला खात्रीपूर्वक',
    deleteConfirm2: 'हटवायचे आहे का? ही क्रिया पूर्ववत करता येणार नाही.',
    delete: 'हटवा',
    success: 'यशस्वी',
    deletedSuccess: 'यशस्वीरित्या हटवले गेले आहे.',
    error: 'त्रुटी',
    deleteError: 'ग्राहक हटवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    callCustomer: 'ग्राहकाला कॉल करा',
    callConfirm: 'वर कॉल करायचा का?',
    call: 'कॉल करा',
    sendMessage: 'संदेश पाठवा',
    messageConfirm: 'वर एसएमएस पाठवायचा का?',
    noPhone: 'फोन नंबर उपलब्ध नाही',
    noName: 'नाव नाही',
    noAddress: 'पत्ता नाही',
    language: 'मराठी',
    notifications: 'सूचना',
    noNotifications: 'कोणत्याही सूचना नाहीत',
    noNotificationsDesc: 'सर्व सूचना पाहिल्या गेल्या आहेत',
    clearAll: 'सर्व साफ करा',
    markAsViewed: 'पाहिले म्हणून चिन्हांकित करा',
    removeNotification: 'सूचना काढा',
    scheduledFor: 'वेळापत्रक:',
    customer: 'ग्राहक:',
    phone: 'फोन:',
    message: 'संदेश:',
    notificationRemoved: 'सूचना काढली',
    allNotificationsCleared: 'सर्व सूचना साफ केल्या',
    confirmClearAll: 'सर्व सूचना साफ करायच्या?',
    confirmClearAllDesc: 'हे सर्व स्मरणपत्रे काढून टाकेल.',
     sendReminder: 'स्मरणपत्र पाठवा',
    messageSent: 'संदेश पाठवला',
    messageSentSuccess: 'स्मरणपत्र यशस्वीरित्या पाठवले.',
  },
  english: {
    customers: 'Customers',
    of: 'of',
    total: 'total',
    search: 'Search customers...',
    filterByPeriod: 'Filter by Period',
    loading: 'Loading customers...',
    authChecking: 'Checking authentication...',
    noCustomers: 'No customers yet',
    noCustomersFound: 'No customers found',
    noMatch: 'No customers match your filters',
    buildBase: 'Start building your customer base by adding your first customer',
    addFirstCustomer: 'Add First Customer',
    previous: '← Previous',
    next: 'Next →',
    page: 'Page',
    logout:'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    deleteCustomer: 'Delete Customer',
    deleteConfirm: 'Are you sure you want to delete',
    deleteConfirm2: '? This action cannot be undone.',
    delete: 'Delete',
    success: 'Success',
    deletedSuccess: 'has been deleted successfully.',
    error: 'Error',
    deleteError: 'Failed to delete customer. Please try again.',
    callCustomer: 'Call Customer',
    callConfirm: 'Call',
    call: 'Call',
    sendMessage: 'Send Message',
    messageConfirm: 'Send SMS to',
    noPhone: 'Phone number not available',
    noName: 'No name',
    noAddress: 'No address',
    language: 'English',
    notifications: 'Notifications',
    noNotifications: 'No Notifications',
    noNotificationsDesc: 'All caught up!',
    clearAll: 'Clear All',
    markAsViewed: 'Mark as Viewed',
    removeNotification: 'Remove Notification',
    scheduledFor: 'Scheduled for:',
    customer: 'Customer:',
    phone: 'Phone:',
    message: 'Message:',
    notificationRemoved: 'Notification removed',
    allNotificationsCleared: 'All notifications cleared',
    confirmClearAll: 'Clear all notifications?',
    confirmClearAllDesc: 'This will remove all reminders.',
    sendReminder: 'Send Reminder',
    messageSent: 'Message Sent',
    messageSentSuccess: 'Reminder sent successfully.',

  },
};

const PAGE_SIZE = 10;

export default function HomeScreen({ navigation }: Props) {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [displayedCustomers, setDisplayedCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<FilterPeriod>('all');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isMarathi, setIsMarathi] = useState<boolean>(true);
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [reminders, setReminders] = useState<StoredReminder[]>([]);
  const [unviewedCount, setUnviewedCount] = useState<number>(0);

  const t = isMarathi ? translations.marathi : translations.english;
  const filterOptions = isMarathi ? FILTER_OPTIONS : FILTER_OPTIONS_EN;

 const loadReminders = async () => {
  try {
    const remindersData = await AsyncStorage.getItem('customerReminders');
    if (remindersData) {
      const parsedReminders: StoredReminder[] = JSON.parse(remindersData);
      
      // Filter to show only reminders where the scheduled time has passed
      const now = new Date();
      const activeReminders = parsedReminders.filter(reminder => {
        const scheduledDate = new Date(reminder.date);
        return scheduledDate <= now; // Only show if time has passed
      });
      
      setReminders(activeReminders);
      
      // Count unviewed notifications (only from active reminders)
      const unviewed = activeReminders.filter(r => !r.viewed).length;
      setUnviewedCount(unviewed);
    }
  } catch (error) {
    console.error('Failed to load reminders:', error);
  }
};

  // Mark notification as viewed
  const markAsViewed = async (reminderId: string) => {
    try {
      const updatedReminders = reminders.map(r => 
        r.id === reminderId ? { ...r, viewed: true } : r
      );
      await AsyncStorage.setItem('customerReminders', JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
      
      const unviewed = updatedReminders.filter(r => !r.viewed).length;
      setUnviewedCount(unviewed);
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  // Remove single notification
  const removeNotification = async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      
      // Cancel scheduled notification if exists
      if (reminder?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }
      
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      await AsyncStorage.setItem('customerReminders', JSON.stringify(updatedReminders));
      setReminders(updatedReminders);
      
      const unviewed = updatedReminders.filter(r => !r.viewed).length;
      setUnviewedCount(unviewed);
      
      Alert.alert(t.success, t.notificationRemoved);
    } catch (error) {
      console.error('Failed to remove notification:', error);
      Alert.alert(t.error, 'Failed to remove notification');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    Alert.alert(
      t.confirmClearAll,
      t.confirmClearAllDesc,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.clearAll,
          style: 'destructive',
          onPress: async () => {
            try {
              // Cancel all scheduled notifications
              for (const reminder of reminders) {
                if (reminder.notificationId) {
                  await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
                }
              }
              
              await AsyncStorage.setItem('customerReminders', JSON.stringify([]));
              setReminders([]);
              setUnviewedCount(0);
              setShowNotifications(false);
              
              Alert.alert(t.success, t.allNotificationsCleared);
            } catch (error) {
              console.error('Failed to clear notifications:', error);
              Alert.alert(t.error, 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    let firestoreUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthChecked(true);

      if (!user) {
        setLoading(false);
        navigation.replace("Login");
        return;
      }
      
      // Load reminders when authenticated
      await loadReminders();
      
      try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        
        firestoreUnsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const customerList = snapshot.docs.map((doc) => {
              const data = doc.data();
              
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

            setAllCustomers(customerList);
            setTotalCount(customerList.length);
            
            if (loading) {
              const firstPage = customerList.slice(0, PAGE_SIZE);
              setDisplayedCustomers(firstPage);
              setHasMore(customerList.length > PAGE_SIZE);
              setLoading(false);
              setRefreshing(false);
            }
          },
          (error) => {
            setLoading(false);
            setRefreshing(false);
            Alert.alert(t.error, error.message);
          }
        );
      } catch (error) {
        setLoading(false);
        Alert.alert(t.error, "Failed to connect");
      }
    });

    return () => {
      authUnsubscribe();
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }, [navigation]);

  // Refresh reminders when modal is opened
  useEffect(() => {
    if (showNotifications) {
      loadReminders();
    }
  }, [showNotifications]);

  const applyFiltersToAllData = (): Customer[] => {
    let filtered = [...allCustomers];
    
    if (selectedFilter !== 'all') {
      const filterOption = filterOptions.find(opt => opt.value === selectedFilter);
      if (filterOption && filterOption.days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filterOption.days);
        
        filtered = filtered.filter(customer => {
          const createdAt = customer.createdAt ? new Date(customer.createdAt) : null;
          return createdAt && createdAt >= cutoffDate;
        });
      }
    }
    
    if (searchQuery.trim() !== "") {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.toLowerCase().includes(searchLower) ||
        customer.address.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const fetchFirstPage = async () => {
    try {
      setLoading(true);
      const filtered = applyFiltersToAllData();
      const firstPage = filtered.slice(0, PAGE_SIZE);
      setDisplayedCustomers(firstPage);
      setHasMore(filtered.length > PAGE_SIZE);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNextPage = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const filtered = applyFiltersToAllData();
      const currentLength = displayedCustomers.length;
      const nextPage = filtered.slice(currentLength, currentLength + PAGE_SIZE);
      
      if (nextPage.length > 0) {
        setDisplayedCustomers([...displayedCustomers, ...nextPage]);
        setHasMore(currentLength + nextPage.length < filtered.length);
      } else {
        setHasMore(false);
      }
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
    }
  };

  const handlePreviousPage = async () => {
    if (loadingMore || displayedCustomers.length <= PAGE_SIZE) return;
    
    try {
      setLoadingMore(true);
      const newLength = Math.max(PAGE_SIZE, displayedCustomers.length - PAGE_SIZE);
      const filteredData: Customer[]  = applyFiltersToAllData();
      const newDisplayed = filteredData.slice(0, newLength);
      setDisplayedCustomers(newDisplayed);
      setHasMore(newLength < filteredData.length);
      setLoadingMore(false);
    } catch (error) {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!loading && allCustomers.length > 0) {
      fetchFirstPage();
    }
  }, [selectedFilter, searchQuery]);

  const handleFilterSelect = (filterValue: FilterPeriod) => {
    setSelectedFilter(filterValue);
    setShowFilterModal(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFirstPage();
    loadReminders();
  };

  const handleLogout = async () => {
    Alert.alert(
      t.logout,
      t.logoutConfirm,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.logout,
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              Alert.alert(t.error, "Logout failed");
            }
          }
        }
      ]
    );
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    Alert.alert(
      t.deleteCustomer,
      `${t.deleteConfirm} ${customerName} ${t.deleteConfirm2}`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.delete,
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(customerId);
              await deleteDoc(doc(db, "customers", customerId));
              Alert.alert(t.success, `${customerName} ${t.deletedSuccess}`);
            } catch (error) {
              Alert.alert(t.error, t.deleteError);
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
      Alert.alert(t.error, t.noPhone);
      return;
    }

    Alert.alert(
      t.callCustomer,
      `${t.callConfirm} ${phone}?`,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.call,
          onPress: () => {
            Linking.openURL(`tel:${phone}`).catch(() => {
              Alert.alert(t.error, "Cannot make call");
            });
          }
        }
      ]
    );
  };

const handleMessageCustomer = (phone: string) => {
  if (!phone) {
    Alert.alert(t.error, t.noPhone);
    return;
  }

  Alert.alert(
    t.sendMessage,
    `${t.messageConfirm} ${phone}?`,
    [
      { text: t.cancel, style: "cancel" },
      {
        text: "SMS",
        onPress: () => {
          Linking.openURL(`sms:${phone}`).catch(() => {
            Alert.alert(t.error, "Cannot send SMS");
          });
        }
      },
      {
        text: "WhatsApp",
        onPress: () => {
          // Remove any non-digit characters from phone number
          const cleanPhone = phone.replace(/\D/g, '');
          Linking.openURL(`whatsapp://send?phone=${cleanPhone}`).catch(() => {
            Alert.alert(t.error, "Cannot open WhatsApp. Make sure it's installed.");
          });
        }
      }
    ]
  );
};

  const renderCustomerCard = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate("ViewCustomer", { customer: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.photoContainer}>
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>
              {item.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        </View>
        
        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.customerName} numberOfLines={1}>{item.name || t.noName}</Text>
            {item.notifyDate && (
              <View style={styles.reminderBadge}>
                <Text style={styles.reminderText}>!</Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailsRow}>
            <TouchableOpacity onPress={() => handleCallCustomer(item.phone)} style={styles.phoneContainer}>
              <Text style={styles.infoIcon}>📞</Text>
              <Text style={styles.customerPhone} numberOfLines={1}>{item.phone || t.noPhone}</Text>
            </TouchableOpacity>
            
            <View style={styles.addressContainer}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={styles.customerAddress} numberOfLines={1}>{item.address || t.noAddress}</Text>
            </View>
          </View>
          
          {item.notifyDate && (
            <View style={styles.reminderRow}>
              <Text style={styles.infoIcon}>🔔</Text>
              <Text style={styles.notificationDate} numberOfLines={1}>
                {new Date(item.notifyDate).toLocaleDateString('mr-IN')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleCallCustomer(item.phone)}>
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => handleMessageCustomer(item.phone)}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditCustomer(item)}>
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

//   const renderNotificationItem = ({ item }: { item: StoredReminder }) => {
//   const scheduledDate = new Date(item.date);
//   const now = new Date();
//   const isOverdue = scheduledDate < now;
  
//   // Calculate how long ago the reminder was due
//   const timeDiff = now.getTime() - scheduledDate.getTime();
//   const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
//   const hoursOverdue = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
//   let overdueText = '';
//   if (daysOverdue > 0) {
//     overdueText = isMarathi 
//       ? `${daysOverdue} दिवस आधी` 
//       : `${daysOverdue} days ago`;
//   } else if (hoursOverdue > 0) {
//     overdueText = isMarathi 
//       ? `${hoursOverdue} तास आधी` 
//       : `${hoursOverdue} hours ago`;
//   } else {
//     overdueText = isMarathi ? 'नुकतेच' : 'Just now';
//   }
  
//   return (
//     <View style={[styles.notificationItem, !item.viewed && styles.notificationItemUnviewed]}>
//       <View style={styles.notificationHeader}>
//         <View style={styles.notificationTitleRow}>
//           <Text style={styles.notificationIcon}>🔔</Text>
//           <Text style={styles.notificationCustomerName}>{item.name}</Text>
//           {!item.viewed && <View style={styles.unviewedDot} />}
//         </View>
//         <TouchableOpacity onPress={() => removeNotification(item.id)}>
//           <Text style={styles.removeNotificationButton}>✕</Text>
//         </TouchableOpacity>
//       </View>
      
//       <View style={styles.notificationBody}>
//         <Text style={styles.notificationLabel}>{t.scheduledFor}</Text>
//         <Text style={[styles.notificationDate, isOverdue && styles.notificationOverdue]}>
//           {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//           {isOverdue && ` (${overdueText})`}
//         </Text>
        
//         <Text style={styles.notificationLabel}>{t.phone}</Text>
//         <Text style={styles.notificationPhone}>{item.phone}</Text>
        
//         <Text style={styles.notificationLabel}>{t.message}</Text>
//         <Text style={styles.notificationMessage} numberOfLines={3}>
//           {item.customMessage || `नमस्कार ${item.name}, ही तुम्हाला दिलेली आठवण आहे की तुमच्या उपकरणाची सर्व्हिसिंग बाकी आहे. कृपया 8446682152 या क्रमांकावर संपर्क साधा.`}
//         </Text>
//       </View>
      
//       {/* Action buttons */}
//       <View style={styles.notificationActions}>
//         {/* Send Message Button */}
//         <TouchableOpacity 
//           style={styles.sendMessageButton}
//           onPress={() => sendReminderMessage(item)}
//         >
//           <Text style={styles.sendMessageIcon}>💬</Text>
//           <Text style={styles.sendMessageText}>{t.sendReminder}</Text>
//         </TouchableOpacity>
        
//         {/* Mark as Viewed Button */}
//         {!item.viewed && (
//           <TouchableOpacity 
//             style={styles.markViewedButton}
//             onPress={() => markAsViewed(item.id)}
//           >
//             <Text style={styles.markViewedText}>{t.markAsViewed}</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );
// };

const renderNotificationItem = ({ item }: { item: StoredReminder }) => (
  <NotificationItem
    item={item}
    isMarathi={isMarathi}
    onRemove={removeNotification}
    onMarkAsViewed={markAsViewed}
  />
);
  // const renderNotificationItem = ({ item }: { item: StoredReminder }) => {
  //   const scheduledDate = new Date(item.date);
  //   const isOverdue = scheduledDate < new Date();
    
  //   return (
  //     <View style={[styles.notificationItem, !item.viewed && styles.notificationItemUnviewed]}>
  //       <View style={styles.notificationHeader}>
  //         <View style={styles.notificationTitleRow}>
  //           <Text style={styles.notificationIcon}>🔔</Text>
  //           <Text style={styles.notificationCustomerName}>{item.name}</Text>
  //           {!item.viewed && <View style={styles.unviewedDot} />}
  //         </View>
  //         <TouchableOpacity onPress={() => removeNotification(item.id)}>
  //           <Text style={styles.removeNotificationButton}>✕</Text>
  //         </TouchableOpacity>
  //       </View>
        
  //       <View style={styles.notificationBody}>
  //         <Text style={styles.notificationLabel}>{t.scheduledFor}</Text>
  //         <Text style={[styles.notificationDate, isOverdue && styles.notificationOverdue]}>
  //           {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  //           {isOverdue && ' (Overdue)'}
  //         </Text>
          
  //         <Text style={styles.notificationLabel}>{t.phone}</Text>
  //         <Text style={styles.notificationPhone}>{item.phone}</Text>
          
  //         <Text style={styles.notificationLabel}>{t.message}</Text>
  //         <Text style={styles.notificationMessage} numberOfLines={3}>
  //           {item.customMessage || '---'}
  //         </Text>
  //       </View>
        
  //       {!item.viewed && (
  //         <TouchableOpacity 
  //           style={styles.markViewedButton}
  //           onPress={() => markAsViewed(item.id)}
  //         >
  //           <Text style={styles.markViewedText}>{t.markAsViewed}</Text>
  //         </TouchableOpacity>
  //       )}
  //     </View>
  //   );
  // };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👥</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedFilter !== 'all' ? t.noCustomersFound : t.noCustomers}
      </Text>
      <Text style={styles.emptyStateDescription}>
        {searchQuery || selectedFilter !== 'all' ? t.noMatch : t.buildBase}
      </Text>
      {!searchQuery && selectedFilter === 'all' && (
        <TouchableOpacity
          style={styles.addFirstCustomerButton}
          onPress={() => navigation.navigate("AddCustomer")}
        >
          <Text style={styles.addFirstCustomerButtonText}>{t.addFirstCustomer}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPaginationButtons = () => {
    if (loading) return null;

    const filtered = applyFiltersToAllData();
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const currentPage = Math.floor(displayedCustomers.length / PAGE_SIZE);
    const hasNext = displayedCustomers.length < filtered.length;
    const hasPrevious = displayedCustomers.length > PAGE_SIZE;

    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, !hasPrevious && styles.paginationButtonDisabled]}
          onPress={handlePreviousPage}
          disabled={!hasPrevious || loadingMore}
        >
          <Text style={[styles.paginationButtonText, !hasPrevious && styles.paginationButtonTextDisabled]}>
            {t.previous}
          </Text>
        </TouchableOpacity>

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            {t.page} {currentPage} {t.of} {totalPages}
          </Text>
          <Text style={styles.paginationSubtext}>
            ({displayedCustomers.length} {t.of} {filtered.length})
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.paginationButton, !hasNext && styles.paginationButtonDisabled]}
          onPress={handleNextPage}
          disabled={!hasNext || loadingMore}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={[styles.paginationButtonText, !hasNext && styles.paginationButtonTextDisabled]}>
              {t.next}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (!authChecked) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{t.authChecking}</Text>
        </View>
      </View>
    );
  }

  const filteredTotal = applyFiltersToAllData().length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerIcon}>👥</Text>
            <View>
              <Text style={styles.headerTitle}>{t.customers}</Text>
              <Text style={styles.headerSubtitle}>
                {displayedCustomers.length} {t.of} {filteredTotal} {filteredTotal !== totalCount ? `(${totalCount} ${t.total})` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.headerRightButtons}>
            {/* Notification Bell Icon */}
            <TouchableOpacity 
              style={styles.notificationBellButton} 
              onPress={() => setShowNotifications(true)}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unviewedCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unviewedCount > 99 ? '99+' : unviewedCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.languageToggle} 
              onPress={() => setIsMarathi(!isMarathi)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, isMarathi && styles.checkboxChecked]}>
                  {isMarathi && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.languageText}>{t.language}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>📤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.searchAndFilterContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t.search}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterButtonCompact} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterIconCompact}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.filterByPeriod}</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  selectedFilter === option.value && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterSelect(option.value)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === option.value && styles.filterOptionTextSelected
                ]}>
                  {option.label}
                </Text>
                {selectedFilter === option.value && (
                  <Text style={styles.filterOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={styles.notificationModalHeader}>
              <View style={styles.notificationModalTitleRow}>
                <Text style={styles.notificationModalIcon}>🔔</Text>
                <Text style={styles.notificationModalTitle}>{t.notifications}</Text>
                {unviewedCount > 0 && (
                  <View style={styles.notificationCountBadge}>
                    <Text style={styles.notificationCountText}>{unviewedCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.notificationModalActions}>
                {reminders.length > 0 && (
                  <TouchableOpacity onPress={clearAllNotifications} style={styles.clearAllButton}>
                    <Text style={styles.clearAllButtonText}>{t.clearAll}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {reminders.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Text style={styles.emptyNotificationsIcon}>✅</Text>
                <Text style={styles.emptyNotificationsTitle}>{t.noNotifications}</Text>
                <Text style={styles.emptyNotificationsDesc}>{t.noNotificationsDesc}</Text>
              </View>
            ) : (
              <FlatList
                data={reminders.sort((a, b) => {
                  // Sort unviewed first, then by date
                  if (a.viewed === b.viewed) {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                  }
                  return a.viewed ? 1 : -1;
                })}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                contentContainerStyle={styles.notificationsList}
                showsVerticalScrollIndicator={true}
              />
            )}
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      ) : displayedCustomers.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={displayedCustomers}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderCustomerCard}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={renderPaginationButtons}
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
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      )}

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
  
notificationActions: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 12,
},
sendMessageButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#28a745',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 6,
  gap: 6,
},
sendMessageIcon: {
  fontSize: 16,
},
sendMessageText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
markViewedButton: {
  flex: 1,
  backgroundColor: '#007bff',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 6,
  alignItems: 'center',
},
notificationDate: {
  fontSize: 14,
  color: '#28a745',
  fontWeight: '500',
},
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationBellButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff2f5ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f0f3f8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bellIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7f5ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingTop: Platform.OS === 'ios' ? 45 : 15,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
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
    fontSize: 26,
    marginRight: 8,
    backgroundColor: '#f8f9faff',
    borderRadius: 22,
    paddingBottom: 10,
    paddingLeft: 6,
    paddingRight: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#fff",
    marginTop: 1,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff2f5ff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f0f3f8ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    fontSize: 20,
    color: "#fff",
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
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
  filterButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterIconCompact: {
    fontSize: 20,
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
  // notificationDate: {
  //   fontSize: 12,
  //   color: "#28a745",
  //   fontWeight: "500",
  //   flex: 1,
  // },
  actionButtons: {
    flexDirection: "row",
    gap: 4,
  },
  actionButton: {
    width: 26,
    height: 30,
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#e1e5e9",
  },
  actionIcon: {
    fontSize: 14,
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
    bottom: Platform.OS === 'ios' ? 90 : 70,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#6c757d',
    fontWeight: '300',
    paddingHorizontal: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  filterOptionSelected: {
    backgroundColor: '#e7f3ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#495057',
  },
  filterOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  paginationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#adb5bd',
  },
  paginationInfo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  paginationSubtext: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  notificationModalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  notificationModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationModalIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  notificationCountBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  notificationCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc3545',
    borderRadius: 6,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notificationItemUnviewed: {
    backgroundColor: '#e7f3ff',
    borderColor: '#007bff',
    borderWidth: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notificationCustomerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  unviewedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  removeNotificationButton: {
    fontSize: 20,
    color: '#dc3545',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  notificationBody: {
    marginBottom: 12,
  },
  notificationLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  // notificationDate: {
  //   fontSize: 14,
  //   color: '#28a745',
  //   fontWeight: '500',
  // },
  notificationOverdue: {
    color: '#dc3545',
  },
  notificationPhone: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  // markViewedButton: {
  //   backgroundColor: '#007bff',
  //   paddingVertical: 8,
  //   paddingHorizontal: 16,
  //   borderRadius: 6,
  //   alignItems: 'center',
  // },
  markViewedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotificationsIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyNotificationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  emptyNotificationsDesc: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});