export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { userId, name, package: pkg, bookTime } = req.body;

    // 1. บันทึกข้อมูลลงฐานข้อมูล Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    await fetch(`${supabaseUrl}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            user_id: userId,
            name: name,
            package: pkg,
            book_time: bookTime
        })
    });

    // 2. ส่งข้อความ LINE ยืนยันการจอง
    const lineToken = process.env.LINE_TOKEN;
    const message = {
        to: userId,
        messages: [{
            type: "text",
            text: `✅ ยืนยันการจองสำเร็จ!\n\nคุณ: ${name}\nบริการ: ${pkg}\nเวลา: ${bookTime.replace('T', ' ')}\n\nระบบจะแจ้งเตือนคุณอีกครั้งเมื่อใกล้ถึงเวลาครับ`
        }]
    };

    await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lineToken}`
        },
        body: JSON.stringify(message)
    });

    res.status(200).json({ success: true });
}
