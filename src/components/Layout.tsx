import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-2xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};
