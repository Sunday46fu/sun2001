const line = require('@line/bot-sdk');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, child } = require('firebase/database');

// --- Firebase Config ---
const firebaseConfig = {
    apiKey: "AIzaSyAWUWpDnF5Yt7QQ0ULvsxSVJhV0ckGMfu8",
    databaseURL: "https://chatcharin-af5e4-default-rtdb.firebaseio.com",
    projectId: "chatcharin-af5e4",
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
    const body = JSON.parse(event.body);
    const lineEvent = body.events[0];

    if (lineEvent && lineEvent.type === 'message' && lineEvent.message.type === 'text') {
        const msg = lineEvent.message.text.trim();
        const replyToken = lineEvent.replyToken;

        // --- 1. คำทักทาย (คุยเป็นคน) ---
        if (['สวัสดี', 'หวัดดี', 'hi', 'hello', 'เริ่ม'].some(k => msg.toLowerCase().includes(k))) {
            return await replyText(replyToken, "สวัสดีครับผม! ยินดีต้อนรับสู่ Super Store 🚀\n\nอยากดูสินค้าตัวไหน พิมพ์ 'ดูสินค้า' ได้เลยนะครับ หรือถ้าอยากปรึกษาเรื่องไหนถามทิ้งไว้ได้เลย แอดมินจะรีบวิ่งมาตอบครับ!");
        }

        // --- 2. ส่งแคตตาล็อก (Flex Carousel) ---
        if (msg.includes('ดูสินค้า') || msg.includes('มีอะไรบ้าง')) {
            const snap = await get(ref(db, 'store_data/products'));
            if (!snap.exists()) return replyText(replyToken, "ตอนนี้ของเกลี้ยงคลังเลยครับ เดี๋ยวมาเติมให้น้าา~");

            const products = snap.val();
            const bubbles = Object.entries(products).slice(0, 10).map(([id, p]) => ({
                "type": "bubble",
                "size": "kilo",
                "hero": {
                    "type": "image",
                    "url": p.image,
                    "size": "full",
                    "aspectRatio": "20:13",
                    "aspectMode": "cover"
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        { "type": "text", "text": p.name, "weight": "bold", "size": "xl" },
                        { "type": "box", "layout": "baseline", "contents": [
                            { "type": "text", "text": `฿${p.price.toLocaleString()}`, "weight": "bold", "size": "xl", "color": "#1DB446" },
                            { "type": "text", "text": p.stock > 0 ? `คงเหลือ ${p.stock} ชิ้น` : "สินค้าหมด", "size": "xs", "color": "#aaaaaa", "margin": "md" }
                        ], "margin": "md" }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "button",
                            "action": { "type": "message", "label": "จองชิ้นนี้", "text": `สั่งซื้อ ${p.name} เบอร์โทร:` },
                            "style": "primary", "color": p.stock > 0 ? "#1DB446" : "#cccccc"
                        }
                    ]
                }
            }));

            return await client.replyMessage({
                replyToken: replyToken,
                messages: [{
                    "type": "flex", "altText": "เลือกดูสินค้าได้เลยจ้า",
                    "contents": { "type": "carousel", "contents": bubbles }
                }]
            });
        }

        // --- 3. ระบบสั่งซื้อ (Auto-Order & Stock Deduction) ---
        if (msg.startsWith('สั่งซื้อ')) {
            const parts = msg.split(' ');
            const prodName = parts[1];
            const phone = parts[2]?.replace('เบอร์โทร:', '');

            if (!phone || phone.length < 9) {
                return await replyText(replyToken, "รับทราบครับ! รบกวนขอ 'เบอร์โทรศัพท์' หน่อยนะครับ บอทจะได้จดออเดอร์ถูกครับ (เช่น สั่งซื้อ เสื้อ 081234xxxx)");
            }

            const snap = await get(ref(db, 'store_data/products'));
            const products = snap.val();
            const productKey = Object.keys(products).find(k => products[k].name === prodName);
            const product = products[productKey];

            if (!product || product.stock <= 0) {
                return await replyText(replyToken, `โอ๊ะ! ขอโทษด้วยนะครับ ${prodName} ตอนนี้ของหมดเกลี้ยงเลย เดี๋ยวของมาแล้วผมทักบอกนะ!`);
            }

            // ตัดสต๊อกและจดออเดอร์
            const newStock = product.stock - 1;
            await set(ref(db, `store_data/products/${productKey}/stock`), newStock);
            
            const orderId = 'ORD' + Date.now();
            await set(ref(db, `store_data/orders/${orderId}`), {
                customer: lineEvent.source.userId,
                product: prodName,
                phone: phone,
                price: product.price,
                status: 'รอชำระเงิน',
                time: new Date().toISOString()
            });

            return await client.replyMessage({
                replyToken: replyToken,
                messages: [
                    { "type": "text", "text": `เรียบร้อยครับ! ผมจอง ${prodName} ให้แล้ว\nเลขที่คำสั่งซื้อ: ${orderId}\nยอดชำระ: ฿${product.price.toLocaleString()}` },
                    { "type": "text", "text": "เดี๋ยวแอดมินตัวจริงจะทักไปแจ้งเลขบัญชีและช่องทางชำระเงินให้นะครับ ขอบคุณมากครับ! 🙏✨" }
                ]
            });
        }
    }
    return { statusCode: 200, body: 'OK' };
};

async function replyText(token, text) {
    await client.replyMessage({ replyToken: token, messages: [{ type: 'text', text }] });
}
