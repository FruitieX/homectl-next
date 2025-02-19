import Link from 'next/link';
import { LayoutDashboard, List, Map } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useIsFullscreen } from '@/hooks/isFullscreen';

type Route = 'Dashboard' | 'Floorplan' | 'Groups';

const getRoute = (pathname: string | null): Route => {
  if (pathname === '/' || pathname === '/dashboard') {
    return 'Dashboard';
  } else if (pathname === '/map') {
    return 'Floorplan';
  } else if (pathname === '/groups') {
    return 'Groups';
  } else if (pathname?.startsWith('/groups/')) {
    return 'Groups';
  } else {
    return 'Dashboard';
  }
};

export const BottomNavigation = () => {
  const pathname = usePathname();
  const route = getRoute(pathname);

  const [isFullscreen] = useIsFullscreen();

  if (isFullscreen) {
    return null;
  }

  return (
    <div className="btm-nav relative z-30 min-h-0 flex-shrink-0 bg-opacity-75 backdrop-blur">
      <Link
        className={route === 'Dashboard' ? 'active bg-opacity-0' : ''}
        href="/"
      >
        <LayoutDashboard />
        <span className="btm-nav-label">Dashboard</span>
      </Link>
      <Link
        className={route === 'Floorplan' ? 'active bg-opacity-0' : ''}
        href="/map"
      >
        <Map />
        <span className="btm-nav-label">Floorplan</span>
      </Link>
      <Link
        className={route === 'Groups' ? 'active bg-opacity-0' : ''}
        href="/groups"
      >
        <List />
        <span className="btm-nav-label">Groups</span>
      </Link>
    </div>
  );
};
