import Link from 'next/link';
import classNames from 'classnames';

export interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: MenuItem[];
}

interface NavigationItemProps {
  menu: MenuItem;
  className?: string;
}

const NavigationItems = ({ menus }: NavigationItemsProps) => {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-2">
      {menus.map((menu) => (
        <li key={menu.name}>
          <NavigationItem menu={menu} />
          {menu.items && (
            <ul className="flex flex-col gap-1 mt-2 ml-4 border-l border-gray-200 pl-4">
              {menu.items.map((subitem) => (
                <li key={subitem.name}>
                  <NavigationItem menu={subitem} className="text-sm" />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};

const NavigationItem = ({ menu, className }: NavigationItemProps) => {
  return (
    <Link
      href={menu.href}
      className={`group flex items-center rounded-ui8 text-sm font-medium transition-all duration-200 px-3 py-2.5 gap-3 ${
        menu.active
          ? 'text-primary-600 bg-primary-50 border border-primary-200 shadow-ui8-sm'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
      } ${className || ''}`}
    >
      {menu.icon && (
        <menu.icon
          className={classNames({
            'h-5 w-5 shrink-0 transition-colors duration-200': true,
            'text-primary-600': menu.active,
            'text-gray-400 group-hover:text-gray-600': !menu.active,
          })}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{menu.name}</span>
    </Link>
  );
};

export default NavigationItems;
