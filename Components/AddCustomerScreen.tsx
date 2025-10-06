
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Switch,
// } from "react-native";
// import * as ImagePicker from "expo-image-picker";
// import * as SMS from "expo-sms";
// import * as FileSystem from "expo-file-system/legacy";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../types";
// import { db } from "../firebaseConfig";
// import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
// import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
// import { RouteProp } from "@react-navigation/native";
// import * as Notifications from "expo-notifications";

// type AddCustomerRouteProp = RouteProp<RootStackParamList, "AddCustomer">;
// type AddCustomerNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "AddCustomer"
// >;

// type Props = {
//   navigation: AddCustomerNavigationProp;
//   route: AddCustomerRouteProp;
// };

// type MessageType = 'default' | 'custom';

// const BUSINESS_PHONE = "8446682152";

// const translations = {
//   marathi: {
//     editCustomer: 'ग्राहक संपादित करा',
//     addNewCustomer: 'नवीन ग्राहक जोडा',
//     updateCustomerDetails: 'ग्राहकाची माहिती अद्यावत करा',
//     fillCustomerDetails: 'ग्राहकाची माहिती भरा',
//     waterPurifierPhoto: 'उपकरणाचा फोटो',
//     optional: 'ऐच्छिक',
//     required: 'आवश्यक',
//     addPhotoDescription: 'ग्राहकाच्या उपकरणाचा फोटो घ्या',
//     changePhoto: 'फोटो बदला',
//     addPhoto: 'फोटो जोडा',
//     takePhotoOrChoose: 'फोटो काढा किंवा गॅलरीमधून निवडा',
//     customerDetails: 'ग्राहकाची माहिती',
//     fullName: 'पूर्ण नाव',
//     enterFullName: 'पूर्ण नाव प्रविष्ट करा',
//     phoneNumber: 'फोन नंबर',
//     phonePlaceholder: '+91 1234567890',
//     address: 'पत्ता',
//     enterAddress: 'पत्ता प्रविष्ट करा',
//     smsReminderSettings: 'एसएमएस स्मरणपत्र सेटिंग्ज',
//     smsReminderDescription: 'ग्राहकाला सर्व्हिसबद्दल आठवण करून देण्यासाठी स्वयंचलित एसएमएस शेड्यूल करा',
//     date: 'तारीख',
//     selectDate: 'तारीख निवडा',
//     time: 'वेळ',
//     selectTime: 'वेळ निवडा',
//     messageType: 'संदेश प्रकार',
//     defaultMessage: 'डीफॉल्ट संदेश',
//     customMessage: 'कस्टम संदेश',
//     writeOwnMessage: 'तुमचा स्वतःचा संदेश लिहा',
//     customMessageLabel: 'तुमचा कस्टम संदेश',
//     enterCustomMessage: 'तुमचा संदेश येथे लिहा...',
//     testSMS: 'एसएमएस चाचणी करा',
//     smsReminderScheduled: 'एसएमएस स्मरणपत्र शेड्यूल केले',
//     at: 'वाजता',
//     viaSMS: 'एसएमएस द्वारे',
//     cancelButton: 'रद्द करा',
//     updateCustomer: 'ग्राहक अद्यावत करा',
//     saveCustomer: 'ग्राहक जतन करा',
//     saving: 'जतन करत आहे...',
//     success: 'यशस्वी',
//     error: 'त्रुटी',
//     validationError: 'प्रमाणीकरण त्रुटी',
//     enterCustomerName: 'कृपया ग्राहकाचे नाव प्रविष्ट करा',
//     enterPhoneNumber: 'कृपया फोन नंबर प्रविष्ट करा',
//     enterValidPhone: 'कृपया वैध फोन नंबर प्रविष्ट करा',
//     reminderDateFuture: 'स्मरणपत्राची तारीख भविष्यात असली पाहिजे',
//     enterCustomMessageError: 'कस्टम संदेशासाठी कृपया संदेश प्रविष्ट करा',
//     enterPhoneFirst: 'प्रथम फोन नंबर प्रविष्ट करा',
//     customerUpdatedSuccess: 'ग्राहकाची माहिती अद्यावत केली गेली आणि स्मरणपत्र शेड्यूल केले:',
//     customerAddedSuccess: 'ग्राहक जोडला गेला आणि स्मरणपत्र शेड्यूल केले:',
//     customerUpdatedSimple: 'ग्राहकाची माहिती अद्यावत केली गेली',
//     customerAddedSimple: 'ग्राहक यशस्वीरित्या जोडला गेला',
//     updateError: 'ग्राहक अद्यावत करताना त्रुटी',
//     saveError: 'ग्राहक जतन करताना त्रुटी',
//     defaultSMSTemplate: (name: string, phone: string) => 
//       `नमस्कार ${name}, आपल्या उपकरणाचा फोटो सर्व्हिसिंगसाठी तयार आहे. कृपया ${phone} वर कॉल करा.`,
//     smsNotAvailable: 'एसएमएस उपलब्ध नाही',
//     smsNotAvailableMessage: 'तुमच्या डिव्हाइसवर एसएमएस उपलब्ध नाही',
//     smsError: 'एसएमएस त्रुटी',
//     smsErrorMessage: 'एसएमएस पाठवताना त्रुटी आली',
//     permissionRequired: 'परवानगी आवश्यक',
//     cameraPermissionMessage: 'कृपया कॅमेरा परवानगी द्या',
//     galleryPermissionMessage: 'कृपया गॅलरी परवानगी द्या',
//     waterPurifierPhotoTitle: 'वॉटर प्युरिफायर फोटो',
//     choosePhotoMethod: 'फोटो कसा जोडायचा ते निवडा',
//     cancel: 'रद्द करा',
//     takePhoto: 'फोटो काढा',
//     chooseFromGallery: 'गॅलरीमधून निवडा',
//     removePhoto: 'फोटो काढा',
//     language: 'मराठी',
//     marathi: 'मराठी',
//   },
//   english: {
//     editCustomer: 'Edit Customer',
//     addNewCustomer: 'Add New Customer',
//     updateCustomerDetails: 'Update customer details',
//     fillCustomerDetails: 'Fill in customer details',
//     waterPurifierPhoto: 'Appliance Photo',
//     optional: 'Optional',
//     required: 'Required',
//     addPhotoDescription: 'Take a photo of the customer\'s appliance',
//     changePhoto: 'Change Photo',
//     addPhoto: 'Add Photo',
//     takePhotoOrChoose: 'Take a photo or choose from gallery',
//     customerDetails: 'Customer Details',
//     fullName: 'Full Name',
//     enterFullName: 'Enter full name',
//     phoneNumber: 'Phone Number',
//     phonePlaceholder: '+91 1234567890',
//     address: 'Address',
//     enterAddress: 'Enter address',
//     smsReminderSettings: 'SMS Reminder Settings',
//     smsReminderDescription: 'Schedule an automatic SMS to remind the customer about service',
//     date: 'Date',
//     selectDate: 'Select Date',
//     time: 'Time',
//     selectTime: 'Select Time',
//     messageType: 'Message Type',
//     defaultMessage: 'Default Message',
//     customMessage: 'Custom Message',
//     writeOwnMessage: 'Write your own message',
//     customMessageLabel: 'Your Custom Message',
//     enterCustomMessage: 'Write your message here...',
//     testSMS: 'Test SMS',
//     smsReminderScheduled: 'SMS Reminder Scheduled',
//     at: 'at',
//     viaSMS: 'via SMS',
//     cancelButton: 'Cancel',
//     updateCustomer: 'Update Customer',
//     saveCustomer: 'Save Customer',
//     saving: 'Saving...',
//     success: 'Success',
//     error: 'Error',
//     validationError: 'Validation Error',
//     enterCustomerName: 'Please enter customer name',
//     enterPhoneNumber: 'Please enter phone number',
//     enterValidPhone: 'Please enter a valid phone number',
//     reminderDateFuture: 'Reminder date must be in the future',
//     enterCustomMessageError: 'Please enter a custom message',
//     enterPhoneFirst: 'Please enter phone number first',
//     customerUpdatedSuccess: 'Customer updated and reminder scheduled for:',
//     customerAddedSuccess: 'Customer added and reminder scheduled for:',
//     customerUpdatedSimple: 'Customer updated successfully',
//     customerAddedSimple: 'Customer added successfully',
//     updateError: 'Error updating customer',
//     saveError: 'Error saving customer',
//     defaultSMSTemplate: (name: string, phone: string) => 
//       `Hello ${name}, your Applicance Photo is due for servicing. Please call ${phone}.`,
//     smsNotAvailable: 'SMS Not Available',
//     smsNotAvailableMessage: 'SMS is not available on your device',
//     smsError: 'SMS Error',
//     smsErrorMessage: 'Error sending SMS',
//     permissionRequired: 'Permission Required',
//     cameraPermissionMessage: 'Please grant camera permission',
//     galleryPermissionMessage: 'Please grant gallery permission',
//     waterPurifierPhotoTitle: 'Water Purifier Photo',
//     choosePhotoMethod: 'Choose how to add photo',
//     cancel: 'Cancel',
//     takePhoto: 'Take Photo',
//     chooseFromGallery: 'Choose from Gallery',
//     removePhoto: 'Remove Photo',
//     language: 'English',
//     marathi: 'Marathi',
//   },
// };

