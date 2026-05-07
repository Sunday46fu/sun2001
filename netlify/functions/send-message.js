const axios = require('axios');

exports.handler = async (event) => {
  const { userId, message } = JSON.parse(event.body);
  const LINE_TOKEN = "LQNwHAxoHm4bMDXxl8qqDD0NnOdfjztKFDulaY2ExHn3bTQSr/A8jujYjHVM4XDpWwB/zN43ATmJSU8ne+vj+RqMTb1iq0qy94ldu60t/Cljv3D4FstkthEcbS0aSASwJxzOlBSW7VZEbQ78kPvGQQdB04t89/1O/w1cDnyilFU=

"; 

  try {
    await axios.post('https://api.line.me/v2/bot/message/push', {
      to: userId,
      messages: [{ type: 'text', text: message }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_TOKEN}`
      }
    });

    return { statusCode: 200, body: "Success" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
