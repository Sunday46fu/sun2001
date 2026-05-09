const line = require('@line/bot-sdk');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, child, get } = require('firebase/database');

// --- 1. Firebase Configuration (ชุดเดียวกับหน้าเว็บ) ---
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

// --- 2. LINE Configuration (ใส่ Token ของคุณตรงนี้) ---
const lineConfig = {
    channelAccessToken: "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "d5c1ac6a8d448c9a2dfdd994bc884afa"
};

const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.channelAccessToken
});

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };

    try {
        const body = JSON.parse(event.body);
        const lineEvent = body.events[0];

        if (lineEvent && lineEvent.type === 'message' && lineEvent.message.type === 'text') {
            const userMsg = lineEvent.message.text.trim();
            
            // ดึงข้อมูลจากฐานข้อมูล Node: bot_rules
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `bot_rules/${userMsg}`));
            
            if (snapshot.exists()) {
                const replyText = snapshot.val();
                await client.replyMessage({
                    replyToken: lineEvent.replyToken,
                    messages: [{ type: 'text', text: replyText }]
                });
            }
        }
    } catch (err) {
        console.error(err);
    }

    return { statusCode: 200, body: 'OK' };
};
