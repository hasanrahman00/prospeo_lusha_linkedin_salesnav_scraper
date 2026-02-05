// ═════════════════════════════════════════════════════════════════
// ⏳ TASK: Wait for Data Capture
// ═════════════════════════════════════════════════════════════════
// Purpose: Give Prospeo time to capture and send data
// ═════════════════════════════════════════════════════════════════

async function waitForCapture(page, waitTimeMs = 2000) {
    console.log(`⏳ Waiting ${waitTimeMs}ms for Prospeo to capture data...`);
    
    await page.waitForTimeout(waitTimeMs);
    
    console.log('✅ Capture wait complete');
}

module.exports = { waitForCapture };