// const storeReminder = async (
//   customerId: string,
//   customerName: string,
//   phone: string,
//   date: Date,
//   messageType: MessageType,
//   customMessage?: string,
//   notificationId?: string
// ) => {
//   try {
//     const reminders = await AsyncStorage.getItem('customerReminders');
//     const remindersArray = reminders ? JSON.parse(reminders) : [];

//     const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);

//     filteredReminders.push({
//       id: customerId,
//       name: customerName,
//       phone: phone,
//       date: date.toISOString(),
//       messageType: messageType,
//       customMessage: customMessage,
//       created: new Date().toISOString(),
//       sent: false,
//       notificationId: notificationId || null,
//     });

//     await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
//   } catch (error) {
//     console.error('Failed to store reminder:', error);
//   }
// };

// const removeReminder = async (customerId: string) => {
//   try {
//     const reminders = await AsyncStorage.getItem('customerReminders');
//     if (reminders) {
//       const remindersArray = JSON.parse(reminders);
//       const reminder = remindersArray.find((r: any) => r.id === customerId);

//       if (reminder?.notificationId) {
//         await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
//         console.log("✅ Cancelled scheduled notification:", reminder.notificationId);
//       }

//       const filteredReminders = remindersArray.filter((r: any) => r.id !== customerId);
//       await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
//     }
//   } catch (error) {
//     console.error('Failed to remove reminder:', error);
//   }
// };

// const sendSMSReminder = async (phone: string, message: string, customerName: string) => {
//   try {
//     const isAvailable = await SMS.isAvailableAsync();
//     if (!isAvailable) {
//       Alert.alert('SMS Not Available', 'SMS is not available on your device');
//       return false;
//     }

//     const { result } = await SMS.sendSMSAsync([phone], message);

//     if (result === 'sent') {
//       console.log(`SMS sent successfully to ${customerName} (${phone})`);
//       return true;
//     } else {
//       console.log(`SMS failed to send to ${customerName}: ${result}`);
//       return false;
//     }
//   } catch (error) {
//     console.error('SMS sending error:', error);
//     Alert.alert('SMS Error', 'Error sending SMS');
//     return false;
//   }
// };

// export default function AddCustomerScreen({ navigation, route }: Props) {
//   const { customerToEdit } = route.params || {};
//   const isEditing = !!customerToEdit;

//   const [isMarathi, setIsMarathi] = useState<boolean>(true);
//   const [name, setName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [address, setAddress] = useState<string>("");
//   const [photo, setPhoto] = useState<string | undefined>(undefined);
//   const [notifyDate, setNotifyDate] = useState<Date | null>(null);
//   const [messageType, setMessageType] = useState<MessageType>('default');
//   const [customMessage, setCustomMessage] = useState<string>("");
//   const [saving, setSaving] = useState<boolean>(false);
//   const [processingPhoto, setProcessingPhoto] = useState<boolean>(false);
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

//   const t = translations[isMarathi ? 'marathi' : 'english'];

//   const getDefaultMessage = () => {
//     const customerName = name.trim() || (isMarathi ? "ग्राहक" : "Customer");
//     return t.defaultSMSTemplate(customerName, BUSINESS_PHONE);
//   };

//   useEffect(() => {
//     if (customerToEdit) {
//       setName(customerToEdit.name || "");
//       setPhone(customerToEdit.phone || "");
//       setAddress(customerToEdit.address || "");
//       setPhoto(customerToEdit.photoBase64 || customerToEdit.photoURL || customerToEdit.photo);
      
//       const savedMessageType = customerToEdit.messageType;
//       if (savedMessageType === 'default' || savedMessageType === 'custom') {
//         setMessageType(savedMessageType);
//       } else {
//         setMessageType('default');
//       }
      
//       setCustomMessage(customerToEdit.customMessage || "");
//       if (customerToEdit.notifyDate) {
//         setNotifyDate(new Date(customerToEdit.notifyDate));
//       }
//     }
//   }, [customerToEdit]);

//   useEffect(() => {
//     (async () => {
//       const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
//       if (camStatus !== "granted") {
//         Alert.alert(t.permissionRequired, t.cameraPermissionMessage);
//       }
//     })();
//   }, []);

//   const convertToBase64 = async (uri: string): Promise<string> => {
//     try {
//       setProcessingPhoto(true);
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: "base64",
//       });
//       return `data:image/jpeg;base64,${base64}`;
//     } catch (error) {
//       console.error("Error converting to base64:", error);
//       throw new Error("Failed to process image");
//     } finally {
//       setProcessingPhoto(false);
//     }
//   };

//   const takePhoto = async () => {
//     const result = await ImagePicker.launchCameraAsync({
//       allowsEditing: true,
//       quality: 0.5,
//       aspect: [4, 3],
//     });

//     if (!result.canceled && result.assets?.length) {
//       const base64Photo = await convertToBase64(result.assets[0].uri);
//       setPhoto(base64Photo);
//     }
//   };

//   const selectFromGallery = async () => {
//     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(t.permissionRequired, t.galleryPermissionMessage);
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       allowsEditing: true,
//       quality: 0.5,
//       aspect: [4, 3],
//     });

//     if (!result.canceled && result.assets?.length) {
//       const base64Photo = await convertToBase64(result.assets[0].uri);
//       setPhoto(base64Photo);
//     }
//   };

