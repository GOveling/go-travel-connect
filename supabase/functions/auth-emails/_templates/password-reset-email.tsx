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

interface PasswordResetEmailProps {
  userEmail: string;
  resetUrl: string;
  token: string;
}

export const PasswordResetEmail = ({
  userEmail,
  resetUrl,
  token,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Restablece tu contraseña en GOveling</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com/assets/goveling-logo.png"
            width="40"
            height="40"
            alt="GOveling"
            style={logo}
          />
          <Heading style={h1}>GOveling</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>🔒 Restablece tu contraseña</Heading>
          <Text style={text}>
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta <strong>{userEmail}</strong>.
          </Text>

          <Text style={text}>
            Si has solicitado restablecer tu contraseña, haz clic en el botón de abajo para crear una nueva:
          </Text>

          <Section style={buttonContainer}>
            <Button href={resetUrl} style={button}>
              Restablecer contraseña
            </Button>
          </Section>

          <Text style={text}>
            Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:
          </Text>
          <Text style={linkText}>{resetUrl}</Text>

          <Hr style={hr} />

          <Text style={codeText}>
            O ingresa este código de verificación:
          </Text>
          <Text style={code}>{token}</Text>

          <Hr style={hr} />

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
            </Text>
            <Text style={warningText}>
              Si no has solicitado restablecer tu contraseña, puedes ignorar este correo de forma segura. 
              Tu contraseña no será modificada.
            </Text>
          </Section>
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

export default PasswordResetEmail;

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
  backgroundColor: '#dc2626',
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
  color: '#dc2626',
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
  backgroundColor: '#dc2626',
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
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  textAlign: 'center' as const,
  fontFamily: 'monospace',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
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