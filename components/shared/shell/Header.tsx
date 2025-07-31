import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import { useTranslation } from 'next-i18next';
import { useCustomSignOut } from 'hooks/useCustomSignout';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { toggleTheme } = useTheme();
  const { status, data } = useSession();
  const { t } = useTranslation('common');
  const signOut = useCustomSignOut();

  if (status === 'loading' || !data) {
    return null;
  }

  const { user } = data;

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b border-gray-200 bg-white shadow-ui8-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-ui8 transition-all duration-200 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">{t('open-sidebar')}</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="relative">
            <div className="flex items-center cursor-pointer group" tabIndex={0}>
              <span className="hidden lg:flex lg:items-center">
                <button
                  className="ml-4 text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors duration-200"
                  aria-hidden="true"
                >
                  {user.name}
                </button>
                <ChevronDownIcon
                  className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
                  aria-hidden="true"
                />
              </span>
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-ui8 shadow-ui8-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings/account"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                >
                  <UserCircleIcon className="w-4 h-4 mr-3" />
                  {t('account')}
                </Link>

                {env.darkModeEnabled && (
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                    type="button"
                    onClick={toggleTheme}
                  >
                    <SunIcon className="w-4 h-4 mr-3" />
                    {t('switch-theme')}
                  </button>
                )}

                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                  type="button"
                  onClick={signOut}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
