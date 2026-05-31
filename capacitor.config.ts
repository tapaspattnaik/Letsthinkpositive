import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:    'com.letsthinkpositive.app',
  appName:  "Let's Think Positive",
  webDir:   'out',

  server: {
    url:       'https://letsthinkpositive.com',
    cleartext: false,
    allowNavigation: [
      'letsthinkpositive.com',
      '*.letsthinkpositive.com',
      'accounts.google.com',
      '*.googleapis.com',
      '*.googleusercontent.com',
      '*.pexels.com',
    ],
  },

  android: {
    allowMixedContent:           false,
    captureInput:                true,
    webContentsDebuggingEnabled: true,  // allows chrome://inspect debugging
  },

  plugins: {
    SplashScreen: {
      launchShowDuration:        1500,
      launchAutoHide:            true,
      backgroundColor:           '#1A6B6B',
      showSpinner:               false,
      splashFullScreen:          true,
      splashImmersive:           true,
    },
    StatusBar: {
      style:           'DARK',
      backgroundColor: '#1A6B6B',
      overlaysWebView: false,
    },
    Keyboard: {
      resize:             'body',
      resizeOnFullScreen: true,
    },
  },
}

export default config
