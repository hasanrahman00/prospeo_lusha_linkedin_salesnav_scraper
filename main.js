// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 LINKEDIN LEAD EXTRACTOR - MAIN ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file orchestrates all tasks to automate LinkedIn lead extraction
// Each task is in a separate module for easy understanding and updates
//
// ═══════════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────
// 📦 Import Configuration
// ─────────────────────────────────────────────────────────────────

const config = require('./config');


// ─────────────────────────────────────────────────────────────────
// 📦 Import Task Modules
// ─────────────────────────────────────────────────────────────────

const { launchChrome } = require('./tasks/launchChrome');
const { connectToBrowser } = require('./tasks/connectBrowser');
const { navigateToLinkedIn } = require('./tasks/navigateToLinkedIn');
const { activateProspeo } = require('./tasks/activateProspeo');
const { scrollDashboardPage } = require('./tasks/scrollDashboard');
const { waitForCapture } = require('./tasks/waitForCapture');
const { getCurrentPageInfo } = require('./tasks/getPageInfo');
const { goToNextPage } = require('./tasks/navigateNextPage');
const { generateCSV } = require('./tasks/generateCSV');
const { closeBrowser } = require('./tasks/closeBrowser');
const { setupSidePanelTrap } = require('./extractData');


// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 MAIN EXECUTION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

(async () => {
    try {
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('🚀 STARTING LINKEDIN LEAD EXTRACTION');
        console.log('═══════════════════════════════════════════════════════\\n');


        // ─────────────────────────────────────────────────────────────────
        // TASK 1: Launch Chrome Browser
        // ─────────────────────────────────────────────────────────────────
        
        await launchChrome(
            config.CHROME_PATH,
            config.PORT,
            config.USER_DATA_DIR
        );


        // ─────────────────────────────────────────────────────────────────
        // TASK 2: Connect to Browser
        // ─────────────────────────────────────────────────────────────────
        
        const { browser, context } = await connectToBrowser(config.CDP_URL);


        // ─────────────────────────────────────────────────────────────────
        // TASK 3: Setup Data Listener
        // ─────────────────────────────────────────────────────────────────
        
        setupSidePanelTrap(context);


        // ─────────────────────────────────────────────────────────────────
        // TASK 4: Navigate to LinkedIn
        // ─────────────────────────────────────────────────────────────────
        
        const page = await navigateToLinkedIn(context, config.LINKEDIN_SEARCH_URL);


        // ─────────────────────────────────────────────────────────────────
        // TASK 5: Activate Prospeo Extension
        // ─────────────────────────────────────────────────────────────────
        
        await activateProspeo(page, context);


        // ─────────────────────────────────────────────────────────────────
        // TASK 6: Multi-Page Processing Loop
        // ─────────────────────────────────────────────────────────────────
        
        let currentPage = 1;
        let hasNextPage = true;

        while (hasNextPage && currentPage <= config.MAX_PAGES) {
            
            // 📍 Get current page info
            const pageInfo = await getCurrentPageInfo(page);
            console.log(`\\n📄 ─── Processing Page ${pageInfo.pageNumber || currentPage} ───`);

            // 🖱️ Scroll page to load leads
            await scrollDashboardPage(page, config.SCROLL_OPTIONS);

            // ⏰ Wait for data capture
            await waitForCapture(page, 5000);

            // ➡️ Try to navigate to next page
            const nextResult = await goToNextPage(page, currentPage);

            if (!nextResult.success) {
                hasNextPage = false;
                break;
            }

            currentPage = nextResult.pageNumber;

            // 🔍 Verify Prospeo is still active
            console.log('🔍 Verifying Prospeo on new page...');
            const verified = await activateProspeo(page, context);
            
            if (!verified) {
                console.log('⚠️ Retrying Prospeo activation...');
                await page.waitForTimeout(2000);
                await activateProspeo(page, context);
            }

            await page.waitForTimeout(3000);
        }


        // ─────────────────────────────────────────────────────────────────
        // TASK 7: Final Data Processing
        // ─────────────────────────────────────────────────────────────────
        
        console.log(`\\n═══════════════════════════════════════════════════════`);
        console.log(`🏁 Completed ${currentPage} pages!`);
        console.log(`═══════════════════════════════════════════════════════\\n`);

        // ⏰ Final capture wait
        await waitForCapture(page, 5000);

        // 📊 Generate CSV
        await generateCSV();


        // ─────────────────────────────────────────────────────────────────
        // TASK 8: Cleanup
        // ─────────────────────────────────────────────────────────────────
        
        console.log('\\n═══════════════════════════════════════════════════════');
        console.log('✅ EXTRACTION COMPLETED SUCCESSFULLY!');
        console.log('💾 Files: prospeo_leads.jsonl & prospeo_leads.csv');
        console.log('═══════════════════════════════════════════════════════\\n');

        await closeBrowser(browser);
        process.exit(0);

    } catch (error) {
        console.error('\\n❌ ERROR:', error.message);
        console.log('💡 TIP: Close all Chrome windows and try again');
        process.exit(1);
    }
})();
