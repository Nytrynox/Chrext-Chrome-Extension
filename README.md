# Chrext - Chrome Extension

## Overview
Chrext is a robust Chrome extension designed to enhance browser functionality with integrated payment gateway support. It features a secure backend connection for processing transactions and a clean popup interface for user interaction, demonstrating a full-stack approach to browser extension development.

## Features
-   **Payment Integration**: Native support for Razorpay payment processing.
-   **Secure Backend**: Dedicated server for validating transactions and API keys.
-   **Popup Interface**: Responsive UI built with modern web technologies.
-   **Context Awareness**: Content scripts that interact safely with visited pages.
-   **User Management**: Secure authentication and profile storage.

## Technology Stack
-   **Extension**: HTML, CSS, JavaScript (Manifest V3).
-   **Backend**: Node.js / Python Flask.
-   **Payments**: Razorpay API.
-   **Database**: MongoDB for user data.

## Usage Flow
1.  **Install**: Load the extension into the browser.
2.  **Activate**: Click the icon to open the popup dashboard.
3.  **Transact**: User initiates a payment flow within the extension.
4.  **Verify**: Backend validates the payment and updates user status.

## Quick Start
```bash
# Clone the repository
git clone https://github.com/Nytrynox/Chrext-Chrome-Extension.git

# Load in Chrome
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the 'chrext' directory
```

## License
MIT License

## Author
**Karthik Idikuda**
