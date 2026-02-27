import type { ComponentType } from 'react';
import { LayoutDashboard, CandlestickChart } from 'lucide-react';

/**
 * Navigation Item Interface
 */
export interface NavItem {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * Shared Navigation Items
 * Used by both mobile bottom tabs and desktop sidebar
 * New items are added during lessons (Analysis page in lesson 1, etc.)
 */
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/analysis',
    label: 'Analysis',
    icon: CandlestickChart,
  },
];

/**
 * Determines if a navigation item is active based on current pathname
 *
 * @param path - The navigation item's path
 * @param currentPathname - The current location pathname
 * @returns True if the nav item should be highlighted as active
 */
export const isNavItemActive = (path: string, currentPathname: string): boolean => {
  if (path === '/') {
    // For root path, check exact match or /stock/:symbol
    return currentPathname === '/' || currentPathname.startsWith('/stock/');
  }
  // For other paths, match if current path starts with the nav path
  return currentPathname.startsWith(path);
};
