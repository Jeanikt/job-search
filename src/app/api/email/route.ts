import { NextRequest, NextResponse } from 'next/server';
import { sendJobsEmail, verifyEmailConnection } from '@/lib/emailSender';
import { z } from 'zod';

// Schema de validação para os parâmetros de email
const emailParamsSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  jobs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    company: z.string(),
    location: z.string(),
    country: z.string(),
    description: z.string(),
    url: z.string().url(),
    postedAt: z.string().or(z.date()),
  })).min(1, { message: 'É necessário fornecer pelo menos uma vaga' }),
  searchParams: z.object({
    location: z.string(),
    country: z.string(),
    jobType: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar conexão com o servidor de email
    const isEmailServerConnected = await verifyEmailConnection();
    if (!isEmailServerConnected) {
      return NextResponse.json(
        { success: false, message: 'Não foi possível conectar ao servidor de email' },
        { status: 500 }
      );
    }
    
    // Obter e validar os dados da requisição
    const body = await request.json();
    
    const result = emailParamsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Dados inválidos', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const { email, jobs, searchParams } = result.data;
    
    // Enviar email com as vagas
    await sendJobsEmail(email, jobs, searchParams);
    
    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
    });
    
  } catch (error) {
    console.error('Erro na API de email:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}