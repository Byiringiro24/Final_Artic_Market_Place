import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Button, Hr, Preview } from '@react-email/components';

interface Props { name: string; resetUrl: string }

export function PasswordResetEmail({ name, resetUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Reset your ARTIC Marketplace password</Preview>
      <Body style={{ backgroundColor: '#f4f4f4', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <Section style={{ backgroundColor: '#131921', padding: '20px 40px' }}>
            <Text style={{ color: '#FF9900', fontSize: 24, fontWeight: 900, margin: 0 }}>ARTIC marketplace</Text>
          </Section>
          <Section style={{ padding: '40px' }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: '#131921' }}>Password Reset Request</Text>
            <Text style={{ color: '#555', lineHeight: 1.6 }}>
              Hi {name},<br /><br />
              We received a request to reset the password for your ARTIC Marketplace account.
              Click the button below to create a new password. This link expires in <strong>1 hour</strong>.
            </Text>
            <Button
              href={resetUrl}
              style={{ backgroundColor: '#FF9900', color: '#000', padding: '14px 32px', borderRadius: 24, fontWeight: 700, textDecoration: 'none', display: 'inline-block', marginTop: 20 }}
            >
              Reset Password
            </Button>
            <Text style={{ color: '#999', fontSize: 12, marginTop: 24 }}>
              If you didn&apos;t request a password reset, you can safely ignore this email.
              Your password will not be changed.
            </Text>
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
