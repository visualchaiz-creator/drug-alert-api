require('dotenv').config();

const express = require('express');
const cron = require('node-cron');
const axios = require('axios'); //insert
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


// app.use('/api/send-drug-alert',
//   require('./routes/send-drug-alert')

// );
 const sendMorProm = require('./utils/morpromNotify'); // เพิ่มบรรทัดนี้
// //app.use('/api', require('./routes/test-drug-alert'));
 app.use('/api',require('./routes/send-drug-alert'))

// // รันทุก 1 นาที
// cron.schedule('* * * * *', async () => {

//     try {

//         console.log('⏰ Cron Running Drug Alert:', new Date().toLocaleString('th-TH'));

//         const res = await axios.get(
//             'http://localhost:3010/api/send-drug-alert'
//         );

//         console.log('✅ Cron Done');

//     } catch (err) {

//         console.error('❌ Cron Error:', err.message);
//     }

// });

let running = false;

cron.schedule('* * * * *', async () => {

  if (running) {
    console.log('⛔ Skip (still running)');
    return;
  }

  running = true;

  try {

    console.log('⏰ Drug Alert Cron Running...');

    await axios.get('http://localhost:3010/api/send-drug-alert');

  } catch (err) {

    console.error('Cron Error:', err.message);

  } finally {

    running = false;
  }

});

app.listen(process.env.PORT, () => {

  console.log(
    `Server Running Port ${process.env.PORT}`
  );

});