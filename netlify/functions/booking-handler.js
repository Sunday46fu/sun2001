const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { userId, brand, date, time } = JSON.parse(event.body);
        const LINE_TOKEN = "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU="; 

        const flexMessage = {
            type: "flex",
            altText: "ยืนยันการจองคิวชมรถ",
            contents: {
                type: "bubble",
                body: {
                    type: "box", layout: "vertical", contents: [
                        { type: "text", text: "Booking Confirmed", weight: "bold", color: "#3b82f6", size: "sm" },
                        { type: "text", text: "ขอบคุณสำหรับการจองคิว", weight: "bold", size: "xl", margin: "md" },
                        { type: "separator", margin: "lg" },
                        { type: "box", layout: "vertical", margin: "lg", spacing: "sm", contents: [
                            { type: "text", text: `แบรนด์: ${brand}`, size: "sm", color: "#666666" },
                            { type: "text", text: `วันที่: ${date}`, size: "sm", color: "#666666" },
                            { type: "text", text: `เวลา: ${time} น.`, size: "sm", color: "#666666" }
                        ]}
                    ]
                }
            }
        };

        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [flexMessage]
        }, {
            headers: { 'Authorization': `Bearer ${LINE_TOKEN}` }
        });

        return { statusCode: 200, body: JSON.stringify({ status: "Success" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
