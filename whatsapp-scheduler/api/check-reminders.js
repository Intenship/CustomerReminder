// const admin = require('firebase-admin');
// const axios = require('axios');

// // Initialize Firebase Admin SDK (only once)
// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
//       })
//     });
//     console.log('Firebase Admin initialized successfully');
//   } catch (error) {
//     console.error('Failed to initialize Firebase Admin:', error);
//   }
// }

// const db = admin.firestore();

// // Helper function to format phone number for WhatsApp
// function formatPhoneNumber(phone) {
//   // Remove all non-digit characters
//   let cleaned = phone.replace(/\D/g, '');
  
//   // If number doesn't start with country code, add India code (91)
//   if (cleaned.length === 10) {
//     cleaned = '91' + cleaned;
//   }
  
//   return cleaned;
// }

// module.exports = async (req, res) => {
//   console.log('Cron job triggered at:', new Date().toISOString());

//   // Security: Verify cron secret to prevent unauthorized access
//   const authHeader = req.headers.authorization;
//   const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  
//   if (authHeader !== expectedAuth) {
//     console.error('Unauthorized cron job access attempt');
//     return res.status(401).json({ 
//       error: 'Unauthorized',
//       message: 'Invalid or missing authorization token'
//     });
//   }

//   try {
//     const now = admin.firestore.Timestamp.now();
    
//     console.log('Querying reminders due before:', now.toDate().toISOString());

//     // Query reminders that are due and haven't been sent yet
//     const remindersSnapshot = await db.collection('reminders')
//       .where('scheduledTime', '<=', now)
//       .where('sent', '==', false)
//       .limit(50)
//       .get();

//     console.log(`Found ${remindersSnapshot.size} reminders to process`);

//     if (remindersSnapshot.empty) {
//       return res.status(200).json({
//         success: true,
//         message: 'No reminders to process',
//         processed: 0,
//         timestamp: new Date().toISOString()
//       });
//     }

//     const results = [];
    
//     // ✅ Use production domain directly
//     const vercelUrl = 'https://whatsapp-scheduler-mu.vercel.app';

//     console.log('Using API URL:', vercelUrl);

//     // Process each reminder
//     for (const doc of remindersSnapshot.docs) {
//       const reminder = doc.data();
//       const reminderId = doc.id;
      
//       console.log(`Processing reminder ${reminderId} for ${reminder.customerName}`);

//       try {
//         // Format phone number properly
//         const formattedPhone = formatPhoneNumber(reminder.phone);
        
//         console.log(`Formatted phone: ${reminder.phone} -> ${formattedPhone}`);
        
//         // Prepare request payload
//         const payload = {
//           to: formattedPhone,
//           message: reminder.message || `Hi ${reminder.customerName}, this is a reminder about your scheduled service.`,
//           customerId: reminder.customerId || reminderId
//         };
        
//         console.log('Sending payload:', JSON.stringify(payload, null, 2));

//         // Call our send-whatsapp endpoint
//         const response = await axios.post(
//           `${vercelUrl}/api/send-whatsapp`,
//           payload,
//           {
//             timeout: 30000, // Increased timeout to 30 seconds
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         console.log('WhatsApp API Response:', response.data);

//         // Mark reminder as sent in Firestore
//         await doc.ref.update({
//           sent: true,
//           sentAt: admin.firestore.FieldValue.serverTimestamp(),
//           messageId: response.data.messageId,
//           whatsappId: response.data.whatsappId,
//           formattedPhone: formattedPhone
//         });

//         console.log(`✓ Successfully sent reminder ${reminderId} to ${formattedPhone}`);
        
//         results.push({ 
//           id: reminderId,
//           customerName: reminder.customerName,
//           phone: reminder.phone,
//           formattedPhone: formattedPhone,
//           status: 'sent',
//           messageId: response.data.messageId
//         });

//       } catch (error) {
//         console.error(`✗ Failed to send reminder ${reminderId}:`, error.message);
        
//         // Log detailed error information
//         if (error.response) {
//           console.error('Error response status:', error.response.status);
//           console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
//         }
        
//         // Increment error count but don't mark as sent
//         const errorCount = (reminder.errorCount || 0) + 1;
        
//         const errorDetails = {
//           message: error.message,
//           status: error.response?.status,
//           data: error.response?.data
//         };
        
//         await doc.ref.update({
//           lastError: JSON.stringify(errorDetails),
//           lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
//           errorCount: errorCount,
//           // If error count exceeds 3, mark as failed to prevent infinite retries
//           ...(errorCount >= 3 && { sent: true, failed: true })
//         });

//         results.push({ 
//           id: reminderId,
//           customerName: reminder.customerName,
//           phone: reminder.phone,
//           status: errorCount >= 3 ? 'failed_permanent' : 'failed_retry',
//           error: error.message,
//           errorDetails: errorDetails,
//           errorCount: errorCount
//         });
//       }

//       // Add small delay between messages to avoid rate limits
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     }

//     // Return summary
//     const summary = {
//       success: true,
//       timestamp: new Date().toISOString(),
//       totalProcessed: results.length,
//       sent: results.filter(r => r.status === 'sent').length,
//       failed: results.filter(r => r.status !== 'sent').length,
//       results: results
//     };

//     console.log('Cron job completed:', JSON.stringify(summary, null, 2));

//     return res.status(200).json(summary);

//   } catch (error) {
//     console.error('Cron job error:', error);
//     return res.status(500).json({ 
//       error: 'Cron job failed',
//       message: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// };

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