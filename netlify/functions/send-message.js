const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405 };

    try {
        const { userId, brand, date, time } = JSON.parse(event.body);
        
        // --- ใส่ Channel Access Token ของพี่ตรงนี้ ---
        const LINE_TOKEN = "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU="; 

        const flexMessage = {
            type: "flex",
            altText: "ใบยืนยันการจองคิวรถยนต์",
            contents: {
              type: "bubble",
              size: "mega",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: "ใบยืนยันการจองคิว", weight: "bold", size: "xl", color: "#ffffff" },
                  { type: "text", text: "Premium Car Service", size: "xs", color: "#ffffffcc", margin: "xs" }
                ],
                backgroundColor: "#06C755",
                paddingAll: "20px"
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "vertical",
                    margin: "lg",
                    spacing: "sm",
                    contents: [
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          { type: "text", text: "แบรนด์รถ", color: "#aaaaaa", size: "sm", flex: 2 },
                          { type: "text", text: brand, wrap: true, color: "#333333", size: "sm", flex: 5, weight: "bold" }
                        ]
                      },
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          { type: "text", text: "วันที่นัด", color: "#aaaaaa", size: "sm", flex: 2 },
                          { type: "text", text: date, wrap: true, color: "#333333", size: "sm", flex: 5 }
                        ]
                      },
                      {
                        type: "box",
                        layout: "baseline",
                        spacing: "sm",
                        contents: [
                          { type: "text", text: "เวลานัด", color: "#aaaaaa", size: "sm", flex: 2 },
                          { type: "text", text: time + " น.", wrap: true, color: "#333333", size: "sm", flex: 5 }
                        ]
                      }
                    ]
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    margin: "xxl",
                    contents: [
                      { type: "text", text: "กรุณามาถึงก่อนเวลานัด 15 นาที", size: "xxs", color: "#aaaaaa", align: "center" }
                    ]
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: "ขอบคุณที่ใช้บริการ", align: "center", color: "#06C755", size: "sm", weight: "bold" }
                ]
              },
              styles: { footer: { separator: true } }
            }
        };

        await axios.post('https://api.line.me/v2/bot/message/push', {
            to: userId,
            messages: [flexMessage]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_TOKEN}`
            }
        });

        return { statusCode: 200, body: JSON.stringify({ status: "Success" }) };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
