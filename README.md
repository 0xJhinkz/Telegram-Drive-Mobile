<div align="center">

<img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
<img src="https://img.shields.io/badge/Built%20With-Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/Powered%20By-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" />
<img src="https://img.shields.io/badge/Version-1.0.0-4A90E2?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" />

<br /><br />

# ☁️ Telegram Drive Mobile

**A mobile-first cloud storage manager powered by Telegram.**  
Browse, upload, search, and organize your files stored in Telegram — all from your Android device.

<br />

</div>

---

## 📥 Download APK

> **Latest Release — v1.0.0**

| Platform | Download | Notes |
|----------|----------|-------|
| 🤖 Android APK | [**Download telegram-drive-v1.0.0.apk**](../../releases/latest) | Android 5.0+ required |

> ⚠️ On first install, Android may ask you to **"Allow installs from unknown sources"** — this is expected for sideloaded APKs. Go to *Settings → Security → Install unknown apps* and allow your browser/file manager.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Telegram Auth** | Log in securely using your Telegram phone number + OTP (no passwords stored) |
| 📁 **File Manager** | Browse and manage files stored in your Telegram Saved Messages |
| 📂 **Folder System** | Organize files into custom virtual folders |
| ⬆️ **Upload Files** | Upload any file from your device directly to Telegram |
| 🔍 **Search** | Full-text search across all your stored files |
| 👁️ **Preview** | In-app preview for images, videos, PDFs, and audio |
| ⚙️ **Settings** | Manage folders, view account info, and logout |
| 🌐 **Cross-Platform** | Works as Android APK or in any modern web browser |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) (React Native) |
| Telegram API | [GramJS](https://github.com/gram-js/gramjs) (MTProto) |
| UI | React Native + Expo Vector Icons |
| Navigation | Custom bottom tab navigation |
| Build | Expo + `eas build` / GitHub Actions |
| Target | Android (APK), Web (PWA) |

---

## 🚀 Getting Started (Development)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- A Telegram account & [API credentials](https://my.telegram.org/apps)

### 1. Clone the repository

```bash
git clone https://github.com/0xJhinkz/Telegram-Drive-Mobile.git
cd Telegram-Drive-Mobile/mobile-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Telegram API credentials

Open `mobile-app/services/telegramService.js` and set your API credentials:

```js
const API_ID   = YOUR_API_ID;    // from https://my.telegram.org/apps
const API_HASH = 'YOUR_API_HASH';
```

### 4. Run the app

```bash
# Start Expo dev server
npm start

# Run on Android (with emulator or physical device)
npm run android

# Run in browser
npm run web
```

---

## 📦 Building the APK

### Using EAS Build (recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account
eas login

# Build release APK
eas build --platform android --profile preview
```

### Using GitHub Actions (automated)

Every push to the `main` branch (or a new GitHub Release tag) triggers the CI/CD workflow, which:

1. Installs dependencies
2. Builds the Android APK via EAS
3. Uploads the APK as a **GitHub Release asset** automatically

> See [`.github/workflows/release.yml`](.github/workflows/release.yml) for the full workflow configuration.

---

## 📁 Project Structure

```
Telegram-Drive-Mobile/
├── mobile-app/
│   ├── App.js                  # Root app shell (auth, navigation, state)
│   ├── index.js                # Entry point
│   ├── app.json                # Expo config
│   ├── webpack.config.js       # Web/webpack config
│   ├── polyfills.js            # Browser polyfills for gramjs
│   │
│   ├── screens/
│   │   ├── AuthScreen.js       # Phone + OTP login flow
│   │   ├── FilesScreen.js      # File browser & file operations
│   │   ├── UploadScreen.js     # File upload interface
│   │   ├── SearchScreen.js     # Full-text file search
│   │   └── SettingsScreen.js   # Account info, folder management, logout
│   │
│   ├── components/
│   │   ├── FolderDrawer.js     # Slide-out folder selector
│   │   ├── PreviewModal.js     # In-app media/document preview
│   │   ├── ContextMenu.js      # Long-press file context menu
│   │   ├── MoveModal.js        # Move file to folder dialog
│   │   ├── FileThumbnail.js    # File thumbnail renderer
│   │   ├── FileTypeIcon.js     # File type icon mapper
│   │   └── EmptyState.js       # Empty state placeholder
│   │
│   └── services/
│       └── telegramService.js  # GramJS MTProto client & API methods
│
├── LICENSE                     # Proprietary license
└── README.md                   # You are here
```

---

## 🖼️ Screenshots

> _Screenshots will be added in a future release._

---

## 🔒 License & Legal

This project is licensed under a **Proprietary Source-Available License**.

- ✅ You **may** view and study the source code for personal/educational use
- ✅ You **may** fork to submit pull requests to this repository
- ❌ You **may NOT** use this commercially, redistribute it, or sell it
- ❌ You **may NOT** remove or alter author credits

See the full [LICENSE](./LICENSE) file for details.

---

## 👤 Author

<div align="center">

**0xJhinkz**  
[github.com/0xJhinkz](https://github.com/0xJhinkz)

*Designed, developed, and maintained exclusively by 0xJhinkz.*

</div>

---

<div align="center">

Made with ❤️ using Expo + GramJS  
© 2024–2026 0xJhinkz · All rights reserved

</div>
