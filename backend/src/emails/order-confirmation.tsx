import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Text,
  Button, Hr, Row, Column, Preview,
} from '@react-email/components';

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface Props {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  expectedDelivery: string;
  items: OrderItem[];
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  trackOrderUrl: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    country: string;
  };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export function OrderConfirmationEmail({
  customerName, orderNumber, orderDate, expectedDelivery,
  items, itemsPrice, shippingPrice, taxPrice, totalPrice,
  trackOrderUrl, shippingAddress,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Order {orderNumber} confirmed — Thank you, {customerName}!</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#131921', padding: '20px 40px' }}>
            <Text style={{ color: '#FF9900', fontSize: 24, fontWeight: 900, margin: 0 }}>ARTIC marketplace</Text>
          </Section>

          {/* Hero */}
          <Section style={{ backgroundColor: '#232F3E', padding: '30px 40px', textAlign: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>
              Order Confirmed ✓
            </Text>
            <Text style={{ color: '#ccc', fontSize: 14, margin: '8px 0 0' }}>
              Thank you, {customerName}. Your order is being processed.
            </Text>
          </Section>

          {/* Order info */}
          <Section style={{ padding: '30px 40px' }}>
            <Row>
              <Column>
                <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>ORDER NUMBER</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: '#131921', margin: 0 }}>{orderNumber}</Text>
              </Column>
              <Column>
                <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>ORDER DATE</Text>
                <Text style={{ fontSize: 14, color: '#333', margin: 0 }}>{orderDate}</Text>
              </Column>
              <Column>
                <Text style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>EST. DELIVERY</Text>
                <Text style={{ fontSize: 14, fontWeight: 700, color: '#007185', margin: 0 }}>{expectedDelivery}</Text>
              </Column>
            </Row>

            <Button
              href={trackOrderUrl}
              style={{ backgroundColor: '#FF9900', color: '#000', padding: '12px 28px', borderRadius: 20, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 20 }}
            >
              Track Your Order
            </Button>
          </Section>

          <Hr style={{ borderColor: '#eee', margin: '0 40px' }} />

          {/* Items */}
          <Section style={{ padding: '20px 40px' }}>
            <Text style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Order Items</Text>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #eee' }}>
                <Column style={{ width: 80 }}>
                  <Img src={item.image} alt={item.name} width={64} height={64} style={{ objectFit: 'contain', backgroundColor: '#f9f9f9', borderRadius: 4 }} />
                </Column>
                <Column style={{ paddingLeft: 12 }}>
                  <Text style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</Text>
                  <Text style={{ margin: '4px 0 0', color: '#555', fontSize: 13 }}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={{ margin: 0, fontWeight: 700 }}>{fmt(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          {/* Totals */}
          <Section style={{ padding: '0 40px 20px', backgroundColor: '#fafafa' }}>
            <Row><Column><Text style={{ color: '#555', margin: '4px 0' }}>Items:</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ margin: '4px 0' }}>{fmt(itemsPrice)}</Text></Column></Row>
            <Row><Column><Text style={{ color: '#555', margin: '4px 0' }}>Shipping:</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ margin: '4px 0', color: shippingPrice === 0 ? '#007600' : '#333' }}>{shippingPrice === 0 ? 'FREE' : fmt(shippingPrice)}</Text></Column></Row>
            <Row><Column><Text style={{ color: '#555', margin: '4px 0' }}>Tax:</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ margin: '4px 0' }}>{fmt(taxPrice)}</Text></Column></Row>
            <Hr style={{ borderColor: '#ddd' }} />
            <Row><Column><Text style={{ fontWeight: 700, fontSize: 16, margin: '4px 0' }}>Order Total:</Text></Column><Column style={{ textAlign: 'right' }}><Text style={{ fontWeight: 700, fontSize: 16, color: '#B12704', margin: '4px 0' }}>{fmt(totalPrice)}</Text></Column></Row>
          </Section>

          {/* Shipping */}
          <Section style={{ padding: '20px 40px' }}>
            <Text style={{ fontWeight: 700, marginBottom: 8 }}>Shipping to:</Text>
            <Text style={{ color: '#555', margin: 0 }}>
              {shippingAddress.fullName}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={{ borderColor: '#eee' }} />
          <Section style={{ padding: '20px 40px', textAlign: 'center' }}>
            <Text style={{ color: '#999', fontSize: 12 }}>
              Questions? Contact us at byiringirofabrice6@gmail.com<br />
              © {new Date().getFullYear()} ARTIC Marketplace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
