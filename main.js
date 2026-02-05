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
const { activateLusha } = require('./tasks/activateLusha');
const { extractLushaContacts, enrichProspeoWithLusha, minimizeLushaSidebar } = require('./tasks/extractLushaContacts');
const { scrollDashboardPage } = require('./tasks/scrollDashboard');
const { waitForCapture } = require('./tasks/waitForCapture');
const { getCurrentPageInfo } = require('./tasks/getPageInfo');
const { goToNextPage } = require('./tasks/navigateNextPage');
const { generateCSV } = require('./tasks/generateCSV');
const { closeBrowser } = require('./tasks/closeBrowser');
const { setupSidePanelTrap } = require('./extractData');
const { setupLushaTrap } = require('./extractLushaData');


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
        // TASK 3: Setup Data Listeners (Parallel Capture)
        // ─────────────────────────────────────────────────────────────────
        
        setupSidePanelTrap(context);  // Prospeo listener
        await setupLushaTrap(context);  // Lusha listener


        // ─────────────────────────────────────────────────────────────────
        // TASK 4: Navigate to LinkedIn
        // ─────────────────────────────────────────────────────────────────
        
        const page = await navigateToLinkedIn(context, config.LINKEDIN_SEARCH_URL);


        // ─────────────────────────────────────────────────────────────────
        // TASK 5: Activate Extensions (Parallel)
        // ─────────────────────────────────────────────────────────────────
        
        // Activate both extensions in parallel for speed
        await Promise.all([
            activateProspeo(page, context),
            activateLusha(page)
        ]);
        
        console.log('✅ Both extensions activated and ready!');


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

            // ⏰ Wait for data capture (optimized)
            await waitForCapture(page, 2000);

            // 🔵 Extract Lusha contacts from sidebar (parallel - no extra wait)
            const lushaPromise = extractLushaContacts(page, { maxCards: 25, debug: true });
            
            // 📊 Generate CSV after every page (Prospeo data first)
            await generateCSV();
            
            // Wait for Lusha extraction to complete & minimize
            await lushaPromise;
            await minimizeLushaSidebar(page);
            
            // 🔵 Enrich Prospeo data with Lusha domains (after Prospeo CSV is done)
            await enrichProspeoWithLusha('lusha_contacts.jsonl', 'prospeo_leads.jsonl', true);
            
            // 📊 Regenerate CSV with enriched data
            await generateCSV();

            // ➡️ Try to navigate to next page
            const nextResult = await goToNextPage(page, currentPage);

            if (!nextResult.success) {
                hasNextPage = false;
                break;
            }

            currentPage = nextResult.pageNumber;

            // 🔍 Quick check both extensions on new page (parallel)
            await Promise.all([
                activateProspeo(page, context),
                activateLusha(page)
            ]);
        }


        // ─────────────────────────────────────────────────────────────────
        // TASK 7: Final Data Processing
        // ─────────────────────────────────────────────────────────────────
        
        console.log(`\\n═══════════════════════════════════════════════════════`);
        console.log(`🏁 Completed ${currentPage} pages!`);
        console.log(`═══════════════════════════════════════════════════════\\n`);

        // ⏰ Final capture wait (optimized)
        await waitForCapture(page, 2000);

        // 📊 Generate CSV
        await generateCSV();


        // ─────────────────────────────────────────────────────────────────
        // TASK 8: Cleanup
        // ─────────────────────────────────────────────────────────────────
        
        console.log('\\n═══════════════════════════════════════════════════════');
        console.log('✅ EXTRACTION COMPLETED SUCCESSFULLY!');
        console.log('💾 Files: prospeo_leads.jsonl & prospeo_leads.csv');
        console.log('💾 Files: lusha_leads.jsonl (Lusha data)');
        console.log('🌐 Chrome will remain open for your use');
        console.log('═══════════════════════════════════════════════════════\\n');

        // Don't close browser - let user keep working in Chrome
        // await closeBrowser(browser);
        process.exit(0);

    } catch (error) {
        console.error('\\n❌ ERROR:', error.message);
        console.log('💡 TIP: Close all Chrome windows and try again');
        process.exit(1);
    }
})();
