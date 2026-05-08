const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const userId = body.userId;
    const message = body.message;

    const LINE_TOKEN = "G2tV047Ye/9jN50ooyrY6QhRCXip8f0/WzaV965OuzbxAXvRzLJQOyurIKf8wYdBWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cl/1Pf4r54/0GZriA9ZRZ1RQpwuxwHX5mAUYqvbXKDMIwdB04t89/1O/w1cDnyilFU=";

    const result = await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: [{ type: 'text', text: message }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + LINE_TOKEN
        }
      }
    );

    console.log("SUCCESS", result.data);
    return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };

  } catch (err) {
    console.log("ERROR", err.response?.status, JSON.stringify(err.response?.data));
    return {
      statusCode: 500,
      body: JSON.stringify({ error: JSON.stringify(err.response?.data) })
    };
  }
};