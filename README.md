# Home Automation — Bluetooth Smart Living System

A complete, professional smart-home control interface built with React + TypeScript + Vite, designed to be packaged as an Android app using Capacitor and Android Studio.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run in browser (dev mode)
npm run dev
# Open: http://localhost:5173

# 3. Production build
npm run build
# Output: dist/
```

---

## Project Structure

```
src/
├── components/
│   ├── AppShell.tsx        # Sidebar + top bar + mobile nav
│   ├── BluetoothBadge.tsx  # Connection status badge
│   ├── DeviceCard.tsx      # Reusable appliance card
│   ├── IntroScreen.tsx     # Animated splash screen
│   └── ToastContainer.tsx  # Global toast notifications
├── hooks/
│   ├── useTheme.ts         # Light/dark/system theme
│   └── useToast.ts         # Toast helpers
├── models/
│   ├── types.ts            # All TypeScript interfaces
│   └── seed.ts             # Default devices, rooms, schedules
├── pages/
│   ├── DashboardPage.tsx
│   ├── DevicesPage.tsx
│   ├── RoomsPage.tsx
│   ├── LightingPage.tsx
│   ├── ClimatePage.tsx
│   ├── EntertainmentPage.tsx
│   ├── SchedulesPage.tsx
│   ├── BluetoothPage.tsx
│   ├── ActivityPage.tsx
│   └── SettingsPage.tsx
├── services/
│   └── bluetooth/
│       ├── bluetoothService.ts   # Adapter interface + MockAdapter
│       └── useBluetooth.ts       # React hook connecting BT to store
├── store/
│   └── appStore.ts         # Zustand global state (persisted)
└── styles/
    └── globals.css          # Complete design system (tokens, components)
```

---

## Hardware Scope (Initial Prototype)

| Item | Status |
|------|--------|
| ESP32 development board | Model TBC |
| LED 1 (Light 1 — command `L1_ON` / `L1_OFF`) | ✅ Supported |
| LED 2 (Light 2 — command `L2_ON` / `L2_OFF`) | ✅ Supported |
| Ceiling fans | ⚠️ Demo only — requires motor driver |
| AC units | ⚠️ Demo only — requires IR/relay interface |
| TVs | ⚠️ Demo only — requires IR/CEC interface |
| Geysers | ❌ Not safe — requires rated HW + teacher sign-off |

---

## Bluetooth Protocol

Commands are newline-terminated ASCII strings sent over serial (BT Classic SPP) or a BLE UART characteristic.

```
L1_ON\n   → Turn Light 1 ON
L1_OFF\n  → Turn Light 1 OFF
L2_ON\n   → Turn Light 2 ON
L2_OFF\n  → Turn Light 2 OFF
```

The firmware is expected to respond with:
```
ACK:L1_ON\n   → Acknowledgement
```

**To add more outputs:** Edit `COMMANDS` in `src/services/bluetooth/bluetoothService.ts`.

---

## Swapping the Bluetooth Adapter (for the Real APK)

1. Decide on the protocol: **BLE** or **Bluetooth Classic SPP**.
2. Install the matching Capacitor plugin:
   - BLE: `npm install @capacitor-community/bluetooth-le`
   - Classic SPP: find a maintained SPP plugin or write a native module
3. Create a class implementing `BluetoothAdapter` in `bluetoothService.ts`
4. Replace `new MockBluetoothAdapter()` with your real adapter
5. Run `npx cap sync android` and rebuild the APK

> **Do not use Web Bluetooth for Classic Serial.** Web Bluetooth only supports BLE.

---

## Capacitor & Android Studio Setup

### Prerequisites
- Node.js ≥ 18
- Android Studio (Giraffe or newer)
- Java 17 (bundled with Android Studio)
- An Android phone with USB debugging enabled

### Step-by-Step

```bash
# 1. Build the web app
npm run build

# 2. Install Capacitor core
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialise Capacitor (first time only)
npx cap init "Home Automation" "com.homeauto.app" --web-dir dist

# 4. Add the Android platform
npx cap add android

# 5. Sync web build to Android project
npx cap sync android

# 6. Open in Android Studio
npx cap open android

# 7. In Android Studio:
#    Build → Build Bundle(s) / APK(s) → Build APK(s)
#    Or press Shift+F10 to run on connected device
```

### Required Android Permissions (add to AndroidManifest.xml)

```xml
<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Android ≤ 11 -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />

