const fs = require('fs');
const { parse } = require('json2csv');
const { cleanName } = require('./tasks/nameCleaner');

function splitName(fullName) {
    const cleaned = cleanName(fullName || '');
    if (!cleaned) {
        return { firstName: '', lastName: '' };
    }
    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: '' };
    }
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' ')
    };
}

// Extract clean domain from website URL
function extractDomainFromWebsite(websiteUrl) {
    if (!websiteUrl) return '';
    
    let domain = String(websiteUrl).trim();
    
    // Remove protocol
    domain = domain.replace(/^https?:\/\//i, '');
    
    // Remove www.
    domain = domain.replace(/^www\./i, '');
    
    // Remove trailing slash and any path
    domain = domain.split('/')[0];
    
    // Remove any query parameters or anchors
    domain = domain.split('?')[0].split('#')[0];
    
    return domain.toLowerCase().trim();
}

async function convertToCSV(inputFile = 'leads.jsonl', outputFile = 'leads.csv') {
    console.log('\n📊 Converting JSONL to CSV...');
    
    try {
        // Check if JSONL input file exists
        if (!fs.existsSync(inputFile)) {
            console.log('⚠️  No data file found yet. Skipping CSV generation.');
            return;
        }
        
        // Read the JSONL file
        const jsonlData = fs.readFileSync(inputFile, 'utf-8');
        const lines = jsonlData.trim().split('\n');
        
        if (lines.length === 0 || !lines[0]) {
            console.log('⚠️  No data found in ' + inputFile);
            return;
        }

        // Array to hold merged data
        const mergedData = [];

lines.forEach(line => {
    const data = JSON.parse(line);
    
    if (data.response && data.response.persons) {
        data.response.persons.forEach(person => {
            // Find current job from job_history (where company_id matches company_oid)
            let currentJob = null;
            if (Array.isArray(person.job_history) && person.company_oid) {
                currentJob = person.job_history.find(job => job.company_id === person.company_oid);
            }
            
            // If no match, try to find any current job
            if (!currentJob && Array.isArray(person.job_history)) {
                currentJob = person.job_history.find(job => job.current === true);
            }
            
            // Find company data using company_oid
            let company = null;
            if (person.company_oid && data.response.companies) {
                company = data.response.companies[person.company_oid];
            }
            
            // Extract email domain
            let emailDomain = '';
            if (person.email?.email) {
                const emailParts = person.email.email.split('@');
                emailDomain = emailParts.length > 1 ? emailParts[1] : '';
            }
            
            // If Lusha domain exists and different, append it
            if (person.lusha_domain && person.lusha_domain !== emailDomain) {
                emailDomain = emailDomain ? `${emailDomain}; ${person.lusha_domain}` : person.lusha_domain;
            }
            
            // If Email Domain is still empty, extract from Website
            const websiteUrl = company?.website_url || '';
            if (!emailDomain && websiteUrl) {
                const websiteDomain = extractDomainFromWebsite(websiteUrl);
                if (websiteDomain) {
                    emailDomain = websiteDomain;
                }
            }
            
            // Split name into first and last
            const { firstName, lastName } = splitName(person.full_name || '');
            
            const mergedRow = {
                // Person details
                'Full Name': person.full_name || '',
                'First Name': firstName,
                'Last Name': lastName,
                'Person Linkedin': person.linkedin_url || '',
                
                // Current job from job_history
                'Title': currentJob?.title || '',
                'Employee Status': currentJob?.current ? 'Current' : 'Past',
                'Start Year': currentJob?.start_year || '',
                'Start Month': currentJob?.start_month || '',
                'End Year': currentJob?.end_year || '',
                'End Month': currentJob?.end_month || '',
                'Duration In Month': currentJob?.duration_in_months || '',
                'Seniority': currentJob?.seniority || '',
                'Departments': Array.isArray(currentJob?.departments) ? currentJob.departments.join(', ') : '',
                
                // Person location
                'Person Country': person.location?.country || '',
                'Person State': person.location?.state || '',
                'Person City': person.location?.city || '',
                
                // Email
                'Email Domain': emailDomain,
                
                // Company details
                'Company Name': company?.name || '',
                'Company Linkedin': company?.linkedin_url || '',
                'Website': company?.website_url || '',
                'Founded': company?.founded || '',
                'Type': company?.type || '',
                'Industry': company?.industry || '',
                'Employee Count': company?.employee_count || '',
                'Specialities': Array.isArray(company?.keywords) ? company.keywords.join(', ') : '',
                'Company Facebook': company?.social_network?.facebook_url || '',
                'Company Twitter': company?.social_network?.twitter_url || '',
                'Company Instagram': company?.social_network?.instagram_url || '',
                'Company Youtube': company?.social_network?.youtube_url || '',
                'Company Crunchbase': company?.social_network?.crunchbase_url || '',
                'Company Phone': company?.phone_hq?.phone_hq || '',
                'Revenue': company?.revenue_range_printed || '',
                'Company Country': company?.location?.country || '',
                'Company State': company?.location?.state || '',
                'Company City': company?.location?.city || '',
                'Company Address': company?.location?.raw_address || '',
            };
            
            mergedData.push(mergedRow);
        });
    }
});

        // Convert merged data to CSV
        const csv = parse(mergedData);
        fs.writeFileSync(outputFile, csv, 'utf-8');
        console.log(`✅ Successfully created merged CSV with ${mergedData.length} leads!`);
        console.log(`📄 File saved as: ${outputFile}`);
    } catch (err) {
        console.error('❌ Error converting to CSV:', err.message);
    }
}

module.exports = { convertToCSV };
