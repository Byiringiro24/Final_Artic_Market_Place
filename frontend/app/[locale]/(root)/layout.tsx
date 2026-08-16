import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import AdminBar from '@/components/layout/AdminBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminBar />
      <Header />
      <CartSidebar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