<!-- BLE scanning (Android < 12) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

---

## Theme System

- **Light theme:** Warm ivory background, sage-green accent, terracotta highlights
- **Dark theme:** Deep charcoal, ivory text, muted sage-green, warm borders
- **System mode:** Follows OS `prefers-color-scheme` automatically
- Preference persisted to `localStorage` via Zustand

---

## Schedules — Important Limitation

Schedules defined in the app are **App Active Only**.
They execute via `setTimeout` / `setInterval` only while the browser/app is open and foregrounded.

**For reliable hardware scheduling (future):**
- Send schedule data to the ESP32 over Bluetooth
- Execute on-device using the ESP32's real-time clock (RTC) and persistent storage
- Alternatively: use an Android `AlarmManager` / `WorkManager` background task (requires careful battery and permission handling)

---

## Feature Status

| Feature | Status |
|---------|--------|
| Light/dark/system themes | ✅ Complete |
| Intro animation | ✅ Complete |
| Responsive layout (desktop + mobile) | ✅ Complete |
| Sidebar + bottom nav | ✅ Complete |
| Dashboard with stats + quick actions | ✅ Complete |
| Device cards with state management | ✅ Complete |
| Lighting page | ✅ Complete |
| Climate page | ✅ Complete |
| Entertainment page | ✅ Complete |
| Rooms page | ✅ Complete |
| All Devices page (search + filter) | ✅ Complete |
| Schedule create/edit/delete/toggle | ✅ Complete |
| Activity log | ✅ Complete |
| Settings page | ✅ Complete |
| Bluetooth UI + mock adapter | ✅ Complete |
| Bluetooth real hardware adapter | ⏳ Awaiting ESP32 firmware + protocol |
| Real Capacitor BT plugin | ⏳ Awaiting protocol decision (BLE vs SPP) |
| Android APK build | ⏳ Awaiting plugin + hardware test |
| Fan motor driver control | ⏳ Awaiting hardware |
| AC / IR blaster control | ⏳ Awaiting hardware |
| Temperature sensor | ⏳ Awaiting hardware |
| On-device ESP32 scheduling (RTC) | ⏳ Awaiting firmware |

---

## Manual Testing Checklist

- [ ] Website builds: `npm run build` exits with code 0
- [ ] Dev server starts: `npm run dev` serves on port 5173
- [ ] Intro screen appears, auto-advances after 3.5 s, can be skipped
- [ ] Intro does not appear again after dismissal (preference persisted)
- [ ] All 10 navigation items load without blank pages
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly (toggle in top bar or Settings)
- [ ] System theme follows OS preference
- [ ] Theme persists across page reloads
- [ ] Stat cards on dashboard show correct device/schedule counts
- [ ] Light 1 + Light 2 cards toggle in demo mode (state changes)
- [ ] Unconfigured devices show "Not Configured" badge and cannot be toggled
- [ ] Demo-only devices show "Demo" badge
- [ ] Bluetooth scan button triggers mock scan → shows found device
- [ ] Connect button changes badge to Connected
- [ ] Disconnect button returns to Disconnected
- [ ] Activity log records BT events and device commands
- [ ] Schedule form validates: name required, device required, valid time
- [ ] Schedule can be created, edited, paused, resumed, deleted
- [ ] Rooms page lists all rooms; clicking shows room devices
- [ ] Device search + category filter on All Devices page works
- [ ] Settings Reset restores defaults (theme unchanged)
- [ ] No horizontal overflow at 390 px viewport width
- [ ] All icon-only buttons have `aria-label`
- [ ] Focus rings visible on keyboard navigation

---

## Next Steps (in order)

1. **Confirm ESP32 board model** and whether firmware uses BLE or BT Classic SPP
2. **Flash ESP32 firmware** that listens for `L1_ON\n`, `L1_OFF\n`, `L2_ON\n`, `L2_OFF\n` and replies `ACK:<cmd>\n`
3. **Install a Capacitor Bluetooth plugin** matching the protocol
4. **Implement the real `BluetoothAdapter`** in `bluetoothService.ts`
5. **Run `npm run build && npx cap sync android`**
6. **Open in Android Studio → build debug APK → install on phone**
7. **Test end-to-end:** scan → connect → toggle Light 1 → LED lights up
8. **Expand firmware** to support more GPIO outputs as hardware is added
9. **Add motor driver circuit** for fan control
10. **Consult teacher** before adding any 230 V mains switching