//   const showPhotoOptions = () => {
//     Alert.alert(
//       t.waterPurifierPhotoTitle,
//       t.choosePhotoMethod,
//       [
//         { text: t.cancel, style: "cancel" },
//         { text: t.takePhoto, onPress: takePhoto },
//         { text: t.chooseFromGallery, onPress: selectFromGallery },
//         ...(photo ? [{ text: t.removePhoto, onPress: () => setPhoto(undefined), style: "destructive" as const }] : [])
//       ]
//     );
//   };

//   const validateForm = () => {
//     if (!name.trim()) {
//       Alert.alert(t.validationError, t.enterCustomerName);
//       return false;
//     }
//     if (!phone.trim()) {
//       Alert.alert(t.validationError, t.enterPhoneNumber);
//       return false;
//     }
//     if (!address.trim()) {
//       Alert.alert(t.validationError, t.enterAddress);
//       return false;
//     }

//     const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
//     if (!phoneRegex.test(phone.trim())) {
//       Alert.alert(t.validationError, t.enterValidPhone);
//       return false;
//     }

//     if (notifyDate && notifyDate <= new Date()) {
//       Alert.alert(t.validationError, t.reminderDateFuture);
//       return false;
//     }

//     if (notifyDate && messageType === 'custom' && !customMessage.trim()) {
//       Alert.alert(t.validationError, t.enterCustomMessageError);
//       return false;
//     }

//     return true;
//   };

//   const testNotification = async () => {
//     if (!phone.trim()) {
//       Alert.alert(t.error, t.enterPhoneFirst);
//       return;
//     }

//     const message = messageType === 'custom' && customMessage.trim() 
//       ? customMessage.trim() 
//       : getDefaultMessage();

//     await sendSMSReminder(phone.trim(), message, name.trim() || (isMarathi ? "ग्राहक" : "Customer"));
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     setSaving(true);
//     try {
//       const messageToSave = messageType === 'custom' ? customMessage.trim() : getDefaultMessage();

//       const customerData = {
//         name: name.trim(),
//         phone: phone.trim(),
//         address: address.trim(),
//         photoBase64: photo || null,
//         notifyDate: notifyDate ? notifyDate.toISOString() : null,
//         messageType: messageType,
//         customMessage: messageToSave,
//         updatedAt: serverTimestamp(),
//         ...(isEditing ? {} : { createdAt: serverTimestamp() })
//       };

//       let customerId: string;

//       if (isEditing && customerToEdit?.id) {
//         const customerRef = doc(db, "customers", customerToEdit.id);
//         await updateDoc(customerRef, customerData);
//         customerId = customerToEdit.id;
//         console.log("Updated customer id:", customerId);
//       } else {
//         const docRef = await addDoc(collection(db, "customers"), customerData);
//         customerId = docRef.id;
//         console.log("Created new customer id:", customerId);
//       }

//       if (notifyDate) {
//         const notificationId = await scheduleReminder(notifyDate, messageToSave);

//         await storeReminder(
//           customerId,
//           name.trim(),
//           phone.trim(),
//           notifyDate,
//           messageType,
//           messageToSave,
//           notificationId 
//         );
//       } else {
//         await removeReminder(customerId);
//       }

//       const successMessage = notifyDate
//         ? (isEditing 
//             ? `${t.customerUpdatedSuccess} ${notifyDate.toLocaleDateString()} ${t.at} ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
//             : `${t.customerAddedSuccess} ${notifyDate.toLocaleDateString()} ${t.at} ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`)
//         : (isEditing ? t.customerUpdatedSimple : t.customerAddedSimple);

//       Alert.alert(t.success, successMessage, [
//         { text: "OK", onPress: () => navigation.goBack() }
//       ]);
//     } catch (err: any) {
//       console.error("handleSave error:", err);
//       const errorMessage = err.message || (isEditing ? t.updateError : t.saveError);
//       Alert.alert(t.error, errorMessage);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const scheduleReminder = async (notifyDate: Date, message: string): Promise<string> => {
//     try {
//       let scheduledDate = new Date(notifyDate);

//       if (scheduledDate <= new Date()) {
//         scheduledDate.setDate(scheduledDate.getDate() + 1);
//       }

//       const notificationId = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: isMarathi ? "⏰ सर्व्हिस स्मरणपत्र" : "⏰ Service Reminder",
//           body: message,
//           sound: true,
//           priority: Notifications.AndroidNotificationPriority.HIGH,
//         },
//         trigger: {
//           type: Notifications.SchedulableTriggerInputTypes.DATE,
//           date: scheduledDate,
//         },
//       });

//       console.log("✅ Reminder scheduled for:", scheduledDate, "with ID:", notificationId);
//       return notificationId;
//     } catch (error) {
//       console.error("❌ Error scheduling reminder:", error);
//       throw error;
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView
//         style={styles.scrollContainer}
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.header}>
//           <View style={styles.headerTop}>
//             <Text style={styles.headerTitle}>
//               {isEditing ? t.editCustomer : t.addNewCustomer}
//             </Text>
            
//             {/* Language Toggle */}
//             {/* <View style={styles.languageToggle}>
//               <Text style={styles.languageLabel}>
//                 {isMarathi ? 'EN' : 'मर'}
//               </Text>
//               <Switch
//                 value={isMarathi}
//                 onValueChange={setIsMarathi}
//                 trackColor={{ false: "#81b0ff", true: "#81b0ff" }}
//                 thumbColor={isMarathi ? "#007bff" : "#f4f3f4"}
//                 ios_backgroundColor="#81b0ff"
//               />
//               <Text style={styles.languageLabel}>
//                 {isMarathi ? 'मर' : 'EN'}
//               </Text>
//             </View> */}
//                <TouchableOpacity 
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
//           </View>
//           <Text style={styles.headerSubtitle}>
//             {isEditing ? t.updateCustomerDetails : t.fillCustomerDetails}
//           </Text>
//         </View>

//         <View style={styles.formContainer}>
//           {/* Water Purifier Photo Section */}
//           <View style={styles.photoSection}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>{t.waterPurifierPhoto}</Text>
//               <Text style={styles.optionalBadge}>{t.optional}</Text>
//             </View>
//             <Text style={styles.sectionDescription}>
//               {t.addPhotoDescription}
//             </Text>

