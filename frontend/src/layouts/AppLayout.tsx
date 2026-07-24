import { Outlet } from 'react-router';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
