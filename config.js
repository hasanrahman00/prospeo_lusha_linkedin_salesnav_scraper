// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ CONFIGURATION FILE
// ═══════════════════════════════════════════════════════════════════════════════
//
// All settings in one place for easy updates
//
// ═══════════════════════════════════════════════════════════════════════════════

// 🔧 Enable Playwright to see extension pages
process.env.PW_CHROMIUM_ATTACH_TO_OTHER = '1';

module.exports = {
    
    // ─────────────────────────────────────────────────────────────────
    // 🌐 Chrome Settings
    // ─────────────────────────────────────────────────────────────────
    
    PORT: 9222,
    CDP_URL: 'http://127.0.0.1:9222',
    CHROME_PATH: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    USER_DATA_DIR: 'C:\\\\Chrome_Prospeo_Clone',
    
    
    // ─────────────────────────────────────────────────────────────────
    // 🔗 LinkedIn Settings
    // ─────────────────────────────────────────────────────────────────
    
    LINKEDIN_SEARCH_URL: 'https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(id%3A5237214642%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3ACOMPANY_HEADQUARTERS%2Cvalues%3AList((id%3A103644278%2Ctext%3AUnited%2520States%2CselectionType%3AINCLUDED)%2C(id%3A101174742%2Ctext%3ACanada%2CselectionType%3AINCLUDED)))%2C(type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AA%2Ctext%3ASelf-employed%2CselectionType%3AINCLUDED)%2C(id%3AB%2Ctext%3A1-10%2CselectionType%3AINCLUDED)))%2C(type%3ACURRENT_TITLE%2Cvalues%3AList((text%3A%2522Owner%2522%2CselectionType%3AINCLUDED)%2C(text%3AOwner%2CselectionType%3AINCLUDED)%2C(id%3A716%2Ctext%3AChief%2520Marketing%2520Officer%2CselectionType%3AINCLUDED)%2C(id%3A26%2Ctext%3AMarketing%2520Manager%2CselectionType%3AINCLUDED)))%2C(type%3AINDUSTRY%2Cvalues%3AList((id%3A2934%2Ctext%3ALandscaping%2520Services%2CselectionType%3AINCLUDED)))))&sessionId=6N2jqdF%2BTMeXeegh4j89Ug%3D%3D&viewAllFilters=true',
    
    
    // ─────────────────────────────────────────────────────────────────
    // 📄 Pagination Settings
    // ─────────────────────────────────────────────────────────────────
    
    MAX_PAGES: 100,  // Safety limit
    
    
    // ─────────────────────────────────────────────────────────────────
    // 🖱️ Scroll Settings (Optimized for Speed)
    // ─────────────────────────────────────────────────────────────────────
    
    SCROLL_OPTIONS: {
        trackerSelector: "a[data-control-name^='view_lead_panel']",
        minSteps: 8,           // Reduced from 10 (fewer iterations)
        maxSteps: 12,          // Reduced from 15 (fewer iterations)
        stepPx: 450,           // Increased from 300 (larger jumps)
        minDelayMs: 300,       // Human-like timing maintained
        maxDelayMs: 700,       // Human-like timing maintained
        maxRounds: 25,
        bottomStallLimit: 3    // Reduced from 5 (quicker detection)
    }
};
