import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import AdminBar from '@/components/layout/AdminBar';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminBar />
      <Header />
      <CartSidebar />
      {children}
      <Footer />
    </>
  );
}
