import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/routing'; // We need to configure @ alias or relative path
import type {Metadata} from 'next';
import ExtensionErrorShield from '@/components/ExtensionErrorShield';
import '../globals.css'; 

export async function generateMetadata(
  {params}: {params: Promise<{locale: string}>}
): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Index'});
  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
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
    <html lang={locale} className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isExtError(str) {
                  if (!str) return false;
                  var s = String(str);
                  return s.indexOf('chrome-extension://') !== -1 ||
                         s.indexOf('moz-extension://') !== -1 ||
                         s.indexOf('chrome: call method') !== -1 ||
                         s.indexOf('Extension context invalidated') !== -1 ||
                         s.indexOf('message channel closed') !== -1;
                }

                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e && e.reason;
                  var msg = (reason && (reason.message || reason.stack)) || String(reason);
                  if (isExtError(msg)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);

                window.addEventListener('error', function(e) {
                  var msg = (e && (e.message || e.filename || (e.error && e.error.stack))) || '';
                  if (isExtError(msg)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#f4f8e8] text-[#2d3748] min-h-screen antialiased selection:bg-[#35727f]/10 selection:text-[#35727f] font-sans overflow-x-hidden" suppressHydrationWarning>
        {/* Shield to prevent Chrome extension runtime errors from crashing Next.js dev overlay */}
        <ExtensionErrorShield />

        {/* WCAG 2.1 AA Skip to Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#236f7a] focus:text-white focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          {locale === 'es' ? 'Saltar al contenido principal' : 'Skip to main content'}
        </a>

        <NextIntlClientProvider messages={messages}>
          <div id="main-content" tabIndex={-1} className="outline-none min-h-screen overflow-x-hidden">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
