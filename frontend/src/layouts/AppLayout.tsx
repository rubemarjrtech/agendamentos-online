import { Footer } from '@components/Footer';
import { Header } from '@components/Header';
import { Outlet } from 'react-router';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="grow">
        <Header />
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default AppLayout;
