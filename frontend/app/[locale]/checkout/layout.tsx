// Checkout pages get no header/footer — fully focused layout
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-artic-light-bg">{children}</div>;
}
