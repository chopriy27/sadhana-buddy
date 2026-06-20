import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sadhanabuddy.app',
  appName: 'Sadhana Buddy',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FF7F50",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FF7F50"
    },
    // Updated configuration for @capgo/capacitor-social-login
    SocialLogin: {
      providers: {
        google: true,
        apple: true,
        facebook: false
      }
    }
  }
};

export default config;
