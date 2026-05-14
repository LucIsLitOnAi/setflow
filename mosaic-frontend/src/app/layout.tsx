import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mosaic AI - Create beautiful gifts',
  description: 'Create a hyper-personalized photo mosaic with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <OnboardingProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </OnboardingProvider>
      </body>
    </html>
  );
}
