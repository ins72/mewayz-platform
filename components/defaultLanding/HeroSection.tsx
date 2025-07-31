import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const HeroSection = () => {
  const { t } = useTranslation('common');
  return (
    <div className="text-center py-20 lg:py-32">
      <div className="max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-full mb-8">
          <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
          MEWAYZ Creator Economy Platform
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Build Your
          <span className="text-primary-600"> Creator Empire</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          The ultimate platform for creators to monetize, grow, and scale their digital business with enterprise-grade tools.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/join"
            className="btn-ui8-primary text-lg px-8 py-4"
          >
            {t('get-started')} - It's Free
          </Link>
          <Link
            href="https://github.com/boxyhq/saas-starter-kit"
            className="btn-ui8-outline text-lg px-8 py-4"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600">Active Creators</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">$2M+</div>
            <div className="text-gray-600">Revenue Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
