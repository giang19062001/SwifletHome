const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  // 1. Read userCodes from clear.md
  const markdownPath = 'C:/WORKING/FREELANCER/YEN/clear.md';
  if (!fs.existsSync(markdownPath)) {
    console.error('File clear.md not found!');
    return;
  }
  const content = fs.readFileSync(markdownPath, 'utf8');
  const userCodeMatches = content.match(/USR\d+/g);
  
  if (!userCodeMatches || userCodeMatches.length === 0) {
    console.log('No userCode found in clear.md.');
    return;
  }

  // Deduplicate
  const userCodes = [...new Set(userCodeMatches)];
  console.log(`Found ${userCodes.length} userCodes to delete:`, userCodes);

  // 2. Connect to Database
  const connection = await mysql.createConnection({
    // host: 'localhost',
    // port: 3306,
    // user: 'root',
    // password: '123456',
    // database: 'swiftlet'
        host: '103.77.160.68',
    port: 3306,
    user: 'dev',
    password: 'asdf',
    database: 'swiftlet'
  });

  const placeholders = userCodes.map(() => '?').join(',');

  try {
    await connection.beginTransaction();

    console.log('--- STARTING CASCADED DELETIONS ---');

    // Helper for IN queries avoiding empty arrays
    const deleteIn = async (table, column, values) => {
      if (!values || values.length === 0) return;
      const ph = values.map(() => '?').join(',');
      const [res] = await connection.execute(`DELETE FROM ${table} WHERE ${column} IN (${ph})`, values);
      if (res.affectedRows > 0) console.log(`Deleted ${res.affectedRows} from ${table}`);
    };

    // 0. Fetch userPhones before deleting users
    const [phoneRows1] = await connection.execute(`SELECT userPhone FROM tbl_user_app WHERE userCode IN (${placeholders})`, userCodes);
    const [phoneRows2] = await connection.execute(`SELECT userPhone FROM tbl_user_app_delete WHERE userCode IN (${placeholders})`, userCodes);
    const userPhones = [...new Set([...phoneRows1.map(r => r.userPhone), ...phoneRows2.map(r => r.userPhone)].filter(Boolean))];

    // H. OTP BRANCH
    await deleteIn('tbl_otp', 'userPhone', userPhones);

    // A. TEAM BRANCH
    const [teamRows] = await connection.execute(`SELECT seq, teamCode FROM tbl_team_user WHERE userCode IN (${placeholders})`, userCodes);
    const teamSeqs = teamRows.map(r => r.seq);
    const teamCodes = teamRows.map(r => r.teamCode).filter(Boolean);

    let seqServices = [];
    let reviewSeqs = [];

    if (teamSeqs.length > 0) {
      const phTeamSeqs = teamSeqs.map(() => '?').join(',');
      const [serviceRows] = await connection.execute(`SELECT seq FROM tbl_team_service WHERE seqTeam IN (${phTeamSeqs})`, teamSeqs);
      seqServices = serviceRows.map(r => r.seq);
    }

    if (teamCodes.length > 0) {
      const phTeamCodes = teamCodes.map(() => '?').join(',');
      const [reviewRows] = await connection.execute(`SELECT seq FROM tbl_team_review WHERE teamCode IN (${phTeamCodes})`, teamCodes);
      reviewSeqs = reviewRows.map(r => r.seq);
    }

    await deleteIn('tbl_team_service_file', 'seqService', seqServices);
    await deleteIn('tbl_team_review_img', 'reviewSeq', reviewSeqs);
    await deleteIn('tbl_team_review', 'teamCode', teamCodes);
    await deleteIn('tbl_team_service', 'seqTeam', teamSeqs);
    await deleteIn('tbl_team_img', 'teamSeq', teamSeqs);
    await deleteIn('tbl_team_user', 'userCode', userCodes);

    // B. HOME BRANCH
    const [homeRows] = await connection.execute(`SELECT seq, userHomeCode FROM tbl_user_home WHERE userCode IN (${placeholders})`, userCodes);
    const homeSeqs = homeRows.map(r => r.seq);
    const homeCodes = homeRows.map(r => r.userHomeCode).filter(Boolean);

    await deleteIn('tbl_home_sale_sightseeing', 'userCode', userCodes);
    await deleteIn('tbl_user_home_sensor', 'userHomeCode', homeCodes);
    await deleteIn('tbl_user_home_img', 'userHomeSeq', homeSeqs);
    await deleteIn('tbl_user_home', 'userCode', userCodes);

    // C. QR REQUEST BRANCH
    const [qrRows] = await connection.execute(`SELECT seq FROM tbl_qr_request WHERE userCode IN (${placeholders})`, userCodes);
    const qrSeqs = qrRows.map(r => r.seq);
    await deleteIn('tbl_qr_request_file', 'qrRequestSeq', qrSeqs);
    await deleteIn('tbl_qr_request_blockchain', 'userCode', userCodes);
    await deleteIn('tbl_qr_request_selling', 'userCode', userCodes);
    await deleteIn('tbl_qr_request_selling_interact', 'userCode', userCodes);
    await deleteIn('tbl_qr_request', 'userCode', userCodes);

    // D. DOCTOR BRANCH
    await deleteIn('tbl_doctor_file', 'userCode', userCodes); // tbl_doctor_file has userCode
    await deleteIn('tbl_doctor', 'userCode', userCodes);

    // E. CONSIGNMENT BRANCH
    const [consignmentRows] = await connection.execute(`SELECT consignmentCode FROM tbl_consignment WHERE userCode IN (${placeholders})`, userCodes);
    const consignmentCodes = consignmentRows.map(r => r.consignmentCode).filter(Boolean);
    await deleteIn('tbl_consignment_delivering', 'consignmentCode', consignmentCodes);
    await deleteIn('tbl_consignment_history', 'consignmentCode', consignmentCodes);
    await deleteIn('tbl_consignment', 'userCode', userCodes);

    // F. NOTIFICATION BRANCH
    // !! Clear all records from notification tables
    // await connection.execute(`DELETE FROM tbl_notifications_user`);
    // console.log(`Cleared all records from tbl_notifications_user`);
    // await connection.execute(`DELETE FROM tbl_notifications`);
    // console.log(`Cleared all records from tbl_notifications`);
    // await connection.execute(`DELETE FROM tbl_team_review`);
    // console.log(`Cleared all records from tbl_team_review`);
    // await connection.execute(`DELETE FROM tbl_team_review_img`);
    // console.log(`Cleared all records from tbl_team_review_img`);
    // G. OTHERS (Directly with userCode)
    const directTables = [
      'tbl_todo_task_alarm',
      'tbl_todo_task_harvest',
      'tbl_todo_task_harvest_phase',
      'tbl_todo_task_medicine',
      'tbl_notification_user_topics',
      'tbl_user_package',
      'tbl_user_package_history',
      'tbl_user_type_live',
      'tbl_user_app_delete'
    ];

    for (let tbl of directTables) {
      await deleteIn(tbl, 'userCode', userCodes);
    }

    // tbl_checkout uses app_user_id instead of userCode
    await deleteIn('tbl_checkout', 'app_user_id', userCodes);

    // FINAL: Main User Table
    await deleteIn('tbl_user_app', 'userCode', userCodes);

    console.log('--- ALL DONE ---');
    await connection.commit();
    console.log('Transaction committed successfully.');
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed and rolled back!', error);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
