// Components/translations.ts
export const translations = {
  en: {
    // Header
    editCustomer: "✏️ Edit Customer",
    addNewCustomer: "➕ Add New Customer",
    updateCustomerDetails: "Update customer details",
    fillCustomerDetails: "Fill in the customer details",
    
    // Photo Section
    waterPurifierPhoto: "💧 Water Purifier Photo",
    optional: "Optional",
    required: "Required",
    addPhotoDescription: "Add a photo of the water purifier for reference",
    changePhoto: "Change Photo",
    addPhoto: "Add Photo",
    takePhotoOrChoose: "Take a photo or choose from gallery",
    waterPurifierPhotoTitle: "Water Purifier Photo",
    choosePhotoMethod: "Choose how you'd like to add a photo",
    cancel: "Cancel",
    takePhoto: "Take Photo",
    chooseFromGallery: "Choose from Gallery",
    removePhoto: "Remove Photo",
    
    // Customer Details
    customerDetails: "👤 Customer Details",
    fullName: "Full Name",
    enterFullName: "Enter customer's full name",
    phoneNumber: "Phone Number",
    phonePlaceholder: "+91 XXXXX XXXXX",
    address: "Address",
    enterAddress: "Enter full address with landmark",
    
    // SMS Reminder
    smsReminderSettings: "📱 SMS Reminder Settings",
    smsReminderDescription: "Set automatic SMS reminders for service follow-ups",
    date: "Date",
    selectDate: "Select date",
    time: "Time",
    selectTime: "Select time",
    messageType: "Message Type",
    defaultMessage: "Default Message",
    customMessage: "Custom Message",
    customMessageLabel: "Custom Message",
    writeOwnMessage: "Write your own message",
    enterCustomMessage: "Enter your custom reminder message...",
    testSMS: "Test SMS",
    smsReminderScheduled: "✓ SMS Reminder Scheduled",
    at: "at",
    viaSMS: "via SMS from",
    
    // Default SMS Message
    defaultSMSTemplate: (name: string, phone: string) => 
      `Hi ${name}, this is a reminder that your water purifier service time has come. Please contact us at ${phone}. Thank you!`,
    
    // Buttons
    cancelButton: "Cancel",
    updateCustomer: "💾 Update Customer",
    saveCustomer: "✓ Save Customer",
    saving: "Saving...",
    
    // Alerts & Validation
    permissionRequired: "Permission Required",
    cameraPermissionMessage: "Camera permission is recommended to take photos.",
    galleryPermissionMessage: "Gallery permission is needed to select photos.",
    validationError: "Validation Error",
    enterCustomerName: "Please enter customer name",
    enterPhoneNumber: "Please enter phone number",
    enterValidPhone: "Please enter a valid phone number",
    enterAddressError: "Please enter address",
    reminderDateFuture: "Reminder date must be in the future",
    enterCustomMessageError: "Please enter a custom message",
    error: "Error",
    enterPhoneFirst: "Please enter a phone number first",
    smsNotAvailable: "SMS Not Available",
    smsNotAvailableMessage: "SMS functionality is not available on this device",
    smsError: "SMS Error",
    smsErrorMessage: "Failed to send SMS. Please try again.",
    success: "Success",
    customerUpdatedSuccess: (date: string, time: string) => 
      `Customer updated successfully! SMS reminder set for ${date} at ${time}.`,
    customerAddedSuccess: (date: string, time: string) => 
      `Customer added successfully! SMS reminder set for ${date} at ${time}.`,
    customerUpdatedSimple: "Customer updated successfully!",
    customerAddedSimple: "Customer added successfully!",
    updateError: "Failed to update customer. Please check your internet connection and try again.",
    saveError: "Failed to save customer. Please check your internet connection and try again.",
  },
  mr: {
    // Header
    editCustomer: "✏️ ग्राहक संपादित करा",
    addNewCustomer: "➕ नवीन ग्राहक जोडा",
    updateCustomerDetails: "ग्राहक तपशील अपडेट करा",
    fillCustomerDetails: "ग्राहकाचे तपशील भरा",
    
    // Photo Section
    waterPurifierPhoto: "💧 वॉटर प्युरिफायरचा फोटो",
    optional: "ऐच्छिक",
    required: "आवश्यक",
    addPhotoDescription: "संदर्भासाठी वॉटर प्युरिफायरचा फोटो जोडा",
    changePhoto: "फोटो बदला",
    addPhoto: "फोटो जोडा",
    takePhotoOrChoose: "फोटो काढा किंवा गॅलरीमधून निवडा",
    waterPurifierPhotoTitle: "वॉटर प्युरिफायर फोटो",
    choosePhotoMethod: "तुम्ही फोटो कसा जोडू इच्छिता ते निवडा",
    cancel: "रद्द करा",
    takePhoto: "फोटो काढा",
    chooseFromGallery: "गॅलरीमधून निवडा",
    removePhoto: "फोटो काढून टाका",
    
    // Customer Details
    customerDetails: "👤 ग्राहक तपशील",
    fullName: "पूर्ण नाव",
    enterFullName: "ग्राहकाचे पूर्ण नाव प्रविष्ट करा",
    phoneNumber: "फोन नंबर",
    phonePlaceholder: "+91 XXXXX XXXXX",
    address: "पत्ता",
    enterAddress: "खूण सह पूर्ण पत्ता प्रविष्ट करा",
    
    // SMS Reminder
    smsReminderSettings: "📱 SMS स्मरणपत्र सेटिंग्ज",
    smsReminderDescription: "सर्व्हिस फॉलो-अपसाठी स्वयंचलित SMS स्मरणपत्र सेट करा",
    date: "तारीख",
    selectDate: "तारीख निवडा",
    time: "वेळ",
    selectTime: "वेळ निवडा",
    messageType: "संदेश प्रकार",
    defaultMessage: "डीफॉल्ट संदेश",
    customMessage: "सानुकूल संदेश",
    customMessageLabel: "सानुकूल संदेश",
    writeOwnMessage: "तुमचा स्वतःचा संदेश लिहा",
    enterCustomMessage: "तुमचा सानुकूल स्मरणपत्र संदेश प्रविष्ट करा...",
    testSMS: "SMS टेस्ट करा",
    smsReminderScheduled: "✓ SMS स्मरणपत्र शेड्यूल केले",
    at: "वाजता",
    viaSMS: "यावरून SMS",
    
    // Default SMS Message
    defaultSMSTemplate: (name: string, phone: string) => 
      `नमस्कार ${name}, हे एक स्मरणपत्र आहे की तुमच्या वॉटर प्युरिफायरची सर्व्हिसची वेळ आली आहे. कृपया आमच्याशी ${phone} वर संपर्क साधा. धन्यवाद!`,
    
    // Buttons
    cancelButton: "रद्द करा",
    updateCustomer: "💾 ग्राहक अपडेट करा",
    saveCustomer: "✓ ग्राहक जतन करा",
    saving: "जतन करत आहे...",
    
    // Alerts & Validation
    permissionRequired: "परवानगी आवश्यक",
    cameraPermissionMessage: "फोटो घेण्यासाठी कॅमेरा परवानगी शिफारसीय आहे.",
    galleryPermissionMessage: "फोटो निवडण्यासाठी गॅलरी परवानगी आवश्यक आहे.",
    validationError: "प्रमाणीकरण त्रुटी",
    enterCustomerName: "कृपया ग्राहकाचे नाव प्रविष्ट करा",
    enterPhoneNumber: "कृपया फोन नंबर प्रविष्ट करा",
    enterValidPhone: "कृपया वैध फोन नंबर प्रविष्ट करा",
    enterAddressError: "कृपया पत्ता प्रविष्ट करा",
    reminderDateFuture: "स्मरणपत्र तारीख भविष्यात असणे आवश्यक आहे",
    enterCustomMessageError: "कृपया सानुकूल संदेश प्रविष्ट करा",
    error: "त्रुटी",
    enterPhoneFirst: "कृपया प्रथम फोन नंबर प्रविष्ट करा",
    smsNotAvailable: "SMS उपलब्ध नाही",
    smsNotAvailableMessage: "या डिव्हाइसवर SMS कार्यक्षमता उपलब्ध नाही",
    smsError: "SMS त्रुटी",
    smsErrorMessage: "SMS पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
    success: "यशस्वी",
    customerUpdatedSuccess: (date: string, time: string) => 
      `ग्राहक यशस्वीरित्या अपडेट केला! SMS स्मरणपत्र ${date} रोजी ${time} वाजता सेट केले.`,
    customerAddedSuccess: (date: string, time: string) => 
      `ग्राहक यशस्वीरित्या जोडला! SMS स्मरणपत्र ${date} रोजी ${time} वाजता सेट केले.`,
    customerUpdatedSimple: "ग्राहक यशस्वीरित्या अपडेट केला!",
    customerAddedSimple: "ग्राहक यशस्वीरित्या जोडला!",
    updateError: "ग्राहक अपडेट करण्यात अयशस्वी. कृपया तुमचे इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
    saveError: "ग्राहक जतन करण्यात अयशस्वी. कृपया तुमचे इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
  }
};

// Helper function to get translations
export const t = (key: string, lang: 'en' | 'mr' = 'mr', ...args: any[]) => {
  const translation = translations[lang][key as keyof typeof translations.en];

  if (typeof translation === 'function') {
  return (translation as (...params: unknown[]) => string)(...args);
}

  
  return translation || key;
};