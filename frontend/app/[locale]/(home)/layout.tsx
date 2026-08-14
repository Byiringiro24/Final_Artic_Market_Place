import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <CartSidebar />
      {children}
      <Footer />
    </>
  );
}
