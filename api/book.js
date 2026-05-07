export const handler = async (event, context) => {
    // 1. เช็ก Method (Netlify ใช้ event.httpMethod)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. ดึงข้อมูลจาก Body (Netlify ต้อง Parse JSON เอง)
        const { userId, name, package: pkg, bookTime } = JSON.parse(event.body);

        // 3. ตั้งค่า Supabase & LINE (ดึงจาก Environment Variables ที่พี่ใส่ใน Netlify)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;
        const lineToken = process.env.LINE_TOKEN;

        // 4. บันทึกข้อมูลลง Supabase
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

        // 5. ส่งข้อความ LINE ยืนยัน
        const message = {
            to: userId,
            messages: [{
                type: "text",
                text: `✅ จองสำเร็จ (ระบบ Netlify)!\n\nคุณ: ${name}\nบริการ: ${pkg}\nเวลา: ${bookTime.replace('T', ' ')}\n\nแล้วเจอกันครับ!`
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

        // 6. ตอบกลับหน้าเว็บ (Netlify ต้อง return object)
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
