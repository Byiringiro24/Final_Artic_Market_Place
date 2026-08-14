import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Button, Hr, Preview, Row, Column, Img } from '@react-email/components';

interface OrderItem { name: string; image: string; slug: string }
interface Props { customerName: string; items: OrderItem[]; reviewBaseUrl: string }

export function ReviewRequestEmail({ customerName, items, reviewBaseUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>How was your ARTIC Marketplace order? Leave a review!</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <Section style={{ backgroundColor: '#131921', padding: '20px 40px' }}>
            <Text style={{ color: '#FF9900', fontSize: 24, fontWeight: 900, margin: 0 }}>ARTIC marketplace</Text>
          </Section>
          <Section style={{ padding: '40px' }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#131921' }}>How was your order?</Text>
            <Text style={{ color: '#555', lineHeight: 1.6 }}>
              Hi {customerName}, your recent order was delivered. We&apos;d love to hear what you think!
              Your reviews help other shoppers make better decisions.
            </Text>

            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
                <Column style={{ width: 80 }}>
                  <Img src={item.image} alt={item.name} width={60} height={60} style={{ objectFit: 'contain', borderRadius: 4 }} />
                </Column>
                <Column style={{ paddingLeft: 16 }}>
                  <Text style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</Text>
                  <Button
                    href={`${reviewBaseUrl}/product/${item.slug}#reviews`}
                    style={{ backgroundColor: '#FF9900', color: '#000', padding: '8px 20px', borderRadius: 16, fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}
                  >
                    ★ Write a Review
                  </Button>
                </Column>
              </Row>
            ))}
          </Section>
          <Hr style={{ borderColor: '#eee' }} />
          <Section style={{ padding: '16px 40px', textAlign: 'center' }}>
            <Text style={{ color: '#999', fontSize: 12 }}>© {new Date().getFullYear()} ARTIC Marketplace</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
