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

interface WelcomeEmailProps {
  userEmail: string;
  appUrl: string;
}

export const WelcomeEmail = ({
  userEmail,
  appUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Bienvenido a Travel Connect! Tu aventura comienza aquí</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com/lovable-uploads/90c53862-4b60-4e45-bb48-e917b024bf6c.png"
            width="50"
            height="50"
            alt="Travel Connect"
            style={logo}
          />
          <Heading style={h1}>¡Bienvenido a Travel Connect!</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>🎉 ¡Tu cuenta está lista!</Heading>
          
          <Text style={welcomeText}>
            ¡Hola y bienvenido a Travel Connect!
          </Text>

          <Text style={text}>
            Estamos emocionados de tenerte en nuestra comunidad de viajeros. Tu cuenta <strong>{userEmail}</strong> ha sido 
            confirmada exitosamente y ya puedes comenzar a explorar el mundo con nosotros.
          </Text>

          <Section style={featuresBox}>
            <Heading style={featuresTitle}>🌟 ¿Qué puedes hacer ahora?</Heading>
            
            <div style={featureItem}>
              <Text style={featureText}>
                ✈️ <strong>Planifica tus viajes:</strong> Crea itinerarios detallados y organiza todos los aspectos de tu aventura
              </Text>
            </div>
            
            <div style={featureItem}>
              <Text style={featureText}>
                🗺️ <strong>Explora destinos:</strong> Descubre lugares increíbles y guarda tus favoritos
              </Text>
            </div>
            
            <div style={featureItem}>
              <Text style={featureText}>
                👥 <strong>Conecta con otros viajeros:</strong> Únete a la comunidad y comparte experiencias
              </Text>
            </div>
            
            <div style={featureItem}>
              <Text style={featureText}>
                📱 <strong>Gestión en tiempo real:</strong> Accede a toda tu información desde cualquier dispositivo
              </Text>
            </div>
          </Section>

          <Section style={buttonContainer}>
            <Button href={appUrl} style={button}>
              Comenzar mi aventura
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={tipsBox}>
            <Heading style={tipsTitle}>💡 Consejos para empezar</Heading>
            <Text style={tipText}>
              1. <strong>Completa tu perfil:</strong> Añade información personal y una foto para conectar mejor con otros viajeros
            </Text>
            <Text style={tipText}>
              2. <strong>Crea tu primer viaje:</strong> Comienza planificando tu próxima aventura
            </Text>
            <Text style={tipText}>
              3. <strong>Explora la comunidad:</strong> Descubre qué están haciendo otros viajeros
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={supportText}>
            Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para hacer que tu experiencia 
            de viaje sea increíble.
          </Text>

          <Text style={thankYouText}>
            ¡Gracias por unirte a Travel Connect y que tengas excelentes aventuras! 🌍
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            El equipo de Travel Connect
          </Text>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} Travel Connect. Todos los derechos reservados.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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
  background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  color: '#ffffff',
};

const logo = {
  margin: '0 auto 10px auto',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
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

const welcomeText = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const featuresBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const featuresTitle = {
  color: '#0369a1',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const featureItem = {
  margin: '12px 0',
};

const featureText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '1.5',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const tipsBox = {
  backgroundColor: '#fef7ed',
  border: '1px solid #f97316',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const tipsTitle = {
  color: '#ea580c',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const tipText = {
  color: '#9a3412',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const supportText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const thankYouText = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '1.5',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const footer = {
  padding: '20px 32px',
  textAlign: 'center' as const,
  backgroundColor: '#f9fafb',
};

const footerText = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const footerCopyright = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
};