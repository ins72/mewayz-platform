import app from '@/lib/app';
import Image from 'next/image';
import useTheme from 'hooks/useTheme';

const Brand = () => {
  const { theme } = useTheme();
  return (
    <div className="flex pt-6 shrink-0 items-center">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary-500 rounded-ui8 shadow-ui8-md">
          <Image
            src={theme !== 'dark' ? app.logoUrl : '/logowhite.png'}
            alt={app.name}
            width={24}
            height={24}
            className="text-white"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{app.name}</h1>
          <p className="text-xs text-gray-500 font-medium">MEWAYZ Platform</p>
        </div>
      </div>
    </div>
  );
};

export default Brand;
