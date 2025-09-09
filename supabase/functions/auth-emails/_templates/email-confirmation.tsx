import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Img,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface EmailConfirmationProps {
  userEmail: string;
  confirmationUrl: string;
  token: string;
}

export const EmailConfirmationEmail = ({
  userEmail,
  confirmationUrl,
  token,
}: EmailConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Confirma tu cuenta en GOveling</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="/lovable-uploads/5b39ea7f-8421-4c2d-a8fb-249eed3cb27b.png"
            width="200"
            height="100"
            alt="GOveling"
            style={logo}
          />
          <Heading style={h1}>GOveling</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>¡Confirma tu cuenta!</Heading>
          <Text style={text}>
            Hola y bienvenido a GOveling. Para completar el registro de tu cuenta <strong>{userEmail}</strong>, 
            necesitamos que confirmes tu dirección de correo electrónico.
          </Text>

          <Section style={buttonContainer}>
            <Button href={confirmationUrl} style={button}>
              Confirmar mi cuenta
            </Button>
          </Section>

          <Text style={text}>
            Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
          </Text>
          <Text style={linkText}>{confirmationUrl}</Text>

          <Hr style={hr} />

          <Text style={codeText}>
            O ingresa este código de verificación:
          </Text>
          <Text style={code}>{token}</Text>

          <Hr style={hr} />

          <Text style={footerText}>
            Si no has creado una cuenta en GOveling, puedes ignorar este correo de forma segura.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} GOveling. Todos los derechos reservados.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '20px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#1e40af',
  color: '#ffffff',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '10px 0 0 0',
  padding: '0',
  lineHeight: '1.3',
};

const content = {
  padding: '32px',
};

const h2 = {
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0',
};

const linkText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.4',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const codeText = {
  color: '#374151',
  fontSize: '14px',
  margin: '16px 0 8px 0',
  textAlign: 'center' as const,
};

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};

const footer = {
  padding: '20px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerCopyright = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
};