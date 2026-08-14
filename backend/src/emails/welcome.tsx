import * as React from 'react';
import {
  Html, Head, Body, Container, Section, Text,
  Button, Hr, Img, Preview,
} from '@react-email/components';

interface Props {
  name: string;
  verifyUrl: string;
}

export function WelcomeEmail({ name, verifyUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ARTIC Marketplace — verify your email</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#131921', padding: '20px 40px' }}>
            <Text style={{ color: '#FF9900', fontSize: 28, fontWeight: 900, margin: 0 }}>
              ARTIC marketplace
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ padding: '40px' }}>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#131921', marginBottom: 8 }}>
              Welcome, {name}! 👋
            </Text>
            <Text style={{ color: '#555', lineHeight: 1.6 }}>
              Your ARTIC Marketplace account has been created. Please verify your email address to
              activate your account and start shopping.
            </Text>

            <Button
              href={verifyUrl}
              style={{
                backgroundColor: '#FF9900',
                color: '#000',
                padding: '14px 32px',
                borderRadius: 24,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: 24,
              }}
            >
              Verify Email Address
            </Button>

            <Text style={{ color: '#999', fontSize: 12, marginTop: 24 }}>
              This link expires in 24 hours. If you didn&apos;t create an account, you can safely ignore this email.
            </Text>
          </Section>

          <Hr style={{ borderColor: '#eee' }} />
          <Section style={{ padding: '20px 40px', backgroundColor: '#f9f9f9' }}>
            <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>
              © {new Date().getFullYear()} ARTIC Marketplace. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
