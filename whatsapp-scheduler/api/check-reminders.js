const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

const db = admin.firestore();

// Helper function to format phone number for WhatsApp
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If number doesn't start with country code, add India code (91)
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  
  return cleaned;
}

module.exports = async (req, res) => {
  console.log('Cron job triggered at:', new Date().toISOString());

  // Security: Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
  if (authHeader !== expectedAuth) {
    console.error('Unauthorized cron job access attempt');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing authorization token'
    });
  }

  try {
    const now = admin.firestore.Timestamp.now();
    
    console.log('Querying reminders due before:', now.toDate().toISOString());

    // Query reminders that are due and haven't been sent yet
    const remindersSnapshot = await db.collection('reminders')
      .where('scheduledTime', '<=', now)
      .where('sent', '==', false)
      .limit(50)
      .get();

    console.log(`Found ${remindersSnapshot.size} reminders to process`);

    if (remindersSnapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No reminders to process',
        processed: 0,
        timestamp: new Date().toISOString()
      });
    }

    const results = [];
    
    // ✅ Use production domain directly
    const vercelUrl = 'https://whatsapp-scheduler-mu.vercel.app';

    console.log('Using API URL:', vercelUrl);

    // Process each reminder
    for (const doc of remindersSnapshot.docs) {
      const reminder = doc.data();
      const reminderId = doc.id;
      
      console.log(`Processing reminder ${reminderId} for ${reminder.customerName}`);

      try {
        // Format phone number properly
        const formattedPhone = formatPhoneNumber(reminder.phone);
        
        console.log(`Formatted phone: ${reminder.phone} -> ${formattedPhone}`);
        
        // Prepare request payload - match send-whatsapp.js requirements
        const payload = {
          to: formattedPhone,
          customerName: reminder.customerName, // ✅ Required by send-whatsapp
          customerId: reminder.customerId || reminderId
        };
        
        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        // Call our send-whatsapp endpoint
        const response = await axios.post(
          `${vercelUrl}/api/send-whatsapp`,
          payload,
          {
            timeout: 30000, // Increased timeout to 30 seconds
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('WhatsApp API Response:', response.data);

        // Mark reminder as sent in Firestore
        await doc.ref.update({
          sent: true,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          messageId: response.data.messageId,
          whatsappId: response.data.whatsappId,
          formattedPhone: formattedPhone
        });

        console.log(`✓ Successfully sent reminder ${reminderId} to ${formattedPhone}`);
        
        results.push({ 
          id: reminderId,
          customerName: reminder.customerName,
          phone: reminder.phone,
          formattedPhone: formattedPhone,
          status: 'sent',
          messageId: response.data.messageId
        });

      } catch (error) {
        console.error(`✗ Failed to send reminder ${reminderId}:`, error.message);
        
        // Log detailed error information
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Increment error count but don't mark as sent
        const errorCount = (reminder.errorCount || 0) + 1;
        
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
        
        await doc.ref.update({
          lastError: JSON.stringify(errorDetails),
          lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
          errorCount: errorCount,
          // If error count exceeds 3, mark as failed to prevent infinite retries
          ...(errorCount >= 3 && { sent: true, failed: true })
        });

        results.push({ 
          id: reminderId,
          customerName: reminder.customerName,
          phone: reminder.phone,
          status: errorCount >= 3 ? 'failed_permanent' : 'failed_retry',
          error: error.message,
          errorDetails: errorDetails,
          errorCount: errorCount
        });
      }

      // Add small delay between messages to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Return summary
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalProcessed: results.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status !== 'sent').length,
      results: results
    };

    console.log('Cron job completed:', JSON.stringify(summary, null, 2));

    return res.status(200).json(summary);

  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({ 
      error: 'Cron job failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


// check-reminders.js
// const admin = require("firebase-admin");
// const { Timestamp } = require("firebase-admin/firestore");
// const axios = require("axios");

// // Logging helper
// const log = (...args) => console.log(...args);

// // --- Hardcoded Firebase service account ---
// const serviceAccount = {
//   type: "service_account",
//   project_id: "trafficupdates-90fa0",
//   private_key_id: "fb3832ec717780f1e89623a7f2108c03dfa69ad7",
//   private_key: `-----BEGIN PRIVATE KEY-----
// MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+6v4eM107sKxX
// tKBT5SQgF/qeYVwBaY2ZRsLiTzVpHCOybxA80CB6tshAFSTPCtjZ7I92leyeZbUK
// xZj3Yz4QEnXprqRP0gKIkr+v0NaYWrZSobRwOTffYEuUvPTFyt+O3Ae5sQte4VyQ
// 0LZLvutBL37HGYcX4jv3N7xe9w+xUwOByyYUITVU2L8IxDFwj30txsZfq69NkASg
// cxLPFVoHZNwYt3FefEqMiuVw7S5Dvns7E6HwHrb7xqhskzPW8FIR7cYGkWJgh5zS
// BzpJ0PgArnkPqOdSW4V6pGZ5JeatTIQ/OBKp//K3zLwmkuP8sP6wheAOPPSKgtAt
// 9jqhiFlpAgMBAAECggEABcsiQn7bB65tEG1IBzu3HK01mvxH2zgdhqb1z4HJVGL4
// 91d09e936NlmmsE5gHnrCjPqR5Y1m7no5EaKRYmSrtCsmNaGoHB2SLgxTm/HL1Dj
// Yv8Kt3QZDLOCn6UbRWxKW+6z4k/r0SmEElXvDj3hLDV5gqe06IXiPXaIxhX3uTEG
// 8m4ugN8oMj7yDf9anLjsu5k0ttXVkTrMfNFg8p6GoyyZDGMsrSOJN0VxGcrOrR7i
// 7AWIFN3nL1Nd1wAXxYqPN4oqc1SpVwbfBoZ6DrHf0Rv9HfzRhAc3+rVVA18/hvzO
// Yhn0XPFZZQ2TC1CPzBqJOUdhBSqVtxXUQrT95X4PrQKBgQD4RYaX5lSaqn6G6Ecn
// QTpOfbWu/5Pvez21iUdxZb2nuUoZBXHUku3XLvLyZs8Qetp13iEjm6BCr151B289
// v2fA9QD0Cc7FPuUz8CQTCqgLTiDQAB4zXL3nblrsBqGVpN+rmhkE2Nc4ctg2B5xO
// 0Udmh52hV3J6ajr2zmWCgn2U/QKBgQDE3GqJmjJJlO8MyVJixPg/1lZ/aUpRdvHV
// n9QIIjGX5BHqbz+u1y27s38fQh/bsbZZwOhPncWqCyMms2GVyf+7axNf13rsuRVS
// Rb6mPjxDjl/vJ22s3f8wcueF4KOLijNSwG6Dc62XfofuwXa2jVxbprCIiAzyNCmu
// 48O+uGwX3QKBgBJdkkdKUpfeZN218Q2GVbnYssfvQBJHG5mCPja1QAJYQpL3RCRl
// ehKg9nfYAxlE/UQa2ni32nMUZfhiRGhc8F/lv9xNnW4Z6PqemQyPjT7I2MSKPbGu
// +p1UHIW5N9rKB4G6NH+XStRyKmxUw8tQz+dVwONehKlpklMPkZLF9GRBAoGAPpA+
// W5ThvnjSsCGbSUCIFOGtg7iWoeVHXjj5TcxwLnGRMAxDFPHV2v1kvS5qqYuFBGlG
// a2cc1rnLZhVEQjJ8T7fr5F2691iq6ga4XGUTCfVJj9vcA0BaRa9+3RFTaJl3TilR
// 9fzhgm/4C2z4qXOrkoUbPYjfdGoXhTllkEtULxECgYA6iKFXNYnauMdaIkUGNI5L
// /EGg+I0+gaZaD9fchX1LqznguiqLGCc9WQSfYrtI16WbAxtfZYAFL2tMAFb828x5
// RA1gwZGqVqQjg/3QYNN+wuxf+cSXMuEhBTDGxRJLb0MX2tWVP3ucSd2nVH2qp6L+
// DM8M1aooWHODUA47gOf+iQ==
// -----END PRIVATE KEY-----\n`,
//   client_email: "firebase-adminsdk-fbsvc@trafficupdates-90fa0.iam.gserviceaccount.com",
//   client_id: "115683705020336130488",
//   auth_uri: "https://accounts.google.com/o/oauth2/auth",
//   token_uri: "https://oauth2.googleapis.com/token",
//   auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//   client_x509_cert_url:
//     "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40trafficupdates-90fa0.iam.gserviceaccount.com",
// };

// // --- Initialize Firebase Admin ---
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
//   log("✅ Firebase Admin initialized");
// }

// // Firestore instance
// const db = admin.firestore();

// // --- Serverless function handler ---
// module.exports = async (req, res) => {
//   try {
//     // CORS headers
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     if (req.method === "OPTIONS") return res.status(200).end();

//     log("🔍 Checking for reminders...");

//     const now = new Date();
//     const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

//     const remindersSnapshot = await db.collection("reminders")
//       .where("sent", "==", false)
//       .where("scheduledTime", "<=", Timestamp.fromDate(now))
//       .where("scheduledTime", ">=", Timestamp.fromDate(twentyFourHoursAgo))
//       .get();

//     if (remindersSnapshot.empty) {
//       log("✅ No reminders to send");
//       return res.status(200).json({ message: "No reminders to send", checkedAt: now.toISOString() });
//     }

//     const results = [];

//     for (const doc of remindersSnapshot.docs) {
//       const reminder = doc.data();
//       const reminderId = doc.id;

//       log(`📤 Processing reminder ${reminderId} for ${reminder.customerName}`);

//       try {
//         const VERCEL_URL = "whatsapp-scheduler-mu.vercel.app";

//         // 1️⃣ Send WhatsApp
//         const whatsappResponse = await axios.post(
//           `https://${VERCEL_URL}/api/send-whatsapp`,
//           {
//             to: reminder.phone,
//             customerName: reminder.customerName,
//             customerId: reminder.customerId,
//           },
//           { timeout: 15000 }
//         );
//         log(`✅ WhatsApp sent to ${reminder.customerName}`);

//         // 2️⃣ Push notification
//         if (reminder.expoPushToken) {
//           // try {
//           //   await axios.post(
//           //     "https://exp.host/--/api/v2/push/send",
//           //     {
//           //       to: reminder.expoPushToken,
//           //       sound: "default",
//           //       title: "⏰ Service Reminder",
//           //       body: reminder.message || `Hello ${reminder.customerName}, your appliance is due for servicing.`,
//           //       data: { customerId: reminder.customerId, type: "service_reminder" },
//           //       priority: "high",
//           //       channelId: "default",
//           //     },
//           //     { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 15000 }
//           //   );
//           //   log(`✅ Push notification sent to ${reminder.customerName}`);
//           // } catch (pushError) {
//           //   log(`⚠️ Push notification failed for ${reminder.customerName}:`, pushError.message);
//           // }
//            try {
//     const response = await axios.post(
//       `https://${VERCEL_URL}/api/send-push-notification`,
//       {
//         expoPushToken: reminder.expoPushToken,
//         title: "⏰ Service Reminder",
//         body: reminder.message || `Hello ${reminder.customerName}, your appliance is due for servicing.`,
//         data: { customerId: reminder.customerId, type: "service_reminder" }
//       },
//       { timeout: 15000 }
//     );
//     log(`✅ Push notification sent to ${reminder.customerName}:`, response.data);
//   } catch (pushError) {
//     log(`⚠️ Push notification failed for ${reminder.customerName}:`, pushError.message);
//   }
//         }

//         // 3️⃣ Mark reminder as sent
//         await db.collection("reminders").doc(reminderId).update({
//           sent: true,
//           sentAt: Timestamp.now(),
//           whatsappMessageId: whatsappResponse.data?.messageId || null,
//         });

//         results.push({ customerId: reminder.customerId, customerName: reminder.customerName, status: "sent", timestamp: new Date().toISOString() });
//       } catch (error) {
//         log(`❌ Error sending to ${reminder.customerName}:`, error.message);

//         const errorCount = (reminder.errorCount || 0) + 1;
//         await db.collection("reminders").doc(reminderId).update({
//           errorCount,
//           lastError: error.message,
//           lastErrorTime: Timestamp.now(),
//         });

//         results.push({ customerId: reminder.customerId, customerName: reminder.customerName, status: "failed", error: error.message });
//       }
//     }

//     log(`✅ Reminder check complete. Processed: ${results.length}`);
//     return res.status(200).json({ success: true, processed: results.length, results, timestamp: now.toISOString() });
//   } catch (error) {
//     console.error("❌ Error in check-reminders:", error);
//     return res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// };