//             <View style={styles.photoContainer}>
//               {photo ? (
//                 <View style={styles.photoWrapper}>
//                   <Image source={{ uri: photo }} style={styles.purifierPhoto} />
//                   <View style={styles.photoOverlay}>
//                     <TouchableOpacity
//                       style={styles.photoActionButton}
//                       onPress={showPhotoOptions}
//                     >
//                       <Text style={styles.photoActionText}>{t.changePhoto}</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               ) : (
//                 <TouchableOpacity
//                   style={styles.addPhotoContainer}
//                   onPress={showPhotoOptions}
//                   disabled={processingPhoto}
//                 >
//                   {processingPhoto ? (
//                     <ActivityIndicator color="#007bff" size="large" />
//                   ) : (
//                     <>
//                       <View style={styles.addPhotoIconContainer}>
//                         <Text style={styles.addPhotoIcon}>📷</Text>
//                       </View>
//                       <Text style={styles.addPhotoTitle}>{t.addPhoto}</Text>
//                       <Text style={styles.addPhotoSubtitle}>
//                         {t.takePhotoOrChoose}
//                       </Text>
//                     </>
//                   )}
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           {/* Customer Details Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>{t.customerDetails}</Text>
//               <Text style={styles.requiredBadge}>{t.required}</Text>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 {t.fullName} <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder={t.enterFullName}
//                 style={styles.input}
//                 value={name}
//                 onChangeText={setName}
//                 placeholderTextColor="#999"
//                 autoCapitalize="words"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 {t.phoneNumber} <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder={t.phonePlaceholder}
//                 style={styles.input}
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 placeholderTextColor="#999"
//                 autoComplete="tel"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>
//                 {t.address} <Text style={styles.required}>*</Text>
//               </Text>
//               <TextInput
//                 placeholder={t.enterAddress}
//                 style={[styles.input, styles.textArea]}
//                 value={address}
//                 onChangeText={setAddress}
//                 multiline={true}
//                 numberOfLines={3}
//                 placeholderTextColor="#999"
//                 textAlignVertical="top"
//               />
//             </View>
//           </View>

//           {/* SMS Reminder Settings Section */}
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>{t.smsReminderSettings}</Text>
//               <Text style={styles.optionalBadge}>{t.optional}</Text>
//             </View>
//             <Text style={styles.sectionDescription}>
//               {t.smsReminderDescription}
//             </Text>

//             <View style={styles.dateTimeRow}>
//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowDatePicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.dateTimeIcon}>📅</Text>
//                 <View style={styles.dateTimeContent}>
//                   <Text style={styles.dateTimeLabel}>{t.date}</Text>
//                   <Text style={styles.dateTimeValue}>
//                     {notifyDate ? notifyDate.toLocaleDateString() : t.selectDate}
//                   </Text>
//                 </View>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowTimePicker(true)}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.dateTimeIcon}>⏰</Text>
//                 <View style={styles.dateTimeContent}>
//                   <Text style={styles.dateTimeLabel}>{t.time}</Text>
//                   <Text style={styles.dateTimeValue}>
//                     {notifyDate ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t.selectTime}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>

//             {/* Message Type Selection */}
//             <View style={styles.messageTypeSelection}>
//               <Text style={styles.messageTypeLabel}>{t.messageType}</Text>
              
//               <TouchableOpacity
//                 style={styles.radioOption}
//                 onPress={() => setMessageType('default')}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.radioButton}>
//                   {messageType === 'default' && <View style={styles.radioButtonSelected} />}
//                 </View>
//                 <View style={styles.radioContent}>
//                   <Text style={styles.radioLabel}>{t.defaultMessage}</Text>
//                   <Text style={styles.radioDescription}>
//                     {getDefaultMessage()}
//                   </Text>
//                 </View>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.radioOption}
//                 onPress={() => setMessageType('custom')}
//                 activeOpacity={0.7}
//               >
//                 <View style={styles.radioButton}>
//                   {messageType === 'custom' && <View style={styles.radioButtonSelected} />}
//                 </View>
//                 <View style={styles.radioContent}>
//                   <Text style={styles.radioLabel}>{t.customMessage}</Text>
//                   <Text style={styles.radioDescription}>{t.writeOwnMessage}</Text>
//                 </View>
//               </TouchableOpacity>
//             </View>

//             {messageType === 'custom' && (
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>{t.customMessageLabel}</Text>
//                 <TextInput
//                   placeholder={t.enterCustomMessage}
//                   style={[styles.input, styles.textArea]}
//                   value={customMessage}
//                   onChangeText={setCustomMessage}
//                   multiline={true}
//                   numberOfLines={4}
//                   placeholderTextColor="#999"
//                   textAlignVertical="top"
//                 />
//               </View>
//             )}

//             {phone.trim() && (
//               <TouchableOpacity
//                 style={styles.testButton}
//                 onPress={testNotification}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.testButtonIcon}>📤</Text>
//                 <Text style={styles.testButtonText}>{t.testSMS}</Text>
//               </TouchableOpacity>
//             )}

//             {notifyDate && (
//               <View style={styles.reminderPreview}>
//                 <View style={styles.reminderPreviewHeader}>
//                   <Text style={styles.reminderPreviewTitle}>{t.smsReminderScheduled}</Text>
//                   <TouchableOpacity
//                     onPress={() => setNotifyDate(null)}
//                     style={styles.clearButton}
//                   >
//                     <Text style={styles.clearButtonText}>✕</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.reminderPreviewDate}>
//                   {notifyDate.toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })}
//                 </Text>
//                 <Text style={styles.reminderPreviewTime}>
//                   {t.at} {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </Text>
//                 <View style={styles.reminderMethodBadge}>
//                   <Text style={styles.reminderMethodText}>{t.viaSMS} {BUSINESS_PHONE}</Text>
//                 </View>
//               </View>
//             )}

//             {showDatePicker && (
//               <DateTimePicker
//                 value={notifyDate || new Date()}
//                 mode="date"
//                 display={Platform.OS === "ios" ? "inline" : "default"}
//                 minimumDate={new Date()}
//                 onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
//                   setShowDatePicker(false);
//                   if (event.type === "set" && selectedDate) {
//                     const newDate = new Date(selectedDate);
//                     if (notifyDate) {
//                       newDate.setHours(notifyDate.getHours(), notifyDate.getMinutes());
//                     } else {
//                       const now = new Date();
//                       newDate.setHours(now.getHours(), now.getMinutes());
//                     }
//                     setNotifyDate(newDate);
//                   }
//                 }}
//               />
//             )}

