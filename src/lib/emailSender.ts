import nodemailer from 'nodemailer';
import { Job } from './types';

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Função para enviar email com as vagas encontradas
export async function sendJobsEmail(
  email: string, 
  jobs: Job[], 
  searchParams: { location: string; country: string; jobType: string }
) {
  // Criar HTML para o corpo do email
  const jobListHtml = jobs.map(job => `
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h3 style="margin-top: 0; color: #3a4eeb;">${job.title}</h3>
      <p style="margin: 5px 0;"><strong>Empresa:</strong> ${job.company}</p>
      <p style="margin: 5px 0;"><strong>Localização:</strong> ${job.location}, ${job.country}</p>
      <p style="margin: 5px 0;"><strong>Data de publicação:</strong> ${new Date(job.postedAt).toLocaleDateString('pt-BR')}</p>
      <p style="margin: 10px 0;">${job.description.substring(0, 150)}...</p>
      <a href="${job.url}" style="display: inline-block; background-color: #3a4eeb; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px;">Ver vaga</a>
    </div>
  `).join('');

  // Configuração do email
  const mailOptions = {
    from: `"Assistente de Busca de Vagas" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Vagas de ${searchParams.jobType} em ${searchParams.location}, ${searchParams.country}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f6ef7; padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">Vagas Encontradas</h1>
          <p style="margin: 10px 0 0;">Confira as vagas de ${searchParams.jobType} em ${searchParams.location}, ${searchParams.country}</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
          <p>Olá,</p>
          <p>Encontramos ${jobs.length} vagas que correspondem à sua busca. Confira abaixo:</p>
          
          <div style="margin: 30px 0;">
            ${jobListHtml}
          </div>
          
          <p>Para realizar novas buscas ou assinar nosso plano Premium, acesse nosso site.</p>
          <p>Atenciosamente,<br>Equipe do Assistente de Busca de Vagas</p>
        </div>
        
        <div style="text-align: center; padding: 15px; font-size: 12px; color: #64748b;">
          <p>© 2025 Assistente de Busca de Vagas. Todos os direitos reservados.</p>
          <p>Se não deseja mais receber nossos emails, <a href="#" style="color: #3a4eeb;">cancele sua inscrição</a>.</p>
        </div>
      </div>
    `,
  };

  // Enviar o email
  return transporter.sendMail(mailOptions);
}

// Verificar conexão com o servidor de email
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão com servidor de email:', error);
    return false;
  }
}