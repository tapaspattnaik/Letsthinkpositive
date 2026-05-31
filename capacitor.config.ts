import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:    'com.letsthinkpositive.app',
  appName:  "Let's Think Positive",
  webDir:   'out',

  // ── Remote URL — loads the live site so all features work instantly ───────
  server: {
    url:       'https://letsthinkpositive.com',
    cleartext: false,
    allowNavigation: [
      'letsthinkpositive.com',
      '*.letsthinkpositive.com',
      'accounts.google.com',
      '*.googleapis.com',
      '*.pexels.com',
      '*.googleusercontent.com',
    ],
    // Tell the WebView to use the live URL — prevents localhost fallback
    hostname: 'letsthinkpositive.com',
  },

  // ── Android ──────────────────────────────────────────────────────────────
  android: {
    allowMixedContent:            false,
    captureInput:                 true,
    // Enable during development so Chrome DevTools can inspect the WebView
    webContentsDebuggingEnabled:  true,
    buildOptions: {
      keystorePath:     undefined,
      keystoreAlias:    undefined,
      keystorePassword: undefined,
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration:            2000,
      launchAutoHide:                true,
      backgroundColor:               '#1A6B6B',
      androidSplashResourceName:     'splash',
      showSpinner:                   false,
      splashFullScreen:              true,
      splashImmersive:               true,
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#1A6B6B',
      overlaysWebView: false,
    },
    Keyboard: {
      resize:             'body',
      style:              'DARK',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