//             {showTimePicker && (
//               <DateTimePicker
//                 value={notifyDate || new Date()}
//                 mode="time"
//                 display="default"
//                 onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
//                   setShowTimePicker(false);
//                   if (event.type === "set" && selectedTime) {
//                     const newDate = notifyDate ? new Date(notifyDate) : new Date();
//                     newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
//                     setNotifyDate(newDate);
//                   }
//                 }}
//               />
//             )}
//           </View>
//         </View>
//          <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.cancelButton}
//             onPress={() => navigation.goBack()}
//             disabled={saving}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.cancelButtonText}>{t.cancelButton}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//             onPress={handleSave}
//             disabled={saving}
//             activeOpacity={0.8}
//           >
//             {saving ? (
//               <View style={styles.savingContainer}>
//                 <ActivityIndicator color="#fff" size="small" />
//                 <Text style={styles.savingText}>{t.saving}</Text>
//               </View>
//             ) : (
//               <Text style={styles.saveButtonText}>
//                 {isEditing ? t.updateCustomer : t.saveCustomer}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Fixed Action Buttons at Bottom */}
//       {/* <View style={styles.actionButtonsContainer}>
//         <View style={styles.actionButtons}>
//           <TouchableOpacity
//             style={styles.cancelButton}
//             onPress={() => navigation.goBack()}
//             disabled={saving}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.cancelButtonText}>{t.cancelButton}</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//             onPress={handleSave}
//             disabled={saving}
//             activeOpacity={0.8}
//           >
//             {saving ? (
//               <View style={styles.savingContainer}>
//                 <ActivityIndicator color="#fff" size="small" />
//                 <Text style={styles.savingText}>{t.saving}</Text>
//               </View>
//             ) : (
//               <Text style={styles.saveButtonText}>
//                 {isEditing ? t.updateCustomer : t.saveCustomer}
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View> */}
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//     checkboxContainer: {
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
//   scrollContainer: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 100,
//   },
//   header: {
//     backgroundColor: "#4A90E2",
//     paddingTop: 20,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//   },
//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#fff",
//     flex: 1,
//   },
//   languageToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f5f7f5ff",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//   },
//   languageLabel: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//     marginHorizontal: 6,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: "#e3f2fd",
//   },
//   formContainer: {
//     padding: 16,
//   },
//   section: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   photoSection: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#212529",
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: "#6c757d",
//     marginBottom: 16,
//   },
//   optionalBadge: {
//     fontSize: 12,
//     color: "#6c757d",
//     backgroundColor: "#e9ecef",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   requiredBadge: {
//     fontSize: 12,
//     color: "#dc3545",
//     backgroundColor: "#f8d7da",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   photoContainer: {
//     marginTop: 12,
//   },
//   photoWrapper: {
//     position: "relative",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   purifierPhoto: {
//     width: "100%",
//     height: 250,
//     borderRadius: 12,
//   },
//   photoOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.6)",
//     padding: 12,
//     alignItems: "center",
//   },
//   photoActionButton: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   photoActionText: {
//     color: "#007bff",
//     fontWeight: "600",
//   },
//   addPhotoContainer: {
//     backgroundColor: "#f8f9fa",
//     borderWidth: 2,
//     borderColor: "#dee2e6",
//     borderStyle: "dashed",
//     borderRadius: 12,
//     padding: 40,
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: 200,
//   },
//   addPhotoIconContainer: {
//     marginBottom: 12,
//   },
//   addPhotoIcon: {
//     fontSize: 48,
//   },
//   addPhotoTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 4,
//   },
//   addPhotoSubtitle: {
//     fontSize: 14,
//     color: "#6c757d",
//     textAlign: "center",
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 8,
//   },
//   required: {
//     color: "#dc3545",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ced4da",
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: "#fff",
//     color: "#212529",
//   },
//   textArea: {
//     minHeight: 80,
//     textAlignVertical: "top",
//   },
//   dateTimeRow: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 20,
//   },
//   dateTimeButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//     borderWidth: 1,
//     borderColor: "#dee2e6",
//     borderRadius: 8,
//     padding: 12,
//   },
//   dateTimeIcon: {
//     fontSize: 24,
//     marginRight: 12,
//   },
//   dateTimeContent: {
//     flex: 1,
//   },
//   dateTimeLabel: {
//     fontSize: 12,
//     color: "#6c757d",
//     marginBottom: 2,
//   },
//   dateTimeValue: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#212529",
//   },
//   messageTypeSelection: {
//     marginBottom: 20,
//   },
//   messageTypeLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#495057",
//     marginBottom: 12,
//   },
//   radioOption: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#dee2e6",
//     borderRadius: 8,
//     marginBottom: 12,
//     backgroundColor: "#fff",
//   },
//   radioButton: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: "#007bff",
//     marginRight: 12,
//     marginTop: 2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   radioButtonSelected: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: "#007bff",
//   },
//   radioContent: {
//     flex: 1,
//   },
//   radioLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   radioDescription: {
//     fontSize: 13,
//     color: "#6c757d",
//     lineHeight: 18,
//   },
//   testButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#e3f2fd",
//     borderWidth: 1,
//     borderColor: "#007bff",
//     borderRadius: 8,
//     padding: 12,
//     marginTop: 8,
//   },
//   testButtonIcon: {
//     fontSize: 18,
//     marginRight: 8,
//   },
//   testButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#007bff",
//   },
//   reminderPreview: {
//     backgroundColor: "#d1ecf1",
//     borderRadius: 8,
//     padding: 16,
//     marginTop: 16,
//   },
//   reminderPreviewHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   reminderPreviewTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#0c5460",
//   },
//   clearButton: {
//     padding: 4,
//   },
//   clearButtonText: {
//     fontSize: 18,
//     color: "#0c5460",
//     fontWeight: "bold",
//   },
//   reminderPreviewDate: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#0c5460",
//     marginBottom: 4,
//   },
//   reminderPreviewTime: {
//     fontSize: 14,
//     color: "#0c5460",
//     marginBottom: 8,
//   },
//   reminderMethodBadge: {
//     backgroundColor: "#fff",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     alignSelf: "flex-start",
//   },
//   reminderMethodText: {
//     fontSize: 12,
//     color: "#0c5460",
//     fontWeight: "500",
//   },
//   actionButtonsContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderTopColor: "#dee2e6",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   // actionButtons: {
//   //   flexDirection: "row",
//   //   gap: 12,
//   // },
//   // cancelButton: {
//   //   flex: 1,
//   //   backgroundColor: "#e6e4e4ff",
//   //   borderWidth: 1,
//   //   borderColor: "#6c757d",
//   //   borderRadius: 8,
//   //   padding: 16,
//   //   alignItems: "center",
//   //   marginBottom: 20,
//   // },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#6c757d",
//   },
// actionButtons: {
//     flexDirection: "row",
//     gap: 12,
//     paddingHorizontal: 16,
//     marginTop: 8,
//   },
  
//   cancelButton: {
//     flex: 1,
//     backgroundColor: "#e6e4e4ff",
//     borderWidth: 1,
//     borderColor: "#6c757d",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//   },
  
//   saveButton: {
//     flex: 2,
//     backgroundColor: "#4A90E2",
//     borderRadius: 8,
//     padding: 16,
//     alignItems: "center",
//   },
//   saveButtonDisabled: {
//     backgroundColor: "#6c757d",
//   },
//   saveButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#fff",
//   },
//   savingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   savingText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#fff",
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SMS from "expo-sms";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

// ============ CRITICAL NOTIFICATION CONFIGURATION ============
// This MUST be set at the top level, outside the component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type AddCustomerRouteProp = RouteProp<RootStackParamList, "AddCustomer">;
type AddCustomerNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddCustomer"
>;

type Props = {
  navigation: AddCustomerNavigationProp;
  route: AddCustomerRouteProp;
};

type MessageType = 'default' | 'custom';

const BUSINESS_PHONE = "8446682152";

