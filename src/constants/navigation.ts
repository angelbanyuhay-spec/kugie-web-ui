export const LOGO_URL = '/images/logo.png';

export interface NavLinkChild {
  name: string;
  href: string;
}

export interface NavLink {
  name: string;
  id: string;
  href: string;
  children?: readonly NavLinkChild[];
}

export const NAV_LINKS: readonly NavLink[] = [
  { name: 'Home', id: 'home', href: '/' },
  { name: 'Menu', id: 'menu', href: '/#menu' },
  { name: 'Contact', id: 'contact', href: '/#contact' },
];

export const QUICK_LINKS = [
  { name: 'Menu', href: '/#menu' },
  { name: 'Contact', href: '/#contact' },
];
