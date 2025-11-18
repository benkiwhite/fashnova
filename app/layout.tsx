import './globals.css';
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FashNova — AI × Fashion × EC',
  description: '描いた理想をECの商品につなぐ、新感覚ファッション検索',
  icons: {
    icon: '/fashnova.png',
    shortcut: '/fashnova.png',
    apple: '/fashnova.png',
  },
  themeColor: '#7C3AED', // purple-600
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#07050d] text-white antialiased">
        {children}
      </body>
    </html>
  );
}