const translations = {
  marathi: {
    editCustomer: 'ग्राहक संपादित करा',
    addNewCustomer: 'नवीन ग्राहक जोडा',
    updateCustomerDetails: 'ग्राहकाची माहिती अद्यावत करा',
    fillCustomerDetails: 'ग्राहकाची माहिती भरा',
    waterPurifierPhoto: 'उपकरणाचा फोटो',
    optional: 'ऐच्छिक',
    required: 'आवश्यक',
    addPhotoDescription: 'ग्राहकाच्या उपकरणाचा फोटो घ्या',
    changePhoto: 'फोटो बदला',
    addPhoto: 'फोटो जोडा',
    takePhotoOrChoose: 'फोटो काढा किंवा गॅलरीमधून निवडा',
    customerDetails: 'ग्राहकाची माहिती',
    fullName: 'पूर्ण नाव',
    enterFullName: 'पूर्ण नाव प्रविष्ट करा',
    phoneNumber: 'फोन नंबर',
    phonePlaceholder: '+91 1234567890',
    address: 'पत्ता',
    enterAddress: 'पत्ता प्रविष्ट करा',
    smsReminderSettings: 'एसएमएस स्मरणपत्र सेटिंग्ज',
    smsReminderDescription: 'ग्राहकाला सर्व्हिसबद्दल आठवण करून देण्यासाठी स्वयंचलित एसएमएस शेड्यूल करा',
    date: 'तारीख',
    selectDate: 'तारीख निवडा',
    time: 'वेळ',
    selectTime: 'वेळ निवडा',
    messageType: 'संदेश प्रकार',
    defaultMessage: 'डीफॉल्ट संदेश',
    customMessage: 'कस्टम संदेश',
    writeOwnMessage: 'तुमचा स्वतःचा संदेश लिहा',
    customMessageLabel: 'तुमचा कस्टम संदेश',
    enterCustomMessage: 'तुमचा संदेश येथे लिहा...',
    testSMS: 'एसएमएस चाचणी करा',
    smsReminderScheduled: 'एसएमएस स्मरणपत्र शेड्यूल केले',
    at: 'वाजता',
    viaSMS: 'एसएमएस द्वारे',
    cancelButton: 'रद्द करा',
    updateCustomer: 'ग्राहक अद्यावत करा',
    saveCustomer: 'ग्राहक जतन करा',
    saving: 'जतन करत आहे...',
    success: 'यशस्वी',
    error: 'त्रुटी',
    validationError: 'प्रमाणीकरण त्रुटी',
    enterCustomerName: 'कृपया ग्राहकाचे नाव प्रविष्ट करा',
    enterPhoneNumber: 'कृपया फोन नंबर प्रविष्ट करा',
    enterValidPhone: 'कृपया वैध फोन नंबर प्रविष्ट करा',
    reminderDateFuture: 'स्मरणपत्राची तारीख भविष्यात असली पाहिजे',
    enterCustomMessageError: 'कस्टम संदेशासाठी कृपया संदेश प्रविष्ट करा',
    enterPhoneFirst: 'प्रथम फोन नंबर प्रविष्ट करा',
    customerUpdatedSuccess: 'ग्राहकाची माहिती अद्यावत केली गेली आणि स्मरणपत्र शेड्यूल केले:',
    customerAddedSuccess: 'ग्राहक जोडला गेला आणि स्मरणपत्र शेड्यूल केले:',
    customerUpdatedSimple: 'ग्राहकाची माहिती अद्यावत केली गेली',
    customerAddedSimple: 'ग्राहक यशस्वीरित्या जोडला गेला',
    updateError: 'ग्राहक अद्यावत करताना त्रुटी',
    saveError: 'ग्राहक जतन करताना त्रुटी',
    defaultSMSTemplate: (name: string, phone: string) => 
      `नमस्कार ${name}, आपल्या उपकरणाचा फोटो सर्व्हिसिंगसाठी तयार आहे. कृपया ${phone} वर कॉल करा.`,
    smsNotAvailable: 'एसएमएस उपलब्ध नाही',
    smsNotAvailableMessage: 'तुमच्या डिव्हाइसवर एसएमएस उपलब्ध नाही',
    smsError: 'एसएमएस त्रुटी',
    smsErrorMessage: 'एसएमएस पाठवताना त्रुटी आली',
    permissionRequired: 'परवानगी आवश्यक',
    cameraPermissionMessage: 'कृपया कॅमेरा परवानगी द्या',
    galleryPermissionMessage: 'कृपया गॅलरी परवानगी द्या',
    notificationPermissionMessage: 'सूचना परवानगी आवश्यक आहे',
    waterPurifierPhotoTitle: 'वॉटर प्युरिफायर फोटो',
    choosePhotoMethod: 'फोटो कसा जोडायचा ते निवडा',
    cancel: 'रद्द करा',
    takePhoto: 'फोटो काढा',
    chooseFromGallery: 'गॅलरीमधून निवडा',
    removePhoto: 'फोटो काढा',
    language: 'मराठी',
    marathi: 'मराठी',
  },
  english: {
    editCustomer: 'Edit Customer',
    addNewCustomer: 'Add New Customer',
    updateCustomerDetails: 'Update customer details',
    fillCustomerDetails: 'Fill in customer details',
    waterPurifierPhoto: 'Appliance Photo',
    optional: 'Optional',
    required: 'Required',
    addPhotoDescription: 'Take a photo of the customer\'s appliance',
    changePhoto: 'Change Photo',
    addPhoto: 'Add Photo',
    takePhotoOrChoose: 'Take a photo or choose from gallery',
    customerDetails: 'Customer Details',
    fullName: 'Full Name',
    enterFullName: 'Enter full name',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+91 1234567890',
    address: 'Address',
    enterAddress: 'Enter address',
    smsReminderSettings: 'SMS Reminder Settings',
    smsReminderDescription: 'Schedule an automatic SMS to remind the customer about service',
    date: 'Date',
    selectDate: 'Select Date',
    time: 'Time',
    selectTime: 'Select Time',
    messageType: 'Message Type',
    defaultMessage: 'Default Message',
    customMessage: 'Custom Message',
    writeOwnMessage: 'Write your own message',
    customMessageLabel: 'Your Custom Message',
    enterCustomMessage: 'Write your message here...',
    testSMS: 'Test SMS',
    smsReminderScheduled: 'SMS Reminder Scheduled',
    at: 'at',
    viaSMS: 'via SMS',
    cancelButton: 'Cancel',
    updateCustomer: 'Update Customer',
    saveCustomer: 'Save Customer',
    saving: 'Saving...',
    success: 'Success',
    error: 'Error',
    validationError: 'Validation Error',
    enterCustomerName: 'Please enter customer name',
    enterPhoneNumber: 'Please enter phone number',
    enterValidPhone: 'Please enter a valid phone number',
    reminderDateFuture: 'Reminder date must be in the future',
    enterCustomMessageError: 'Please enter a custom message',
    enterPhoneFirst: 'Please enter phone number first',
    customerUpdatedSuccess: 'Customer updated and reminder scheduled for:',
    customerAddedSuccess: 'Customer added and reminder scheduled for:',
    customerUpdatedSimple: 'Customer updated successfully',
    customerAddedSimple: 'Customer added successfully',
    updateError: 'Error updating customer',
    saveError: 'Error saving customer',
    defaultSMSTemplate: (name: string, phone: string) => 
      `Hello ${name}, your Appliance Photo is due for servicing. Please call ${phone}.`,
    smsNotAvailable: 'SMS Not Available',
    smsNotAvailableMessage: 'SMS is not available on your device',
    smsError: 'SMS Error',
    smsErrorMessage: 'Error sending SMS',
    permissionRequired: 'Permission Required',
    cameraPermissionMessage: 'Please grant camera permission',
    galleryPermissionMessage: 'Please grant gallery permission',
    notificationPermissionMessage: 'Notification permission is required',
    waterPurifierPhotoTitle: 'Water Purifier Photo',
    choosePhotoMethod: 'Choose how to add photo',
    cancel: 'Cancel',
    takePhoto: 'Take Photo',
    chooseFromGallery: 'Choose from Gallery',
    removePhoto: 'Remove Photo',
    language: 'English',
    marathi: 'Marathi',
  },
};

const storeReminder = async (
  customerId: string,
  customerName: string,
  phone: string,
  date: Date,
  messageType: MessageType,
  customMessage?: string,
  notificationId?: string
) => {
  try {
    const reminders = await AsyncStorage.getItem('customerReminders');
    const remindersArray = reminders ? JSON.parse(reminders) : [];

    const filteredReminders = remindersArray.filter((reminder: any) => reminder.id !== customerId);

    filteredReminders.push({
      id: customerId,
      name: customerName,
      phone: phone,
      date: date.toISOString(),
      messageType: messageType,
      customMessage: customMessage,
      created: new Date().toISOString(),
      sent: false,
      notificationId: notificationId || null,
    });

    await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
    console.log("✅ Reminder stored successfully:", notificationId);
  } catch (error) {
    console.error('❌ Failed to store reminder:', error);
  }
};

