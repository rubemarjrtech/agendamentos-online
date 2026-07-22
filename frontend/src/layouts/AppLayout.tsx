import { Outlet } from 'react-router';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      // Header Aqui
      <main className="grow py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
