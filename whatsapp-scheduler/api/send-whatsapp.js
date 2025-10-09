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

//     const { to, customerName, customerId } = req.body || {};

//     if (!to || !customerName) {
//       return res.status(400).json({
//         error: "Missing required fields: to, customerName",
//       });
//     }

//     const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
//     const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

//     if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
//       return res.status(500).json({
//         error: "Server configuration error",
//       });
//     }

//     // Format phone number (add country code if needed)
//     let formattedPhone = to.replace(/[^0-9]/g, "");
//     if (formattedPhone.length === 10) {
//       formattedPhone = "91" + formattedPhone;
//     }

//     const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

//     // ✅ Use template message with customer name
//     const messagePayload = {
//       messaging_product: "whatsapp",
//       recipient_type: "individual",
//       to: formattedPhone,
//       type: "template",
//       template: {
//         name: "service_reminder", // Your template name
//         language: {
//           code: "en_US" // or "mr" for Marathi if you create that template
//         },
//         components: [
//           {
//             type: "body",
//             parameters: [
//               {
//                 type: "text",
//                 text: customerName // This replaces {{1}} in template
//               }
//             ]
//           }
//         ]
//       }
//     };

//     log("📤 Sending reminder to:", formattedPhone);
//     log("Customer:", customerName);

//     const response = await axios.post(
//       WHATSAPP_API_URL,
//       messagePayload,
//       {
//         headers: {
//           Authorization: `Bearer ${ACCESS_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 15000,
//       }
//     );

//     const msgId = response?.data?.messages?.[0]?.id || null;
//     const waId = response?.data?.contacts?.[0]?.wa_id || null;

//     log("✅ Message sent successfully", { msgId, waId });

//     return res.status(200).json({
//       success: true,
//       messageId: msgId,
//       whatsappId: waId,
//       timestamp: new Date().toISOString(),
//     });

//   } catch (error) {
//     const status = error.response?.status || 500;
//     const details = error.response?.data?.error?.message || error.message;

//     console.error("❌ WhatsApp Error:", {
//       status,
//       details,
//       response: error.response?.data,
//     });

//     return res.status(status).json({
//       error: "Failed to send WhatsApp message",
//       details,
//       code: error.response?.data?.error?.code || "UNKNOWN_ERROR",
//     });
//   }
// };

const axios = require("axios");

const log = (...args) => {
  console.log(...args);
};

module.exports = async (req, res) => {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { to, customerName, customerId } = req.body || {};

    if (!to || !customerName) {
      return res.status(400).json({
        error: "Missing required fields: to, customerName",
      });
    }

    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    // Format phone number (add country code if needed)
    let formattedPhone = to.replace(/[^0-9]/g, "");
    if (formattedPhone.length === 10) {
      formattedPhone = "91" + formattedPhone;
    }

    const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    // ✅ Use template message
    // For now using "hello_world", replace with "service_reminder" after approval
    const messagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: "template",
      template: {
        name: "hello_world", // Change to "service_reminder" after template is approved
        language: {
          code: "en_US"
        }
        // Uncomment below when using custom template with parameters
        // components: [
        //   {
        //     type: "body",
        //     parameters: [
        //       {
        //         type: "text",
        //         text: customerName
        //       }
        //     ]
        //   }
        // ]
      }
    };

    log("📤 Sending reminder to:", formattedPhone);
    log("Customer:", customerName);

    const response = await axios.post(
      WHATSAPP_API_URL,
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const msgId = response?.data?.messages?.[0]?.id || null;
    const waId = response?.data?.contacts?.[0]?.wa_id || null;

    log("✅ Message sent successfully", { msgId, waId });

    return res.status(200).json({
      success: true,
      messageId: msgId,
      whatsappId: waId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data?.error?.message || error.message;

    console.error("❌ WhatsApp Error:", {
      status,
      details,
      response: error.response?.data,
    });

    return res.status(status).json({
      error: "Failed to send WhatsApp message",
      details,
      code: error.response?.data?.error?.code || "UNKNOWN_ERROR",
    });
  }
};