const removeReminder = async (customerId: string) => {
  try {
    const reminders = await AsyncStorage.getItem('customerReminders');
    if (reminders) {
      const remindersArray = JSON.parse(reminders);
      const reminder = remindersArray.find((r: any) => r.id === customerId);

      if (reminder?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        console.log("✅ Cancelled scheduled notification:", reminder.notificationId);
      }

      const filteredReminders = remindersArray.filter((r: any) => r.id !== customerId);
      await AsyncStorage.setItem('customerReminders', JSON.stringify(filteredReminders));
    }
  } catch (error) {
    console.error('❌ Failed to remove reminder:', error);
  }
};

const sendSMSReminder = async (phone: string, message: string, customerName: string) => {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Not Available', 'SMS is not available on your device');
      return false;
    }

    const { result } = await SMS.sendSMSAsync([phone], message);

    if (result === 'sent') {
      console.log(`✅ SMS sent successfully to ${customerName} (${phone})`);
      return true;
    } else {
      console.log(`❌ SMS failed to send to ${customerName}: ${result}`);
      return false;
    }
  } catch (error) {
    console.error('❌ SMS sending error:', error);
    Alert.alert('SMS Error', 'Error sending SMS');
    return false;
  }
};

// ============ REQUEST NOTIFICATION PERMISSIONS ============
const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Notification permissions are required to send reminders when the app is closed.'
      );
      return false;
    }
    
    console.log("✅ Notification permissions granted");
    
    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Service Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
      console.log("✅ Android notification channel configured");
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
};

