const express = require('express');
const router = express.Router();

const db = require('../config/db');
const sendMorProm = require('../utils/morpromNotify'); // เพิ่มบรรทัดนี้





router.get('/send-drug-alert', async (req, res) => {

  const [rows] = await db.query(`
    SELECT
        op.vn,
        p.hn,
        CONCAT(p.pname,p.fname,' ',p.lname) AS ptname,
        TIMESTAMPDIFF(YEAR,p.birthday,CURDATE()) AS age,
        op.icode,
        d.name AS drug_name,
        op.qty,
        op.rxdate,
        op.rxtime
    FROM opitemrece op
    LEFT JOIN patient p ON p.hn = op.hn
    LEFT JOIN drugitems d ON d.icode = op.icode
    WHERE op.icode IN (
        '1900532','1900619','1660064','1530010',
        '1901173','1901174','1900327','1900330'
    )
    AND op.rxdate = CURDATE()
  `);

  console.log(`📦 Found ${rows.length} records`);

  for (const row of rows) {

    // 🔥 KEY กันซ้ำ (สำคัญที่สุด)
    const alertKey = `${row.hn}_${row.icode}_${row.rxdate}`;

    // 🔍 check duplicate
    const [exist] = await db.query(
      `SELECT 1 FROM drug_alert_log WHERE alert_key=? LIMIT 1`,
      [alertKey]
    );

    if (exist.length > 0) {
      console.log(`⏭️ Skip duplicate ${alertKey}`);
      continue;
    }

    const thaiDate = new Date(row.rxdate).toLocaleDateString(
      'th-TH',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Bangkok'
      }
    );

    const message = `
💊 แจ้งเตือนผู้ได้รับยาเฝ้าระวัง

🆔 HN : ${row.hn}
👤 ชื่อ : ${row.ptname}
🎂 อายุ : ${row.age} ปี

💉 ยา : ${row.drug_name}
📦 จำนวน : ${row.qty}

📅 วันที่ : ${thaiDate}
🕒 เวลา : ${row.rxtime}
`;

    const result = await sendMorProm(message);

    if (result) {

      console.log(`✅ SENT HN:${row.hn} DRUG:${row.drug_name}`);

      await db.query(
        `INSERT IGNORE INTO drug_alert_log
         (alert_key, hn, icode)
         VALUES (?,?,?)`,
        [alertKey, row.hn, row.icode]
      );

    } else {

      console.log(`❌ FAILED HN:${row.hn}`);

    }
  }

  res.json({
    ok: true,
    total: rows.length
  });
});

module.exports = router;