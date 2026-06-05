'use client';

export default function DebugPage() {
  return (
    <div className="p-8 space-y-4 font-mono bg-[#31251f] text-[#d8c5b6] min-h-screen">
      <h1 className="text-2xl font-bold text-[#f18535]">Debug: Variáveis Meta</h1>
      <p>CLIENT_ID: {process.env.NEXT_PUBLIC_META_CLIENT_ID || '❌ FALTA'}</p>
      <p>REDIRECT_URI: {process.env.NEXT_PUBLIC_META_REDIRECT_URI || '❌ FALTA'}</p>
      <p>NODE_ENV: {process.env.NODE_ENV}</p>
    </div>
  );
}
