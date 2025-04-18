'use client';

import { Provider as JotaiProvider } from 'jotai';
import { useProvideWebsocketState } from '@/hooks/websocket';
import '@/styles/globals.css';
import { HomectlBottomNavigation } from '@/ui/BottomNavigation';
import { ColorPickerModal } from '@/ui/ColorPickerModal';
import { Navbar } from '@/ui/Navbar';
import { SaveSceneModal } from '@/ui/SaveSceneModal';
import { SceneModal } from '@/ui/SceneModal';
import { useProvideAppConfig } from '@/hooks/appConfig';
import { useEffect } from 'react';
import { CarHeaterModal } from './dashboard/CarHeaterModal';
import { useProvideInfluxDb } from '@/hooks/influxdb';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <JotaiProvider>{children}</JotaiProvider>;
};

export const ProvideAppConfig = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const appConfigLoaded = useProvideAppConfig();
  if (!appConfigLoaded) return null;

  return children;
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useProvideWebsocketState();
  useProvideInfluxDb();

  // Reload app at 4am
  useEffect(() => {
    const now = new Date();
    const reloadAt = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      4,
      0,
      0,
    );
    reloadAt.setDate(reloadAt.getDate() + 1);

    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, reloadAt.getTime() - now.getTime());

    return () => {
      clearTimeout(reloadTimeout);
    };
  });

  return (
    <>
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <HomectlBottomNavigation />
      <ColorPickerModal />
      <SaveSceneModal />
      <SceneModal />
      <CarHeaterModal />
    </>
  );
};
