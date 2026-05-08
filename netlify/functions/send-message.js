const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { userId, brand, date, time } = JSON.parse(event.body);

        // Token ของพี่ (ตรวจสอบอีกครั้งว่าใน LINE Developers กด Issue มาใหม่ๆ หรือยัง)
        const LINE_TOKEN = "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU=";

        // Generate booking reference
        const bookingRef = "ZIS-" + Date.now().toString().slice(-6);

        const flexMessage = {
            type: "flex",
            altText: "✅ ยืนยันการจองคิว | Zis Car Service",
            contents: {
                type: "bubble",
                size: "mega",
                header: {
                    type: "box",
                    layout: "vertical",
                    paddingAll: "0px",
                    contents: [
                        {
                            type: "box",
                            layout: "vertical",
                            paddingTop: "22px",
                            paddingBottom: "18px",
                            paddingStart: "22px",
                            paddingEnd: "22px",
                            background: {
                                type: "linearGradient",
                                angle: "135deg",
                                startColor: "#0A0A0A",
                                endColor: "#1A1A2E"
                            },
                            contents: [
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    alignItems: "center",
                                    contents: [
                                        { type: "box", layout: "vertical", width: "3px", height: "28px", cornerRadius: "2px", backgroundColor: "#C9A84C", contents: [] },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            paddingStart: "10px",
                                            flex: 1,
                                            contents: [
                                                { type: "text", text: "ZIS CAR SERVICE", weight: "bold", size: "lg", color: "#FFFFFF", letterSpacing: "2px" },
                                                { type: "text", text: "Premium Auto Center", size: "xxs", color: "#C9A84C", margin: "xs" }
                                            ]
                                        },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            paddingTop: "5px",
                                            paddingBottom: "5px",
                                            paddingStart: "10px",
                                            paddingEnd: "10px",
                                            cornerRadius: "20px",
                                            backgroundColor: "#C9A84C",
                                            contents: [
                                                { type: "text", text: "✓ ยืนยันแล้ว", size: "xxs", color: "#0A0A0A", weight: "bold" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "box", layout: "vertical", height: "1px", backgroundColor: "#C9A84C", margin: "md", opacity: "0.4", contents: [] },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    margin: "sm",
                                    alignItems: "center",
                                    contents: [
                                        { type: "text", text: "เลขที่การจอง", size: "xxs", color: "#888888" },
                                        { type: "text", text: bookingRef, size: "xxs", color: "#C9A84C", weight: "bold", align: "end", flex: 1 }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                body: {
                    type: "box",
                    layout: "vertical",
                    paddingAll: "0px",
                    backgroundColor: "#FAFAFA",
                    contents: [
                        {
                            type: "box",
                            layout: "vertical",
                            paddingTop: "20px",
                            paddingBottom: "6px",
                            paddingStart: "22px",
                            paddingEnd: "22px",
                            contents: [
                                { type: "text", text: "รายละเอียดการนัดหมาย", size: "xxs", color: "#999999", weight: "bold", letterSpacing: "1px" },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    margin: "lg",
                                    alignItems: "center",
                                    contents: [
                                        { type: "box", layout: "vertical", width: "36px", height: "36px", cornerRadius: "18px", backgroundColor: "#F0E6CC", justifyContent: "center", alignItems: "center", contents: [{ type: "text", text: "🚗", size: "sm", align: "center" }] },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            paddingStart: "14px",
                                            flex: 1,
                                            contents: [
                                                { type: "text", text: "แบรนด์รถยนต์", size: "xxs", color: "#999999" },
                                                { type: "text", text: brand || "N/A", size: "md", color: "#1A1A2E", weight: "bold", margin: "xs" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "separator", margin: "lg", color: "#EEEEEE" },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    margin: "lg",
                                    alignItems: "center",
                                    contents: [
                                        { type: "box", layout: "vertical", width: "36px", height: "36px", cornerRadius: "18px", backgroundColor: "#F0E6CC", justifyContent: "center", alignItems: "center", contents: [{ type: "text", text: "📅", size: "sm", align: "center" }] },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            paddingStart: "14px",
                                            flex: 1,
                                            contents: [
                                                { type: "text", text: "วันที่นัดหมาย", size: "xxs", color: "#999999" },
                                                { type: "text", text: date || "N/A", size: "md", color: "#1A1A2E", weight: "bold", margin: "xs" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "separator", margin: "lg", color: "#EEEEEE" },
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    margin: "lg",
                                    alignItems: "center",
                                    contents: [
                                        { type: "box", layout: "vertical", width: "36px", height: "36px", cornerRadius: "18px", backgroundColor: "#F0E6CC", justifyContent: "center", alignItems: "center", contents: [{ type: "text", text: "🕐", size: "sm", align: "center" }] },
                                        {
                                            type: "box",
                                            layout: "vertical",
                                            paddingStart: "14px",
                                            flex: 1,
                                            contents: [
                                                { type: "text", text: "เวลานัดหมาย", size: "xxs", color: "#999999" },
                                                { type: "text", text: (time || "N/A") + " น.", size: "md", color: "#1A1A2E", weight: "bold", margin: "xs" }
                                            ]
                                        }
                                    ]
                                },
                                { type: "box", layout: "vertical", height: "16px", contents: [] }
                            ]
                        },
                        {
                            type: "box",
                            layout: "horizontal",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            paddingStart: "16px",
                            paddingEnd: "16px",
                            backgroundColor: "#FDF8EC",
                            alignItems: "center",
                            contents: [
                                { type: "text", text: "⚠️", size: "sm", flex: 0 },
                                { type: "text", text: "  กรุณามาถึงก่อนเวลานัด 15 นาที", size: "xs", color: "#8B6914", flex: 1, wrap: true }
                            ]
                        }
                    ]
                },
                footer: {
                    type: "box",
                    layout: "vertical",
                    paddingAll: "0px",
                    contents: [
                        {
                            type: "box",
                            layout: "vertical",
                            paddingTop: "16px",
                            paddingBottom: "18px",
                            paddingStart: "22px",
                            paddingEnd: "22px",
                            background: {
                                type: "linearGradient",
                                angle: "135deg",
                                startColor: "#0A0A0A",
                                endColor: "#1A1A2E"
                            },
                            contents: [
                                {
                                    type: "box",
                                    layout: "horizontal",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    contents: [
                                        { type: "text", text: "✦", size: "xs", color: "#C9A84C", flex: 0 },
                                        { type: "text", text: "  ขอบคุณที่ไว้วางใจ Zis Car Service  ", size: "xs", color: "#CCCCCC", align: "center", flex: 0 },
                                        { type: "text", text: "✦", size: "xs", color: "#C9A84C", flex: 0 }
                                    ]
                                },
                                { type: "text", text: "We care about your car.", size: "xxs", color: "#555555", align: "center", margin: "sm" }
                            ]
                        }
                    ]
                }
            }
        };

        const response = await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [flexMessage]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_TOKEN}`
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Success", bookingRef })
        };
    } catch (error) {
        // Log Error ให้พี่ไปเช็คใน Netlify
        console.error("LINE API ERROR DETAILS:", error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                details: error.response ? error.response.data : "Check logs" 
            })
        };
    }
};
