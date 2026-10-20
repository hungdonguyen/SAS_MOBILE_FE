# Smart Attendance System — Mobile App (React Native)

The student and lecturer mobile client for the **EIU Smart Attendance System** capstone project. Built with **React Native (TypeScript)** and **VisionCamera**, this app handles on-device face framing, biometric registration, live session check-in, and attendance history.

> For the detailed Vietnamese deployment and handover notes, see [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md).

---

## Key Features Built in This Repo

* **Real-Time Face Detection Camera (`SAS_FE/src/components/FaceCamera.tsx`):**
  * Uses `react-native-vision-camera` and `react-native-worklets-core` (`useRunOnJS`) to process camera frames at 60 FPS on a native background thread without blocking the React Native UI thread.
  * Guides the student to center their face inside an oval boundary before capturing and uploading the frame to the backend AI verification pipeline.
* **Student Check-In & Biometric Registration Flow:**
  * Authenticates against the NestJS backend with JWT + refresh tokens persisted in `AsyncStorage`.
  * Restores the user's session and role automatically on cold start before mounting the navigation stack.
  * Polls/streams async BullMQ job results during face registration and live classroom check-in, mapping backend error codes (e.g. liveness check failure, out-of-range GPS/Wi-Fi, expired session window) into clear UI prompts.
* **Attendance Schedule & History:**
  * Displays today's classes, room coordinates, check-in time windows (`-10` to `+15` mins present, `+16` to `+30` mins late), and past attendance records.

---

## Project Structure

```text
SAS_MOBILE_FE/
├── PROJECT_SUMMARY.md       # Full Vietnamese technical summary & API mapping
└── SAS_FE/                  # React Native 0.76+ TypeScript project
    ├── src/
    │   ├── api/             # Axios client, token interceptors & endpoint wrappers
    │   ├── components/      # FaceCamera, status cards, modals & shared UI
    │   ├── navigation/      # Role-based React Navigation stacks
    │   ├── screens/         # Login, Student Dashboard, Face Register, Check-In, History
    │   └── store/           # Auth & session state persistence (AsyncStorage)
    ├── android/             # Native Android Gradle project (VisionCamera + Worklets)
    └── ios/                 # Native iOS Xcode project
```

---

## Running Locally

```bash
cd SAS_FE

# Install dependencies
npm install

# Start Metro bundler
npm start

# Build & launch on Android device / emulator
npm run android
```
