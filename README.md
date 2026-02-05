# LinkedIn Sales Navigator Lead Scraper

Automated lead extraction tool for LinkedIn Sales Navigator using Prospeo/Lusha Chrome extension with Playwright automation.

## 🚀 Features

- **Multi-page Processing**: Automatically processes up to 50 pages of leads
- **Smart Scrolling**: Human-like scrolling behavior to load all leads
- **Real-time Data Capture**: Intercepts Prospeo API responses and saves data
- **CSV Export**: Converts captured JSONL data to organized CSV format
- **Robust Sidebar Detection**: Multi-layer verification for extension activation
- **Task-based Architecture**: Clean, modular code structure for easy maintenance

## 📋 Requirements

- Node.js 16 or higher
- Google Chrome browser
- Prospeo or Lusha Chrome extension installed
- LinkedIn Sales Navigator account

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Edit `config.js` to customize:
- Chrome path and user data directory
- LinkedIn search URL
- Maximum pages to process
- Scroll behavior options

## 🎯 Usage

```bash
node main.js
```

The script will:
1. Launch Chrome with debugging enabled
2. Connect to the browser via CDP
3. Navigate to LinkedIn Sales Navigator
4. Activate Prospeo/Lusha extension
5. Process each page (scroll → capture → next)
6. Generate CSV with all captured leads

## 📂 Output Files

- `prospeo_leads.jsonl` - Raw JSON data (line-delimited)
- `prospeo_leads.csv` - Formatted CSV with merged person + company data

## 📊 CSV Columns

**Person Data**: Full Name, LinkedIn, Title, Employee Status, Duration, Seniority, Departments, Location, Email Domain

**Company Data**: Name, LinkedIn, Website, Founded, Type, Industry, Employee Count, Revenue, Locations, Social Links

## 🏗️ Project Structure

```
prospeo_linkedin/
├── main.js                  # Main orchestrator
├── config.js               # Configuration settings
├── extractData.js          # API response interceptor
├── convertToCSV.js         # JSONL to CSV converter
└── tasks/                  # Self-contained task modules
    ├── launchChrome.js
    ├── connectBrowser.js
    ├── navigateToLinkedIn.js
    ├── activateProspeo.js
    ├── scrollDashboard.js
    ├── waitForCapture.js
    ├── getPageInfo.js
    ├── navigateNextPage.js
    ├── generateCSV.js
    └── closeBrowser.js
```

## 🛠️ Tech Stack

- **Playwright**: Browser automation
- **Chrome DevTools Protocol**: Remote debugging
- **json2csv**: Data conversion
- **Node.js**: Runtime environment

## ⚠️ Important Notes

- Close all Chrome instances before running the script
- Ensure Prospeo/Lusha extension is installed and configured
- Script uses port 9222 for Chrome debugging
- Separate Chrome user data directory prevents conflicts

## 📝 License

MIT

## 👤 Author

Hassan Rahman
