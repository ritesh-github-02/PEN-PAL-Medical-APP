import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/routing'; // We need to configure @ alias or relative path
import type {Metadata} from 'next';
import '../globals.css'; 

export async function generateMetadata(
  {params}: {params: Promise<{locale: string}>}
): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Index'});
  return {
    title: t('title'),
    description: t('description')
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
      </head>
      <body className="bg-[#f4f8e8] text-[#2d3748] min-h-screen antialiased selection:bg-[#35727f]/10 selection:text-[#35727f] font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
