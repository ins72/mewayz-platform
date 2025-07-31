import Link from 'next/link';
import { type ReactElement } from 'react';
import { useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from 'types';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import FAQSection from '@/components/defaultLanding/FAQSection';
import HeroSection from '@/components/defaultLanding/HeroSection';
import FeatureSection from '@/components/defaultLanding/FeatureSection';
import PricingSection from '@/components/defaultLanding/PricingSection';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import Head from 'next/head';

const Home: NextPageWithLayout = () => {
  const { toggleTheme, selectedTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>{t('homepage-title')}</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* UI8 Core 2.0 Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-ui8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">MEWAYZ</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {env.darkModeEnabled && (
                  <button
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-ui8 transition-all duration-200"
                    onClick={toggleTheme}
                  >
                    <selectedTheme.icon className="w-5 h-5" />
                  </button>
                )}
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  {t('sign-in')}
                </Link>
                <Link
                  href="/auth/join"
                  className="btn-ui8-primary"
                >
                  {t('sign-up')}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* UI8 Core 2.0 Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <HeroSection />
          <div className="my-16 border-t border-gray-200"></div>
          <FeatureSection />
          <div className="my-16 border-t border-gray-200"></div>
          <PricingSection />
          <div className="my-16 border-t border-gray-200"></div>
          <FAQSection />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  // Redirect to login page if landing page is disabled
  if (env.hideLandingPage) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: true,
      },
    };
  }

  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <>{page}</>;
};

export default Home;
