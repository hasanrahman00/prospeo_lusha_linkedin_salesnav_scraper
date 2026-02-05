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
    
    LINKEDIN_SEARCH_URL: 'https://www.linkedin.com/sales/search/people?page=1&query=(recentSearchParam%3A(id%3A5229927418%2CdoLogHistory%3Atrue)%2Cfilters%3AList((type%3ACOMPANY_HEADCOUNT%2Cvalues%3AList((id%3AB%2Ctext%3A1-10%2CselectionType%3AINCLUDED)))))&sessionId=P4xf%2Fh8WSqK5%2BeKf266jlQ%3D%3D&viewAllFilters=true',
    
    
    // ─────────────────────────────────────────────────────────────────
    // 📄 Pagination Settings
    // ─────────────────────────────────────────────────────────────────
    
    MAX_PAGES: 100,  // Safety limit
    
    
    // ─────────────────────────────────────────────────────────────────
    // 🖱️ Scroll Settings
    // ─────────────────────────────────────────────────────────────────
    
    SCROLL_OPTIONS: {
        trackerSelector: "a[data-control-name^='view_lead_panel']",
        minSteps: 10,
        maxSteps: 15,
        stepPx: 300,
        minDelayMs: 300,
        maxDelayMs: 700,
        maxRounds: 25,
        bottomStallLimit: 5
    }
};
