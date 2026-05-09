const line = require('@line/bot-sdk');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

// --- 1. Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAWUWpDnF5Yt7QQ0ULvsxSVJhV0ckGMfu8",
    authDomain: "chatcharin-af5e4.firebaseapp.com",
    databaseURL: "https://chatcharin-af5e4-default-rtdb.firebaseio.com",
    projectId: "chatcharin-af5e4",
    storageBucket: "chatcharin-af5e4.firebasestorage.app",
    messagingSenderId: "631954642041",
    appId: "1:631954642041:web:586447ace8ad055ca3f0a8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 2. LINE Configuration ---
const lineConfig = {
    channelAccessToken: "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "d5c1ac6a8d448c9a2dfdd994bc884afa"
};

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken
});

exports.handler = async (event) => {
    // ป้องกันการยิง Request ที่ไม่ใช่ POST
    if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };

    try {
        const body = JSON.parse(event.body);
        const lineEvent = body.events[0];

        // ตรวจสอบว่าเป็น Event ข้อความแบบ Text เท่านั้น
        if (lineEvent && lineEvent.type === 'message' && lineEvent.message.type === 'text') {
            const userMsg = lineEvent.message.text.trim().toLowerCase(); // แปลงเป็นพิมพ์เล็กเพื่อเทียบง่ายขึ้น
            
            // ดึงข้อมูล Rules และ Settings ทั้งหมดจาก Database ในครั้งเดียว
            const dbRef = ref(db, 'bot_data');
            const snapshot = await get(dbRef);
            
            let finalReplyText = null;

            if (snapshot.exists()) {
                const data = snapshot.val();
                const rules = data.rules || {};
                const settings = data.settings || {};
                
                let exactMatch = null;
                let containsMatch = null;

                // Loop ค้นหาเงื่อนไขที่ตรงที่สุด
                for (const key in rules) {
                    const rule = rules[key];
                    const keywordLower = rule.keyword.toLowerCase();

                    // กรณี Exact Match (ตรงแบบเป๊ะๆ)
                    if (rule.type === 'exact' && userMsg === keywordLower) {
                        exactMatch = rule.response;
                        break; // เจอตัวเป๊ะแล้ว หยุดหาทันที
                    }
                    
                    // กรณี Contains (มีคำนี้ผสมอยู่)
                    if (rule.type === 'contains' && userMsg.includes(keywordLower)) {
                        containsMatch = rule.response;
                    }
                }

                // เลือกลำดับความสำคัญในการตอบ: Exact -> Contains -> Fallback(ถ้ามี)
                if (exactMatch) {
                    finalReplyText = exactMatch;
                } else if (containsMatch) {
                    finalReplyText = containsMatch;
                } else if (settings.fallback && settings.fallback.trim() !== '') {
                    finalReplyText = settings.fallback;
                }
            }

            // ถ้ามีข้อความที่ต้องตอบกลับ ให้ส่งไปที่ LINE
            if (finalReplyText) {
                await client.replyMessage({
                    replyToken: lineEvent.replyToken,
                    messages: [{ type: 'text', text: finalReplyText }]
                });
            }
        }
    } catch (err) {
        console.error('Webhook Error:', err);
    }

    return { statusCode: 200, body: 'OK' };
};
