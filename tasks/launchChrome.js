// ═════════════════════════════════════════════════════════════════
// 🚀 TASK: Launch Chrome with Debugging
// ═════════════════════════════════════════════════════════════════
// Purpose: Start Chrome with remote debugging enabled
// ═════════════════════════════════════════════════════════════════

const { spawn } = require('child_process');

async function launchChrome(chromePath, port, userDataDir) {
    console.log('🚀 Launching Chrome with debugging...');
    
    // 🔧 Spawn Chrome process with debugging flags
    const chromeProcess = spawn(chromePath, [
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${userDataDir}`
    ], {
        detached: true,
        stdio: 'ignore'
    });
    
    chromeProcess.unref();
    
    console.log(`✅ Chrome launched on port ${port}`);
    
    // ⏰ Wait for Chrome to start up
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return chromeProcess;
}

module.exports = { launchChrome };
