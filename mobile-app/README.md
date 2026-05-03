# Telegram Drive Mobile

A separate mobile version of Telegram Drive built with Expo and React Native.

## Run locally

```bash
cd mobile-app
npm install
npm start
```

Then open the project in Expo Go or run on simulator/device:

```bash
npm run android
npm run ios
```

## Design

This mobile version uses:
- bottom tab navigation
- file explorer screen
- upload action sheet
- search screen
- settings screen
- Telegram integration scaffolding from `androidintegration.txt`

The UI is based on `androidscheme.txt` and `androidui.txt`.

## Telegram Integration

The mobile app includes `mobile-app/services/telegramService.js` as a starter integration layer.
It follows the design in `androidintegration.txt` for:
- MTProto / Telegram client setup
- file upload
- file download
- listing telegram messages/media
- session storage

You still need to provide `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` for real authentication.
