/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Link,
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for How Do You Do</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          howdoyoudo<span style={{ color: '#00e600' }}>.</span>
        </Text>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We got a request to reset your password. Click below to choose a new one.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          Didn't request this? No worries - your password stays the same if you ignore this.
        </Text>
              <Text style={legal}>
          By using How Do You Do you agree to our{' '}
          <Link href="https://howdoyoudo.group/terms" style={link}>
            Terms &amp; Privacy Policy
          </Link>
          .
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const brand = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#121212',
  margin: '0 0 28px',
  paddingBottom: '20px',
  borderBottom: '2px solid #121212',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#121212',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#666666',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: '#00e600',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600' as const,
  borderRadius: '6px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
const legal = { fontSize: '11px', color: '#999999', margin: '16px 0 0', lineHeight: '1.5' }
const link = { color: 'inherit', textDecoration: 'underline' }
