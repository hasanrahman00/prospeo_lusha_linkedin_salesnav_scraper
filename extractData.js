const fs = require('fs');
const { convertToCSV } = require('./convertToCSV');

async function setupSidePanelTrap(context, outputFile = 'prospeo_leads.jsonl') {
    console.log("🦅 [Hunter] Searching for Prospeo Side Panel...");

    // Wait until the sidepanel.html page appears in the context
    let sidePanelPage;
    while (!sidePanelPage) {
        sidePanelPage = context.pages().find(p => p.url().includes('sidepanel.html'));
        if (!sidePanelPage) await new Promise(r => setTimeout(r, 500));
    }

    console.log(`🎯 [Hunter] TARGET LOCKED: ${sidePanelPage.url()}`);

    // High-level "Passive" listener. 
    // This is safer than raw CDP because Playwright handles body decoding for you.
    sidePanelPage.on('response', async (response) => {
        const url = response.url();

        // Target the specific enrichment endpoint
        if (url.includes('people-view') && url.includes('prospeo')) {
            console.log(`🔥 LEAD DATA DETECTED!`);
            
            try {
                // Playwright automatically waits for the body to finish loading
                const data = await response.json();
                const line = JSON.stringify(data) + '\n';
                fs.appendFileSync(outputFile, line);
                
                console.log(`💰 Capture successful. Lead details saved.`);
                
                // Generate CSV immediately after capture
                console.log(`📊 Generating CSV...`);
                await convertToCSV(outputFile, 'prospeo_leads.csv');
            } catch (e) {
                console.log(`⚠️ Skip: Response was not JSON or timed out.`);
            }
        }
    });
}

module.exports = { setupSidePanelTrap };