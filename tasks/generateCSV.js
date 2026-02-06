// ═════════════════════════════════════════════════════════════════
// 📊 TASK: Generate CSV File
// ═════════════════════════════════════════════════════════════════
// Purpose: Convert captured JSONL data to CSV format
// ═════════════════════════════════════════════════════════════════

const { convertToCSV } = require('../convertToCSV');

async function generateCSV() {
    console.log('📊 Generating CSV file...');
    
    // 📄 Convert JSONL to CSV
    await convertToCSV('prospeo_leads.jsonl', 'leads.csv');
    
    console.log('✅ CSV file generated successfully');
}

module.exports = { generateCSV };
