// // api/send-push-notification.js
// const axios = require("axios");

// const log = (...args) => {
//   console.log(...args);
// };

// module.exports = async (req, res) => {
//   try {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     if (req.method === "OPTIONS") return res.status(200).end();
//     if (req.method !== "POST") {
//       return res.status(405).json({ error: "Method not allowed" });
//     }

//     const { expoPushToken, title, body, data } = req.body || {};

//     if (!expoPushToken) {
//       return res.status(400).json({
//         error: "Missing required field: expoPushToken",
//       });
//     }

//     // Send push notification via Expo Push API
//     const message = {
//       to: expoPushToken,
//       sound: 'default',
//       title: title || '⏰ Service Reminder',
//       body: body || 'Your appliance is due for servicing.',
//       data: data || {},
//       priority: 'high',
//       channelId: 'default',
//     };

//     log("📤 Sending push notification to:", expoPushToken);

//     const response = await axios.post(
//       'https://exp.host/--/api/v2/push/send',
//       message,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'Accept-Encoding': 'gzip, deflate',
//         },
//         timeout: 15000,
//       }
//     );

//     log("✅ Push notification sent successfully");

//     return res.status(200).json({
//       success: true,
//       response: response.data,
//       timestamp: new Date().toISOString(),
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const details = error.response?.data || error.message;

//     console.error("❌ Push Notification Error:", {
//       status,
//       details,
//     });

//     return res.status(status).json({
//       error: "Failed to send push notification",
//       details,
//     });
//   }
// };