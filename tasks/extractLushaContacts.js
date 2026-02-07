// ═════════════════════════════════════════════════════════════════
// 🔵 TASK: Extract Lusha Contact Data from Sidebar
// ═════════════════════════════════════════════════════════════════
// Purpose: Extract enriched contact data from Lusha sidebar
// ═════════════════════════════════════════════════════════════════

const fs = require('fs');
const { cleanName } = require('./nameCleaner');

const splitName = (fullName) => {
    const cleaned = cleanName(fullName || '');
    if (!cleaned) {
        return { firstName: "", lastName: "" };
    }
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: "" };
    }
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
};

const extractDomains = (text) => {
    if (!text) {
        return [];
    }
    const matches = String(text).match(/@([a-z0-9.-]+\.[a-z]{2,})/gi) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/^@/, "").toLowerCase())));
};

async function getLushaFrame(page) {
    const frames = page.frames();
    for (const frame of frames) {
        try {
            const url = frame.url();
            if (url.includes('LU__extension_iframe') || frame.name() === 'LU__extension_iframe') {
                return frame;
            }
        } catch (error) {
            // ignore
        }
    }
    
    // Try by frame element ID
    try {
        const frameElement = await page.$('iframe#LU__extension_iframe');
        if (frameElement) {
            return frameElement.contentFrame();
        }
    } catch (error) {
        // ignore
    }
    
    return null;
}

async function expandAllCards(frame) {
    try {
        await frame.evaluate(() => {
            const arrows = Array.from(document.querySelectorAll(
                '.divider-and-arrow-container img[alt="Arrow Down"], .divider-and-arrow-container'
            ));
            arrows.forEach((el) => {
                const clickable = el.closest('.divider-and-arrow-container') || el;
                if (clickable) {
                    clickable.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                }
            });
        });
    } catch (error) {
        console.log('⚠️ Could not expand Lusha cards');
    }
}

