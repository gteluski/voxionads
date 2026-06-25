'use client';

import Script from 'next/script';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function FacebookSDK() {
  const appId = process.env.NEXT_PUBLIC_META_CLIENT_ID || '1014118244486954';
  
  return (
    <>
      <Script id="facebook-init" strategy="afterInteractive">
        {`
          window.fbAsyncInit = function() {
            FB.init({
              appId: '${appId}',
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            FB.AppEvents.logPageView();
            console.log('🟢 Facebook SDK inicializado com App ID: ${appId}');
          };
        `}
      </Script>
      <Script
        id="facebook-jssdk"
        src="https://connect.facebook.net/pt_BR/sdk.js"
        strategy="afterInteractive"
      />
    </>
  );
}
