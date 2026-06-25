'use client';

import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function MetaSDKProvider() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID || process.env.NEXT_PUBLIC_META_CLIENT_ID || '1014118244486954';
  const apiVersion = process.env.NEXT_PUBLIC_META_API_VERSION || 'v18.0';

  useEffect(() => {
    // Define a inicialização do SDK globalmente
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: apiVersion
      });
      window.FB.AppEvents.logPageView();
      console.log(`🟢 Meta SDK inicializado com sucesso (App ID: ${appId}, Versão: ${apiVersion})`);
    };
  }, [appId, apiVersion]);

  return (
    <Script
      id="facebook-jssdk"
      src="https://connect.facebook.net/pt_BR/sdk.js"
      strategy="afterInteractive"
    />
  );
}
