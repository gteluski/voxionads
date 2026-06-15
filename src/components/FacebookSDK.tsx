'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function FacebookSDK() {
  useEffect(() => {
    // Inicializar Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_CLIENT_ID || '',
        cookie: true,
        xfbml: true, // Habilitar XFBML para renderizar plugins sociais
        version: 'v18.0'
      });
      
      console.log('🟢 Facebook SDK inicializado');
    };
    
    // Carregar SDK de forma assíncrona
    (function(d: Document, s: string, id: string) {
      var js: any, fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/pt_BR/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    
  }, []);
  
  return null; // Componente invisível
}
