const fs = require('fs');
const { convertToCSV } = require('./convertToCSV');

async function setupLushaTrap(context, outputFile = 'lusha_leads.jsonl') {
    console.log("🔵 [Hunter] Searching for Lusha Extension...");

    // Wait a bit for Lusha to initialize
    await new Promise(r => setTimeout(r, 2000));

    // Find Lusha iframe
    let lushaFrame;
    const checkForLushaFrame = () => {
        return context.pages().find(p => {
            const url = p.url();
            return url.includes('lusha') || url.includes('LU__extension');
        });
    };

    // Try to find Lusha frame
    for (let i = 0; i < 10; i++) {
        lushaFrame = checkForLushaFrame();
        if (lushaFrame) break;
        await new Promise(r => setTimeout(r, 500));
    }

    if (!lushaFrame) {
        // Try to find iframe in existing pages
        const pages = context.pages();
        for (const page of pages) {
            const frames = page.frames();
            for (const frame of frames) {
                const url = frame.url();
                if (url.includes('lusha') || url.includes('LU__extension')) {
                    lushaFrame = frame;
                    break;
                }
            }
            if (lushaFrame) break;
        }
    }

    if (!lushaFrame) {
        console.log('⚠️ Lusha frame not found - extension may not be active');
        return false;
    }

    console.log(`🎯 [Hunter] LUSHA TARGET LOCKED: ${lushaFrame.url()}`);

    // Listen for Lusha API responses
    // Lusha typically uses their own API endpoints
    lushaFrame.on('response', async (response) => {
        const url = response.url();

        // Target Lusha API endpoints (adjust based on actual endpoints)
        if (url.includes('lusha') && (
            url.includes('/api/') || 
            url.includes('/contact') || 
            url.includes('/person') ||
            url.includes('/enrich')
        )) {
            console.log(`🔵 LUSHA DATA DETECTED!`);
            
            // Non-blocking async write for parallel processing
            (async () => {
                try {
                    const data = await response.json();
                    const line = JSON.stringify(data) + '\n';
                    
                    // Async append for non-blocking writes
                    fs.promises.appendFile(outputFile, line).catch(err => {
                        console.log(`⚠️ Lusha write error: ${err.message}`);
                    });
                    
                    console.log(`💙 Lusha capture successful. Lead details saved.`);
                } catch (e) {
                    console.log(`⚠️ Lusha skip: Response was not JSON or timed out.`);
                }
            })();
        }
    });

    return true;
}

module.exports = { setupLushaTrap };
