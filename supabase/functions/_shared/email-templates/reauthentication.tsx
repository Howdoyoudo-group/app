/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Link,
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          howdoyoudo<span style={{ color: '#00e600' }}>.</span>
        </Text>
        <Heading style={h1}>Confirm your identity</Heading>
        <Text style={text}>Use this code to verify it's you:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code expires shortly. Didn't request it? Ignore this email.
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

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Space Mono', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#121212',
  letterSpacing: '4px',
  margin: '0 0 30px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
const legal = { fontSize: '11px', color: '#999999', margin: '16px 0 0', lineHeight: '1.5' }
const link = { color: 'inherit', textDecoration: 'underline' }
