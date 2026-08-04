const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

// Function to load and parse .env.local manually
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  const envConfig = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        // Remove surrounding quotes if any
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        envConfig[key] = val;
      }
    });
  }
  return envConfig;
}

// Allowed enum values for fieldType
const VALID_FIELD_TYPES = [
  'text',
  'textarea',
  'number',
  'email',
  'phone',
  'date',
  'datetime',
  'select',
  'radio',
  'checkbox',
  'file_single',
  'file_multiple'
];

async function run() {
  const env = loadEnv();
  
  // Database configuration with fallback defaults
  const dbConfig = {
    host: env.DB_HOST || '127.0.0.1',
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || '123456',
    database: env.DB_NAME || 'swiftlet',
  };

  console.log(`Connecting to database: ${dbConfig.host}:${dbConfig.port}, DB: ${dbConfig.database}...`);
  const connection = await mysql.createConnection(dbConfig);
  console.log('Connected to MySQL successfully.');

  try {
    const excelPath = path.join(__dirname, 'tracebility-form-generate.xlsx');
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Excel file not found at: ${excelPath}`);
    }

    const workbook = xlsx.readFile(excelPath);
    console.log(`Found ${workbook.SheetNames.length} sheet(s) in Excel:`, workbook.SheetNames);

    // Start database transaction
    await connection.beginTransaction();
    console.log('Database transaction started.');

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n----------------------------------------`);
      console.log(`Processing sheet: "${sheetName}"`);

      // Find matching form in DB by formKey (which is the sheetName)
      const [forms] = await connection.execute(
        `SELECT seq FROM tbl_traceability_forms WHERE formKey = ? LIMIT 1`,
        [sheetName]
      );

      if (forms.length === 0) {
        console.log(`Warning: Sheet name "${sheetName}" does not match any formKey in tbl_traceability_forms. Skipping this sheet.`);
        continue;
      }

      const formSeq = forms[0].seq;
      console.log(`Found matching form seq: ${formSeq} for sheet: "${sheetName}"`);

      const sheet = workbook.Sheets[sheetName];
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Filter out the header row if present, and empty rows
      const rows = rawRows.filter((row, idx) => {
        if (idx === 0) return false; // skip header row
        // We check if row is valid (must have a groupKey at index 0)
        return row && row[0] !== undefined && String(row[0]).trim() !== '' && String(row[0]).trim().toLowerCase() !== 'groupkey';
      });

      console.log(`Read ${rows.length} valid rows from sheet "${sheetName}".`);

      for (const row of rows) {
        const groupKey = row[0] !== undefined ? String(row[0]).trim() : '';
        const groupName = row[1] !== undefined ? String(row[1]).trim() : '';
        const groupSortOrderVal = row[2] !== undefined ? String(row[2]).trim() : '';
        const fieldKey = row[3] !== undefined ? String(row[3]).trim() : '';
        const fieldName = row[4] !== undefined ? String(row[4]).trim() : '';
        const fieldType = row[5] !== undefined ? String(row[5]).trim() : '';
        const fieldSortOrderVal = row[6] !== undefined ? String(row[6]).trim() : '';
        const isRequired = row[7] !== undefined ? String(row[7]).trim() : 'N';
        const configRaw = row[8] !== undefined ? String(row[8]).trim() : '';

        const groupSortOrder = parseInt(groupSortOrderVal, 10) || 0;
        const fieldSortOrder = parseInt(fieldSortOrderVal, 10) || 0;

        // Smart parse config JSON helper
        let configObj = null;
        if (configRaw) {
          let cleanConfig = configRaw;
          // If it starts with "options" instead of {"options", wrap it with curly braces
          if (!cleanConfig.startsWith('{')) {
            cleanConfig = `{${cleanConfig}}`;
          }
          try {
            configObj = JSON.parse(cleanConfig);
          } catch (e) {
            console.warn(`Warning: Could not parse config for field "${fieldKey}" in group "${groupKey}". Attempting fallback. Error: ${e.message}`);
            configObj = null;
          }
        }

        // Normalize fieldType and use smart fallback if missing
        let finalFieldType = fieldType.toLowerCase();
        if (!finalFieldType) {
          if (configRaw && configRaw.includes('options')) {
            finalFieldType = 'select';
          } else {
            finalFieldType = 'text';
          }
        }

        if (!VALID_FIELD_TYPES.includes(finalFieldType)) {
          console.warn(`Warning: Invalid fieldType "${finalFieldType}" for field "${fieldKey}". Defaulting to "text".`);
          finalFieldType = 'text';
        }

        // Normalize isRequired to 'Y' or 'N'
        const normalizedIsRequired = (isRequired === 'Y' || isRequired === 'y' || isRequired === 'true' || isRequired === '1') ? 'Y' : 'N';

        let groupSeq = null;
        if (groupKey) {
          // Step 2: Upsert group
          const [groups] = await connection.execute(
            `SELECT seq FROM tbl_traceability_forms_groups WHERE formSeq = ? AND groupKey = ? LIMIT 1`,
            [formSeq, groupKey]
          );

          if (groups.length > 0) {
            groupSeq = groups[0].seq;
            await connection.execute(
              `UPDATE tbl_traceability_forms_groups 
               SET groupName = ?, sortOrder = ?, isActive = 'Y', updatedAt = NOW(), updatedId = 'SYSTEM' 
               WHERE seq = ?`,
              [groupName, groupSortOrder, groupSeq]
            );
          } else {
            const [insertResult] = await connection.execute(
              `INSERT INTO tbl_traceability_forms_groups (formSeq, groupKey, groupName, sortOrder, isActive, createdId) 
               VALUES (?, ?, ?, ?, 'Y', 'SYSTEM')`,
              [formSeq, groupKey, groupName, groupSortOrder]
            );
            groupSeq = insertResult.insertId;
          }
        }

        if (fieldKey && groupSeq) {
          // Step 3: Upsert field
          const [fields] = await connection.execute(
            `SELECT seq FROM tbl_traceability_forms_fields WHERE formSeq = ? AND groupSeq = ? AND fieldKey = ? LIMIT 1`,
            [formSeq, groupSeq, fieldKey]
          );

          if (fields.length > 0) {
            const fieldSeq = fields[0].seq;
            await connection.execute(
              `UPDATE tbl_traceability_forms_fields 
               SET fieldName = ?, fieldType = ?, isRequired = ?, sortOrder = ?, config = CAST(? AS JSON), isActive = 'Y', updatedAt = NOW(), updatedId = 'SYSTEM' 
               WHERE seq = ?`,
              [
                fieldName,
                finalFieldType,
                normalizedIsRequired,
                fieldSortOrder,
                configObj ? JSON.stringify(configObj) : null,
                fieldSeq
              ]
            );
          } else {
            await connection.execute(
              `INSERT INTO tbl_traceability_forms_fields (formSeq, groupSeq, fieldKey, fieldName, fieldType, isRequired, sortOrder, config, isActive, createdId) 
               VALUES (?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON), 'Y', 'SYSTEM')`,
              [
                formSeq,
                groupSeq,
                fieldKey,
                fieldName,
                finalFieldType,
                normalizedIsRequired,
                fieldSortOrder,
                configObj ? JSON.stringify(configObj) : null
              ]
            );
          }
        }
      }
    }

    // Commit all changes
    await connection.commit();
    console.log('Transaction committed successfully.');
    console.log('Successfully completed inserting/updating all data from Excel sheets.');

  } catch (error) {
    console.error('Error occurred, rolling back database changes...');
    try {
      await connection.rollback();
      console.log('Transaction rolled back successfully.');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    console.error('An error occurred during data generation:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

run();