async function extractLushaContacts(page, options = {}) {
    const { maxCards = 25, debug = true, outputFile = 'lusha_contacts.jsonl', prospeoFile = 'prospeo_leads.jsonl' } = options;
    
    if (debug) {
        console.log('🔵 [Lusha] Starting contact extraction...');
    }
    
    try {
        // Find Lusha iframe
        const lushaFrame = await getLushaFrame(page);
        if (!lushaFrame) {
            console.log('⚠️ Lusha iframe not found');
            return [];
        }
        
        if (debug) {
            console.log('✅ Found Lusha iframe');
        }
        
        // Wait for container to appear
        const containerSelectors = [
            "[data-test-id='bulk-contact-container-with-data']",
            ".bulk-contact-profile-container"
        ];
        
        let containerFound = false;
        for (const selector of containerSelectors) {
            try {
                await lushaFrame.waitForSelector(selector, { timeout: 5000, state: 'visible' });
                containerFound = true;
                if (debug) {
                    console.log(`✅ Found Lusha container: ${selector}`);
                }
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!containerFound) {
            console.log('⚠️ Lusha contact container not visible');
            return [];
        }
        
        // Expand all cards
        await expandAllCards(lushaFrame);
        await page.waitForTimeout(200);
        
        // Extract data from cards
        const raw = await lushaFrame.evaluate((maxCards) => {
            const cards = Array.from(document.querySelectorAll('.bulk-contact-profile-container'));
            return cards.slice(0, maxCards).map((card) => {
                const fullNameEl = card.querySelector('.bulk-contact-full-name');
                const companyEl = card.querySelector('.bulk-contact-company-name');
                const fullName = fullNameEl ? fullNameEl.textContent.trim() : '';
                const companyName = companyEl ? companyEl.textContent.trim() : '';
                const spans = Array.from(card.querySelectorAll('.bulk-contact-value-text .user-base.overflow-span'));
                const domains = spans
                    .map((span) => (span.textContent || '').trim())
                    .filter(Boolean);
                return { fullName, companyName, domains };
            });
        }, maxCards);
        
        if (debug) {
            console.log(`✅ Extracted ${raw.length} Lusha contacts`);
        }
        
        // Process and clean data using nameCleaner
        const contacts = raw.map((record) => {
            const cleanedFullName = cleanName(record.fullName || '');
            const { firstName, lastName } = splitName(cleanedFullName);
            const domains = [];
            for (const text of record.domains || []) {
                const extracted = extractDomains(text);
                for (const d of extracted) {
                    if (!domains.includes(d)) {
                        domains.push(d);
                    }
                }
            }
            return {
                fullName: cleanedFullName,
                firstName,
                lastName,
                companyName: record.companyName,
                domain: domains[0] || '', // Take first domain only
                allDomains: domains,
                source: 'lusha',
                extractedAt: new Date().toISOString()
            };
        }).filter(c => c.domain); // Only keep records with domain
        
        // Save to JSONL file (temporary storage)
        if (contacts.length > 0 && outputFile) {
            const lines = contacts.map(c => JSON.stringify(c)).join('\n') + '\n';
            await fs.promises.appendFile(outputFile, lines);
            if (debug) {
                console.log(`💾 Stored ${contacts.length} Lusha contacts (with domains) for later matching`);
            }
        }
        
        return contacts;
        
    } catch (error) {
        console.log(`⚠️ Error extracting Lusha contacts: ${error.message}`);
        return [];
    }
}

// Strict Full Name Matching Only (no partial matches to avoid wrong domains)
function findMatchingProspeoRecord(lushaContact, prospeoPersons) {
    if (!prospeoPersons || prospeoPersons.length === 0) {
        return null;
    }
    
    const lushaFullName = (lushaContact.fullName || '').toLowerCase().trim();
    
    if (!lushaFullName) {
        return null;
    }
    
    // Only match by exact full name (cleaned)
    const fullNameMatch = prospeoPersons.find(p => {
        const cleanedName = cleanName(p.full_name || '').toLowerCase().trim();
        return cleanedName === lushaFullName;
    });
    
    return fullNameMatch || null;
}

// Append Lusha domains to Prospeo data after CSV generation
async function enrichProspeoWithLusha(lushaFile, prospeoFile, debug = false) {
    try {
        // Read Lusha contacts
        if (!fs.existsSync(lushaFile) || !fs.existsSync(prospeoFile)) {
            if (debug) {
                console.log('⚠️ Lusha or Prospeo file not found for enrichment');
            }
            return 0;
        }
        
        const lushaData = fs.readFileSync(lushaFile, 'utf-8');
        const lushaContacts = lushaData.trim().split('\n')
            .filter(Boolean)
            .map(line => JSON.parse(line));
        
        if (lushaContacts.length === 0) {
            return 0;
        }
        
        // Read Prospeo data
        const prospeoData = fs.readFileSync(prospeoFile, 'utf-8');
        const lines = prospeoData.trim().split('\n');
        let enriched = 0;
        let skipped = 0;
        
        const updatedLines = lines.map(line => {
            const record = JSON.parse(line);
            
            if (record.response && record.response.persons) {
                record.response.persons = record.response.persons.map(person => {
                    // Skip if already has domain enrichment
                    if (person.lusha_domain || (person.email && person.email.email)) {
                        skipped++;
                        return person;
                    }
                    
                    // Find matching Lusha contact
                    const lushaMatch = findMatchingProspeoRecord(
                        lushaContacts[0], // Use first for matching logic
                        [person]
                    );
                    
                    // Try to find in all Lusha contacts
                    const matchedLusha = lushaContacts.find(lc => {
                        const match = findMatchingProspeoRecord(lc, [person]);
                        return match !== null;
                    });
                    
                    if (matchedLusha && matchedLusha.domain) {
                        person.lusha_domain = matchedLusha.domain;
                        enriched++;
                    }
                    
                    return person;
                });
            }
            
            return JSON.stringify(record);
        });
        
        // Write back updated data
        fs.writeFileSync(prospeoFile, updatedLines.join('\n') + '\n', 'utf-8');
        
        if (debug) {
            console.log(`✅ Enriched ${enriched} records with Lusha domains (${skipped} skipped)`);
        }
        
        return enriched;
        
    } catch (error) {
        console.log(`⚠️ Error enriching with Lusha: ${error.message}`);
        return 0;
    }
}

async function minimizeLushaSidebar(page) {
    try {
        console.log('🔵 Minimizing Lusha sidebar...');
        
        const lushaFrame = await getLushaFrame(page);
        if (!lushaFrame) {
            console.log('⚠️ Lusha iframe not found for minimize');
            return false;
        }
        
        // Try to click minimize button inside frame
        const minimized = await lushaFrame.evaluate(() => {
            const btn = document.querySelector('.minimize-icon-container img[alt="Minimize"]') ||
                       document.querySelector('.minimize-icon-container') ||
                       document.querySelector('img[src*="Minimize.svg"]');
            if (btn) {
                const container = btn.closest('.minimize-icon-container') || btn;
                container.click();
                return true;
            }
            return false;
        });
        
        if (minimized) {
            console.log('✅ Lusha sidebar minimized');
            return true;
        }
        
        console.log('⚠️ Minimize button not found');
        return false;
        
    } catch (error) {
        console.log(`⚠️ Error minimizing Lusha: ${error.message}`);
        return false;
    }
}

module.exports = {
    extractLushaContacts,
    enrichProspeoWithLusha,
    minimizeLushaSidebar,
    splitName,
    extractDomains
};
