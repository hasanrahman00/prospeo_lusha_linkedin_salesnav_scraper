// ═════════════════════════════════════════════════════════════════
// 🎯 TASK: Activate Lusha Extension
// ═════════════════════════════════════════════════════════════════
// Purpose: Open Lusha sidebar for parallel data capture
// ═════════════════════════════════════════════════════════════════

async function activateLusha(page) {
    console.log('🔵 Activating Lusha extension...');
    
    try {
        // Wait a bit for page to stabilize
        await page.waitForTimeout(1000);
        
        // Lusha badge selectors (it's a div, not a button)
        const lushaSelectors = [
            '#LU__extension_badge_main',
            '#LU__extension_badge_wrapper',
            'div[id="LU__extension_badge_main"]',
            '[id*="LU__extension_badge"]'
        ];
        
        let clicked = false;
        
        for (const selector of lushaSelectors) {
            try {
                const elementCount = await page.locator(selector).count();
                if (elementCount > 0) {
                    console.log(`✅ Found Lusha badge: ${selector}`);
                    
                    // Scroll into view and click
                    await page.evaluate((sel) => {
                        const el = document.querySelector(sel);
                        if (el) {
                            el.scrollIntoView({ block: 'center' });
                            el.click();
                        }
                    }, selector);
                    
                    console.log('✅ Clicked Lusha badge');
                    clicked = true;
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!clicked) {
            console.log('⚠️ Lusha badge not found - extension may not be installed');
            return false;
        }
        
        // Wait for Lusha iframe to load content
        await page.waitForTimeout(2000);
        
        // Check for privacy approval popup and click if exists
        const approved = await handleLushaPrivacyApproval(page);
        if (approved) {
            console.log('✅ Handled Lusha privacy approval');
            await page.waitForTimeout(1000);
        }
        
        console.log('✅ Lusha activated successfully');
        return true;
        
    } catch (error) {
        console.log(`⚠️ Error activating Lusha: ${error.message}`);
        return false;
    }
}

// Handle privacy approval popup if it appears
async function handleLushaPrivacyApproval(page) {
    try {
        // Look for Lusha iframe
        const frames = page.frames();
        for (const frame of frames) {
            const url = frame.url();
            if (url.includes('lusha') || url.includes('LU__extension')) {
                // Try to click privacy approval button
                const clicked = await frame.evaluate(() => {
                    const button = document.querySelector('[data-test-id="privacy-approval-button"]') ||
                                 Array.from(document.querySelectorAll('button')).find(b => 
                                     /got it,?\s*let'?s? go/i.test(b.textContent || '')
                                 );
                    if (button) {
                        button.click();
                        return true;
                    }
                    return false;
                }).catch(() => false);
                
                if (clicked) {
                    return true;
                }
            }
        }
    } catch (error) {
        // No privacy approval needed
    }
    return false;
}

module.exports = { activateLusha };
