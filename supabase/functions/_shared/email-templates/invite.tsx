/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join How Do You Do</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>
          howdoyoudo<span style={{ color: '#00e600' }}>.</span>
        </Text>
        <Heading style={h1}>You're invited</Heading>
        <Text style={text}>
          Someone invited you to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>How Do You Do</strong>
          </Link>
          . Accept below to create your account.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accept Invitation
        </Button>
        <Text style={footer}>
          Wasn't expecting this? No action needed - just ignore it.
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

export default InviteEmail

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
const link = { color: 'inherit', textDecoration: 'underline' }
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
