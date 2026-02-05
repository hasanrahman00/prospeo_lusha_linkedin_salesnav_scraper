// ═════════════════════════════════════════════════════════════════
// 🔒 TASK: Close Browser Connection
// ═════════════════════════════════════════════════════════════════
// Purpose: Gracefully disconnect from Chrome
// ═════════════════════════════════════════════════════════════════

async function closeBrowser(browser) {
    console.log('🔒 Closing browser connection...');
    
    // 🔌 Disconnect (doesn't kill Chrome, just ends automation)
    await browser.close();
    
    console.log('✅ Disconnected from Chrome');
}

module.exports = { closeBrowser };
