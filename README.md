# 🎟️ Ticketmaster Account & SMS Automator

[![Download Extension](https://img.shields.io/badge/⬇️_DOWNLOAD-EXTENSION_ZIP-blue?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/Zorin16/ticketmaster-sms-automator/releases/latest/download/ticketmaster-sms-automator-v2.0.0.zip)
[![Download Config](https://img.shields.io/badge/⚙️_DOWNLOAD-CONFIG_JSON-green?style=for-the-badge&logo=json&logoColor=white)](https://raw.githubusercontent.com/Zorin16/ticketmaster-sms-automator/main/configs/ticketmaster-config.json)

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Version](https://img.shields.io/badge/Version-2.0.0-green)
![Platform](https://img.shields.io/badge/Platform-Chrome_Extension-orange)

An automated multi-region account registration and SMS verification engine built as a Chrome Extension (Manifest V3) specifically tailored for **Ticketmaster** portals globally. Designed to streamline high-volume phone verification routines while bypassing rate-limit blocks through 2-step DOM modal cancels and automated session resets.

---

## ⚡ Quick Download Links

* 📦 **[Click to Download Extension ZIP (v2.0.0)](https://github.com/Zorin16/ticketmaster-sms-automator/releases/download/v2/ticketmaster-sms-automator-v2.0.0.rar)**
* 📄 **[Click to Download Pre-Configured JSON (`ticketmaster-config.json`)](https://github.com/Zorin16/ticketmaster-sms-automator/releases/download/v2/Ticket.Master.Config.json)**

---

## 🚀 Key Features

* **Ticketmaster Modal Cancellation Engine:** Automatically handles Ticketmaster's 2-step verification cancel prompts (`Cancel Limit` followed by the secondary `"Your information will be lost" -> "Yes, Cancel"` dialog) to stay on page without triggering hard site reloads.
* **Multi-Country Queue Engine:** Interleaved round-based workflow execution across 22 Ticketmaster regional portals (UK, DE, FR, CA, AU, NL, ES, etc.).
* **Multilingual Limit Error Parser:** Detects localized rate-limit error messages across 11+ languages (English, German, French, Spanish, Polish, Dutch, Swedish, Finnish, Czech, Danish, Norwegian).
* **Smart Form & Address Filler:**
  * Auto-generates valid synthetic emails and secure passwords.
  * Localized Royal Mail (UK), Eircode (IE), Dutch, German, and Australian postcode generators formatted for regional Ticketmaster registration forms.
  * Bypasses postal code fields automatically for Ticketmaster UAE (`ae`), France (`fr`), Philippines (`ph`), and Singapore (`sg`).
* **⚡ 1-Click Pre-Configured Profile Setup:** Skip manual setup completely—simply click **Import Config** to upload a pre-made `ticketmaster-config.json` file that instantly configures all CSS selectors, step delays, and site URLs for all supported countries.
* **Session Purging & Lockdown:** One-click cookie and local storage purging per domain to cleanly reset account verification state.
* **Live Performance Tracker:** Real-time metrics for rate-limited numbers vs. successful OTP verifications, with one-click country-tagged `.txt` file exports.

---

## 🌍 Supported Regional Ticketmaster Presets

| Region | Country Code | Postcode Handler | Layout Rules |
| :--- | :--- | :--- | :--- |
| **Ticketmaster UK** | `uk` | Royal Mail Standard | Single Checkbox |
| **Ticketmaster Germany** | `de` | 5-Digit Numeric | Single Checkbox |
| **Ticketmaster France** | `fr` | Bypassed | Single Checkbox |
| **Ticketmaster Canada** | `ca` | Alphanumeric (A1A 1A1) | Dual Checkbox Layout |
| **Ticketmaster Australia** | `au` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Netherlands** | `nl` | Dutch Formatted | Single Checkbox |
| **Ticketmaster Spain** | `es` | 5-Digit Numeric | Single Checkbox |
| **Ticketmaster Ireland** | `ie` | Eircode Formatted | Single Checkbox |
| **Ticketmaster UAE** | `ae` | Bypassed | Single Checkbox |
| **Ticketmaster Mexico** | `mx` | 5-Digit Numeric | Single Checkbox |
| **Ticketmaster Switzerland**| `ch` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Sweden** | `se` | 5-Digit Formatted | Single Checkbox |
| **Ticketmaster Denmark** | `dk` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Norway** | `no` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Poland** | `pl` | 5-Digit Formatted | Single Checkbox |
| **Ticketmaster Austria** | `at` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Belgium** | `be` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Finland** | `fi` | 5-Digit Numeric | Single Checkbox |
| **Ticketmaster Czech Rep.**| `cz` | 5-Digit Formatted | Single Checkbox |
| **Ticketmaster S. Africa**| `za` | 4-Digit Numeric | Single Checkbox |
| **Ticketmaster Philippines**|`ph` | Bypassed | Single Checkbox |
| **Ticketmaster Singapore**| `sg` | Bypassed | Single Checkbox |

---

## 🛠️ Technical Architecture

* **Core Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, Manifest V3.
* **Chrome APIs Used:**
  * `chrome.sidePanel` — Embedded side panel interface.
  * `chrome.scripting` — Context script injection across nested Ticketmaster `iframe` frames.
  * `chrome.cookies` & `chrome.browsingData` — Targeted domain cookie clearance.
  * `chrome.storage.local` — Selector and profile state persistence.

---

## 📦 Installation & Setup

### Option 1: Fast Installation via ZIP (Recommended)
1. **[Click here to download the extension ZIP file](https://github.com/Zorin16/ticketmaster-sms-automator/releases/download/v2/ticketmaster-sms-automator-v2.0.0.rar)**.
2. Extract the downloaded ZIP folder to a convenient location on your computer.
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click **Load unpacked** and select the extracted extension directory.

Then load the project folder into Chrome via chrome://extensions/.

📖 Quick Start & Configuration Options
Open the Ticketmaster authorization/registration page in your browser and open the Ticketmaster Automator side panel.

Method A: Fast Setup (Import Pre-Configured File)
Click here to download ticketmaster-config.json.

Click Import Config at the bottom of the extension side panel.

Select the .json file — all CSS selectors, step delays, and target URLs will automatically populate across all 22 supported countries.

Paste your phone numbers (1 per line) and click ▶ Run Workflow.

Method B: Manual Setup (Element Picker)
Use the Pick buttons in the panel to click and assign target input selectors on the page (Email, Password, Postal Code, Add Phone, etc.).

Enter your Form Return URL (e.g. https://auth.ticketmaster.com/...).

Paste your phone numbers into the list area (up to 300 numbers).

Select your target country preset and click ▶ Run Workflow.

(Optional) Click Export Config to save your configured selectors into a JSON file for future 1-click importing.
