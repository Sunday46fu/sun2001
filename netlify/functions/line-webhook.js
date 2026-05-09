const line = require('@line/bot-sdk');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, child } = require('firebase/database');

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

const lineConfig = {
    channelAccessToken: "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "d5c1ac6a8d448c9a2dfdd994bc884afa"
};

const client = new line.messagingApi.MessagingApiClient({ channelAccessToken: lineConfig.channelAccessToken });

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };

    try {
        const body = JSON.parse(event.body);
        const lineEvent = body.events[0];

        if (lineEvent && lineEvent.type === 'message' && lineEvent.message.type === 'text') {
            const userMsg = lineEvent.message.text.trim();
            const userId = lineEvent.source.userId;
            
            let replyText = "ขออภัยครับ ระบบไม่เข้าใจคำสั่งพิมพ์ 'วิธีสั่งซื้อ' เพื่อดูตัวอย่างการสั่งสินค้า";

            // 🚀 ดึงโปรไฟล์ลูกค้าจาก LINE (เพื่อเอาชื่อ LINE มาเป็นชื่อลูกค้าชั่วคราว)
            let profileName = "ลูกค้า LINE";
            try {
                const profile = await client.getProfile(userId);
                profileName = profile.displayName;
            } catch(e) {}

            // 🚀 ฟีเจอร์: สั่งซื้ออัตโนมัติ (Auto-Order)
            // รูปแบบที่ลูกค้าต้องพิมพ์: "สั่งซื้อ [ชื่อสินค้า] [เบอร์โทร]"
            if (userMsg.startsWith('สั่งซื้อ')) {
                const parts = userMsg.split(' ');
                
                if(parts.length >= 3) {
                    const reqProductName = parts[1];
                    const phone = parts[2];
                    
                    // เช็คในฐานข้อมูลว่ามีสินค้านี้ไหม
                    const dbRef = ref(db);
                    const snap = await get(child(dbRef, 'store_data/products'));
                    
                    if(snap.exists()) {
                        const products = snap.val();
                        let foundProduct = null;
                        let productIdToUpdate = null;

                        for(let id in products) {
                            if(products[id].name.toLowerCase() === reqProductName.toLowerCase()) {
                                foundProduct = products[id];
                                productIdToUpdate = id;
                                break;
                            }
                        }

                        if(foundProduct) {
                            if(foundProduct.stock > 0) {
                                // 1. ตัดสต๊อก
                                await set(ref(db, `store_data/products/${productIdToUpdate}/stock`), foundProduct.stock - 1);
                                
                                // 2. บันทึกออเดอร์
                                const orderId = 'LINE' + Date.now();
                                await set(ref(db, `store_data/orders/${orderId}`), {
                                    customerName: profileName,
                                    phone: phone,
                                    address: "รอแจ้งที่อยู่เพิ่มเติม",
                                    productName: foundProduct.name,
                                    price: foundProduct.price,
                                    total: foundProduct.price,
                                    status: 'pending',
                                    date: new Date().toLocaleString('th-TH'),
                                    source: 'LINE Auto'
                                });

                                replyText = `🎉 รับออเดอร์เรียบร้อยครับ!\n\nรหัสออเดอร์: ${orderId}\nสินค้า: ${foundProduct.name}\nยอดรวม: ฿${foundProduct.price}\n\nกรุณาพิมพ์ที่อยู่จัดส่งทิ้งไว้ได้เลยครับ ทีมงานจะรีบจัดส่งให้เร็วที่สุด 📦`;
                            } else {
                                replyText = `🙏 ขออภัยครับ สินค้า "${foundProduct.name}" หมดสต๊อกชั่วคราวครับ`;
                            }
                        } else {
                            replyText = `❌ ไม่พบสินค้าชื่อ "${reqProductName}" ในระบบครับ กรุณาตรวจสอบชื่อสินค้าอีกครั้ง`;
                        }
                    }
                } else {
                    replyText = `💡 วิธีสั่งซื้ออัตโนมัติ\nพิมพ์: สั่งซื้อ [ชื่อสินค้า] [เบอร์โทร]\nเช่น: สั่งซื้อ เสื้อยืด 0812345678`;
                }
            } 
            // 🚀 ฟีเจอร์: บอทถาม-ตอบปกติ (ทำงานคู่กันได้)
            else {
                const snapRules = await get(child(ref(db), 'bot_data/rules'));
                if(snapRules.exists()) {
                    const rules = snapRules.val();
                    for(let key in rules) {
                        if(userMsg.toLowerCase().includes(rules[key].keyword.toLowerCase())) {
                            replyText = rules[key].response;
                            break;
                        }
                    }
                }
            }

            // ตอบกลับ LINE
            await client.replyMessage({
                replyToken: lineEvent.replyToken,
                messages: [{ type: 'text', text: replyText }]
            });
        }
    } catch (err) {
        console.error(err);
    }

    return { statusCode: 200, body: 'OK' };
};