export default function AddCustomerScreen({ navigation, route }: Props) {
  const { customerToEdit } = route.params || {};
  const isEditing = !!customerToEdit;

  const [isMarathi, setIsMarathi] = useState<boolean>(true);
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [notifyDate, setNotifyDate] = useState<Date | null>(null);
  const [messageType, setMessageType] = useState<MessageType>('default');
  const [customMessage, setCustomMessage] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [processingPhoto, setProcessingPhoto] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const t = translations[isMarathi ? 'marathi' : 'english'];

  const getDefaultMessage = () => {
    const customerName = name.trim() || (isMarathi ? "ग्राहक" : "Customer");
    return t.defaultSMSTemplate(customerName, BUSINESS_PHONE);
  };

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || "");
      setPhone(customerToEdit.phone || "");
      setAddress(customerToEdit.address || "");
      setPhoto(customerToEdit.photoBase64 || customerToEdit.photoURL || customerToEdit.photo);
      
      const savedMessageType = customerToEdit.messageType;
      if (savedMessageType === 'default' || savedMessageType === 'custom') {
        setMessageType(savedMessageType);
      } else {
        setMessageType('default');
      }
      
      setCustomMessage(customerToEdit.customMessage || "");
      if (customerToEdit.notifyDate) {
        setNotifyDate(new Date(customerToEdit.notifyDate));
      }
    }
  }, [customerToEdit]);

  // ============ REQUEST PERMISSIONS ON MOUNT ============
  useEffect(() => {
    (async () => {
      // Request camera permissions
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (camStatus !== "granted") {
        Alert.alert(t.permissionRequired, t.cameraPermissionMessage);
      }
      
      // Request notification permissions
      await requestNotificationPermissions();
    })();
  }, []);

  const convertToBase64 = async (uri: string): Promise<string> => {
    try {
      setProcessingPhoto(true);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error("❌ Error converting to base64:", error);
      throw new Error("Failed to process image");
    } finally {
      setProcessingPhoto(false);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.5,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.length) {
      const base64Photo = await convertToBase64(result.assets[0].uri);
      setPhoto(base64Photo);
    }
  };

  const selectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t.permissionRequired, t.galleryPermissionMessage);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.5,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets?.length) {
      const base64Photo = await convertToBase64(result.assets[0].uri);
      setPhoto(base64Photo);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      t.waterPurifierPhotoTitle,
      t.choosePhotoMethod,
      [
        { text: t.cancel, style: "cancel" },
        { text: t.takePhoto, onPress: takePhoto },
        { text: t.chooseFromGallery, onPress: selectFromGallery },
        ...(photo ? [{ text: t.removePhoto, onPress: () => setPhoto(undefined), style: "destructive" as const }] : [])
      ]
    );
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert(t.validationError, t.enterCustomerName);
      return false;
    }
    if (!phone.trim()) {
      Alert.alert(t.validationError, t.enterPhoneNumber);
      return false;
    }
    if (!address.trim()) {
      Alert.alert(t.validationError, t.enterAddress);
      return false;
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(t.validationError, t.enterValidPhone);
      return false;
    }

    if (notifyDate && notifyDate <= new Date()) {
      Alert.alert(t.validationError, t.reminderDateFuture);
      return false;
    }

    if (notifyDate && messageType === 'custom' && !customMessage.trim()) {
      Alert.alert(t.validationError, t.enterCustomMessageError);
      return false;
    }

    return true;
  };

  const testNotification = async () => {
    if (!phone.trim()) {
      Alert.alert(t.error, t.enterPhoneFirst);
      return;
    }

    const message = messageType === 'custom' && customMessage.trim() 
      ? customMessage.trim() 
      : getDefaultMessage();

    await sendSMSReminder(phone.trim(), message, name.trim() || (isMarathi ? "ग्राहक" : "Customer"));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const messageToSave = messageType === 'custom' ? customMessage.trim() : getDefaultMessage();

      const customerData = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        photoBase64: photo || null,
        notifyDate: notifyDate ? notifyDate.toISOString() : null,
        messageType: messageType,
        customMessage: messageToSave,
        updatedAt: serverTimestamp(),
        ...(isEditing ? {} : { createdAt: serverTimestamp() })
      };

      let customerId: string;

      if (isEditing && customerToEdit?.id) {
        const customerRef = doc(db, "customers", customerToEdit.id);
        await updateDoc(customerRef, customerData);
        customerId = customerToEdit.id;
        console.log("✅ Updated customer id:", customerId);
      } else {
        const docRef = await addDoc(collection(db, "customers"), customerData);
        customerId = docRef.id;
        console.log("✅ Created new customer id:", customerId);
      }

      if (notifyDate) {
        // Check permissions again before scheduling
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            t.error,
            "Cannot schedule reminder without notification permissions"
          );
          setSaving(false);
          return;
        }

        const notificationId = await scheduleReminder(notifyDate, messageToSave);

        await storeReminder(
          customerId,
          name.trim(),
          phone.trim(),
          notifyDate,
          messageType,
          messageToSave,
          notificationId 
        );
      } else {
        await removeReminder(customerId);
      }

      const successMessage = notifyDate
        ? (isEditing 
            ? `${t.customerUpdatedSuccess} ${notifyDate.toLocaleDateString()} ${t.at} ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : `${t.customerAddedSuccess} ${notifyDate.toLocaleDateString()} ${t.at} ${notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`)
        : (isEditing ? t.customerUpdatedSimple : t.customerAddedSimple);

      Alert.alert(t.success, successMessage, [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      console.error("❌ handleSave error:", err);
      const errorMessage = err.message || (isEditing ? t.updateError : t.saveError);
      Alert.alert(t.error, errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const scheduleReminder = async (notifyDate: Date, message: string): Promise<string> => {
    try {
      let scheduledDate = new Date(notifyDate);

      // Ensure the date is in the future
      if (scheduledDate <= new Date()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      console.log("📅 Scheduling notification for:", scheduledDate.toISOString());

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: isMarathi ? "⏰ सर्व्हिस स्मरणपत्र" : "⏰ Service Reminder",
          body: message,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            customerId: customerToEdit?.id || 'new',
            type: 'service_reminder',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
        },
      });

      console.log("✅ Notification scheduled successfully!");
      console.log("   ID:", notificationId);
      console.log("   Date:", scheduledDate);
      console.log("   Message:", message);

      // Verify the notification was scheduled
      const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
      console.log("📋 Total scheduled notifications:", allNotifications.length);
      
      return notificationId;
    } catch (error) {
      console.error("❌ Error scheduling reminder:", error);
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>
              {isEditing ? t.editCustomer : t.addNewCustomer}
            </Text>
            
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
          </View>
          <Text style={styles.headerSubtitle}>
            {isEditing ? t.updateCustomerDetails : t.fillCustomerDetails}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Water Purifier Photo Section */}
          <View style={styles.photoSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.waterPurifierPhoto}</Text>
              <Text style={styles.optionalBadge}>{t.optional}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t.addPhotoDescription}
            </Text>

            <View style={styles.photoContainer}>
              {photo ? (
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.purifierPhoto} />
                  <View style={styles.photoOverlay}>
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={showPhotoOptions}
                    >
                      <Text style={styles.photoActionText}>{t.changePhoto}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addPhotoContainer}
                  onPress={showPhotoOptions}
                  disabled={processingPhoto}
                >
                  {processingPhoto ? (
                    <ActivityIndicator color="#007bff" size="large" />
                  ) : (
                    <>
                      <View style={styles.addPhotoIconContainer}>
                        <Text style={styles.addPhotoIcon}>📷</Text>
                      </View>
                      <Text style={styles.addPhotoTitle}>{t.addPhoto}</Text>
                      <Text style={styles.addPhotoSubtitle}>
                        {t.takePhotoOrChoose}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Customer Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.customerDetails}</Text>
              <Text style={styles.requiredBadge}>{t.required}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t.fullName} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t.enterFullName}
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t.phoneNumber} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t.phonePlaceholder}
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {t.address} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                placeholder={t.enterAddress}
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                multiline={true}
                numberOfLines={3}
                placeholderTextColor="#999"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* SMS Reminder Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.smsReminderSettings}</Text>
              <Text style={styles.optionalBadge}>{t.optional}</Text>
            </View>
            <Text style={styles.sectionDescription}>
              {t.smsReminderDescription}
            </Text>

            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>📅</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>{t.date}</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleDateString() : t.selectDate}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dateTimeIcon}>⏰</Text>
                <View style={styles.dateTimeContent}>
                  <Text style={styles.dateTimeLabel}>{t.time}</Text>
                  <Text style={styles.dateTimeValue}>
                    {notifyDate ? notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t.selectTime}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Message Type Selection */}
            <View style={styles.messageTypeSelection}>
              <Text style={styles.messageTypeLabel}>{t.messageType}</Text>
              
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMessageType('default')}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {messageType === 'default' && <View style={styles.radioButtonSelected} />}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{t.defaultMessage}</Text>
                  <Text style={styles.radioDescription}>
                    {getDefaultMessage()}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setMessageType('custom')}
                activeOpacity={0.7}
              >
                <View style={styles.radioButton}>
                  {messageType === 'custom' && <View style={styles.radioButtonSelected} />}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{t.customMessage}</Text>
                  <Text style={styles.radioDescription}>{t.writeOwnMessage}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {messageType === 'custom' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.customMessageLabel}</Text>
                <TextInput
                  placeholder={t.enterCustomMessage}
                  style={[styles.input, styles.textArea]}
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  multiline={true}
                  numberOfLines={4}
                  placeholderTextColor="#999"
                  textAlignVertical="top"
                />
              </View>
            )}

            {phone.trim() && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={testNotification}
                activeOpacity={0.8}
              >
                <Text style={styles.testButtonIcon}>📤</Text>
                <Text style={styles.testButtonText}>{t.testSMS}</Text>
              </TouchableOpacity>
            )}

            {notifyDate && (
              <View style={styles.reminderPreview}>
                <View style={styles.reminderPreviewHeader}>
                  <Text style={styles.reminderPreviewTitle}>{t.smsReminderScheduled}</Text>
                  <TouchableOpacity
                    onPress={() => setNotifyDate(null)}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.reminderPreviewDate}>
                  {notifyDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.reminderPreviewTime}>
                  {t.at} {notifyDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
                <View style={styles.reminderMethodBadge}>
                  <Text style={styles.reminderMethodText}>{t.viaSMS} {BUSINESS_PHONE}</Text>
                </View>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={notifyDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                  setShowDatePicker(false);
                  if (event.type === "set" && selectedDate) {
                    const newDate = new Date(selectedDate);
                    if (notifyDate) {
                      newDate.setHours(notifyDate.getHours(), notifyDate.getMinutes());
                    } else {
                      const now = new Date();
                      newDate.setHours(now.getHours(), now.getMinutes());
                    }
                    setNotifyDate(newDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={notifyDate || new Date()}
                mode="time"
                display="default"
                onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
                  setShowTimePicker(false);
                  if (event.type === "set" && selectedTime) {
                    const newDate = notifyDate ? new Date(notifyDate) : new Date();
                    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                    setNotifyDate(newDate);
                  }
                }}
              />
            )}
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t.cancelButton}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.savingText}>{t.saving}</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? t.updateCustomer : t.saveCustomer}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7f5ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e3f2fd",
  },
  formContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 16,
  },
  optionalBadge: {
    fontSize: 12,
    color: "#6c757d",
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredBadge: {
    fontSize: 12,
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoContainer: {
    marginTop: 12,
  },
  photoWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  purifierPhoto: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    alignItems: "center",
  },
  photoActionButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  photoActionText: {
    color: "#007bff",
    fontWeight: "600",
  },
  addPhotoContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#dee2e6",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  addPhotoIconContainer: {
    marginBottom: 12,
  },
  addPhotoIcon: {
    fontSize: 48,
  },
  addPhotoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
  },
  addPhotoSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 8,
  },
  required: {
    color: "#dc3545",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#212529",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 12,
  },
  dateTimeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTimeContent: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  messageTypeSelection: {
    marginBottom: 20,
  },
  messageTypeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007bff",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 13,
    color: "#6c757d",
    lineHeight: 18,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  testButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007bff",
  },
  reminderPreview: {
    backgroundColor: "#d1ecf1",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  reminderPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderPreviewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0c5460",
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#0c5460",
    fontWeight: "bold",
  },
  reminderPreviewDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0c5460",
    marginBottom: 4,
  },
  reminderPreviewTime: {
    fontSize: 14,
    color: "#0c5460",
    marginBottom: 8,
  },
  reminderMethodBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  reminderMethodText: {
    fontSize: 12,
    color: "#0c5460",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e6e4e4ff",
    borderWidth: 1,
    borderColor: "#6c757d",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});