import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';

import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { AccountLayout } from '@/components/layouts';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  // Add mixpanel
  useEffect(() => {
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }
  }, []);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
        <link rel="icon" href="https://boxyhq.com/img/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <Toaster
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '0.75rem',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              border: '1px solid #f3f4f6',
            },
          }}
        />
        <div className="min-h-screen bg-gray-50">
          {getLayout(<Component {...props} />)}
        </div>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
