import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:    'com.letsthinkpositive.app',
  appName:  "Let's Think Positive",
  webDir:   'out',   // not used for remote URL — kept as required field

  // ── Remote URL Mode ──────────────────────────────────────────────────────
  // The Android app loads the live website instead of a local bundle.
  // This means ALL features (auth, DB, AI coach, etc.) work instantly
  // with zero extra configuration.
  server: {
    url:       'https://letsthinkpositive.com',
    cleartext: false,
    // Allow all navigation within the app
    allowNavigation: [
      'letsthinkpositive.com',
      '*.letsthinkpositive.com',
    ],
  },

  // ── Android ──────────────────────────────────────────────────────────────
  android: {
    allowMixedContent:    false,
    captureInput:         true,
    webContentsDebuggingEnabled: false,  // set true during dev
    buildOptions: {
      keystorePath:    undefined,  // add before Play Store release
      keystoreAlias:   undefined,
      keystorePassword:undefined,
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration:   2000,
      launchAutoHide:       true,
      backgroundColor:      '#1A6B6B',    // teal-deep
      androidSplashResourceName: 'splash',
      showSpinner:          false,
    },
    StatusBar: {
      style:           'DARK',            // white text on teal background
      backgroundColor: '#1A6B6B',
      overlaysWebView: false,
    },
    Keyboard: {
      resize:          'body',
      style:           'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
