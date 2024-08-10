import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/components/context/AuthContext';

export const metadata = {
  title: 'StockSense for all your inventory needs',
  description: 'A dashboard and inventory manager for all item management big or small',
  icons: {
    icon: '/favicon.ico'
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
