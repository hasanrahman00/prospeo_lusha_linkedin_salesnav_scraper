// ═════════════════════════════════════════════════════════════════
// 🎯 TASK: Activate Prospeo Extension
// ═════════════════════════════════════════════════════════════════
// Purpose: Ensure Prospeo sidebar is open and ready for data capture
// No external dependencies - all logic self-contained
// ═════════════════════════════════════════════════════════════════

// 🔧 Helper: Check if sidebar is visible in DOM
async function checkSidebarOpen(page) {
    return page.evaluate(() => {
        const sidebarSelectors = [
            'iframe[src*="prospeo"]',
            'div[id*="prospeo-sidebar"]',
            'div[class*="prospeo-sidebar"]',
            'aside[id*="prospeo"]',
            'div[data-prospeo-sidebar]'
        ];
        
        for (const selector of sidebarSelectors) {
            const el = document.querySelector(selector);
            if (el && el.offsetParent !== null) {
                return true;
            }
        }
        return false;
    });
}

async function activateProspeo(page, context) {
    
    console.log('🤖 Activating Prospeo extension...');
    
    // ⏰ Give Prospeo time to initialize
    await page.waitForTimeout(3000);
    
    const BUTTON_SELECTOR = '#prospeo-trigger';
    console.log(`👆 Checking Prospeo sidebar state...`);

    try {
        // ✅ Check #1: Look for sidepanel extension page
        const sidePanelPage = context?.pages().find(p => p.url().includes('sidepanel.html'));
        if (sidePanelPage) {
            console.log("✅ Prospeo sidebar confirmed open (side panel detected)");
            return true;
        }

        // ✅ Check #2: Look for sidebar DOM elements
        const isSidebarVisible = await checkSidebarOpen(page);
        if (isSidebarVisible) {
            console.log("✅ Prospeo sidebar already visible in page");
            return true;
        }

        // 🔍 Sidebar not open - look for trigger button
        console.log("🔍 Sidebar not open, looking for trigger button...");
        
        const buttonExists = await page.locator(BUTTON_SELECTOR).count() > 0;
        if (!buttonExists) {
            console.log("⚠️ Prospeo button not found - may need manual activation");
            return false;
        }

        // ⏳ Wait for button to be visible and clickable
        await page.waitForSelector(BUTTON_SELECTOR, { state: 'visible', timeout: 5000 });
        
        // 🖱️ Click the trigger button
        await page.click(BUTTON_SELECTOR);
        console.log("✅ Clicked Prospeo trigger button");
        
        // ⏳ Wait for sidebar to appear (verify with sidepanel page)
        console.log("⏳ Waiting for sidebar to open...");
        let attempts = 0;
        let sidebarOpened = false;
        
        while (attempts < 10 && !sidebarOpened) {
            await page.waitForTimeout(500);
            const panelPage = context?.pages().find(p => p.url().includes('sidepanel.html'));
            if (panelPage) {
                sidebarOpened = true;
                console.log("✅ Sidebar confirmed open!");
                break;
            }
            attempts++;
        }
        
        if (!sidebarOpened) {
            console.log("⚠️ Sidebar may not have opened properly");
            return false;
        }
        
        // 💤 Extra wait for sidebar to stabilize
        await page.waitForTimeout(2000);
        console.log('✅ Prospeo activated successfully');
        return true;
        
    } catch (error) {
        console.log(`⚠️ Error activating Prospeo: ${error.message}`);
        return false;
    }
}

module.exports = { activateProspeo };
