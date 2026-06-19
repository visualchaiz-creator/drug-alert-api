const axios = require('axios');
require('dotenv').config();

async function sendMorProm(message) {

  try {

    const payload = {
      datas: [process.env.MORPROM_GROUP_ID],
      messages: [
        {
          type: "text",
          text: message
        }
      ]
    };

    const response = await axios.post(
      'https://morpromt2f.moph.go.th/api/notify/send',
      payload,
      {
        headers: {
          'client-key': process.env.MORPROM_CLIENT_KEY,
          'secret-key': process.env.MORPROM_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.status === 200;

  } catch (err) {
    console.error('MorProm Error:', err.response?.data || err.message);
    return false;
  }
}

module.exports = sendMorProm;