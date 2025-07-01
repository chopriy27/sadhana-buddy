import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useMobileFeatures() {
  const [isNative, setIsNative] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeMobile = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsNative(true);
        
        try {
          // Configure status bar
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#FF7F50' });
          
          // Hide splash screen after app loads
          await SplashScreen.hide();
          
          setIsReady(true);
        } catch (error) {
          console.warn('Mobile features initialization failed:', error);
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    };

    initializeMobile();
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  };

  const vibrate = (pattern?: number[]) => {
    if (!isNative && navigator.vibrate) {
      navigator.vibrate(pattern || 100);
    }
  };

  return {
    isNative,
    isReady,
    triggerHaptic,
    vibrate
  };
}