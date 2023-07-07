import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface KoalaWelcomeEmailProps {
  userFirstname: string;
}

const baseUrl = 'https://www.zksafe.pro';

const KoalaWelcomeEmail = ({
  userFirstname = 'Zeno',
}: KoalaWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>
      <h1>Welcome to ZkSafe</h1>
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/img/logo.svg`}
          width="170"
          height="50"
          alt="Koala"
          style={logo}
        />
        <Text style={paragraph}>Hi {userFirstname},</Text>
        <Text style={paragraph}>
          More professional and secure 0gas dex transaction, from ETH Lightning Network
        </Text>
        <Section style={btnContainer}>
          <Button pX={12} pY={12} style={button} href="https://www.zksafe.pro">
          Trade now
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The ZkSafe team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Enjoy professional 0gas dex safe transactions now</Text>
      </Container>
    </Body>
  </Html>
);

export default KoalaWelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const logo = {
  margin: '0 auto',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const btnContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#5F51E8',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
};
