import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.networth.tycoon',
  appName: 'NetWorth',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0D0D0D',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D0D0D',
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_networth',
      iconColor: '#00FFB2',
    },
  },
};

export default config;
