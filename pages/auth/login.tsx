import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { type ReactElement, useEffect, useState, useRef } from 'react';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import GithubButton from '@/components/auth/GithubButton';
import GoogleButton from '@/components/auth/GoogleButton';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import { authProviderEnabled } from '@/lib/auth';
import Head from 'next/head';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import GoogleReCAPTCHA from '@/components/shared/GoogleReCAPTCHA';
import ReCAPTCHA from 'react-google-recaptcha';
import { maxLengthPolicies } from '@/lib/common';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ csrfToken, authProviders, recaptchaSiteKey }) => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [recaptchaToken, setRecaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const { error, success, token } = router.query as {
    error: string;
    success: string;
    token: string;
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email().max(maxLengthPolicies.email),
      password: Yup.string().required().max(maxLengthPolicies.password),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      setMessage({ text: null, status: null });

      const response = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
        callbackUrl: redirectUrl,
        recaptchaToken,
      });

      formik.resetForm();
      recaptchaRef.current?.reset();

      if (response && !response.ok) {
        setMessage({ text: response.error, status: 'error' });
        return;
      }
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('login-title')}</title>
      </Head>

      {/* UI8 Core 2.0 Login Form */}
      <div className="card-ui8 max-w-md mx-auto">
        {message.text && message.status && (
          <div className={`mb-6 p-4 rounded-ui8 border ${
            message.status === 'error'
              ? 'bg-error-50 border-error-200 text-error-700'
              : 'bg-success-50 border-success-200 text-success-700'
          }`}>
            {t(message.text)}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          {authProviders.github && <GithubButton />}
          {authProviders.google && <GoogleButton />}
        </div>

        {(authProviders.github || authProviders.google) &&
          authProviders.credentials && (
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('or')}</span>
              </div>
            </div>
          )}

        {/* Email/Password Form */}
        {authProviders.credentials && (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={t('email')}
                value={formik.values.email}
                onChange={formik.handleChange}
                className={`w-full px-4 py-3 rounded-ui8 border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                } focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all duration-200`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-error-600">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  {t('forgot-password')}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  placeholder={t('password')}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  className={`w-full px-4 py-3 pr-12 rounded-ui8 border ${
                    formik.touched.password && formik.errors.password
                      ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  } focus:ring-2 focus:ring-offset-2 focus:outline-none transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={handlePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {isPasswordVisible ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-error-600">{formik.errors.password}</p>
              )}
            </div>

            <GoogleReCAPTCHA
              recaptchaRef={recaptchaRef}
              onChange={setRecaptchaToken}
              siteKey={recaptchaSiteKey}
            />

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full btn-ui8-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('signing-in')}...
                </div>
              ) : (
                t('sign-in')
              )}
            </button>

            <AgreeMessage text={t('sign-in')} />
          </form>
        )}

        {/* Additional Auth Options */}
        {(authProviders.email || authProviders.saml) && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">More options</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {authProviders.email && (
            <Link
              href={`/auth/magic-link${params}`}
              className="btn-ui8-outline w-full justify-center"
            >
              {t('sign-in-with-email')}
            </Link>
          )}

          {authProviders.saml && (
            <Link href="/auth/sso" className="btn-ui8-outline w-full justify-center">
              {t('continue-with-saml-sso')}
            </Link>
          )}
        </div>
      </div>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        {t('dont-have-an-account')}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-primary-600 hover:text-primary-700 ml-1 transition-colors duration-200"
        >
          {t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      csrfToken: await getCsrfToken(context),
      authProviders: authProviderEnabled(),
      recaptchaSiteKey: env.recaptcha.siteKey,
    },
  };
};

export default Login;
