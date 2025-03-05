import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobForm from '@/components/JobForm';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock da fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, message: 'Busca realizada com sucesso!' }),
  })
) as jest.Mock;

describe('JobForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza o formulário corretamente', () => {
    render(<JobForm />);
    
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Localização/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/País/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Vaga/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buscar Vagas/i })).toBeInTheDocument();
  });

  it('permite preencher os campos do formulário', async () => {
    render(<JobForm />);
    
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@exemplo.com');
    await userEvent.type(screen.getByLabelText(/Localização/i), 'São Paulo');
    await userEvent.type(screen.getByLabelText(/País/i), 'Brasil');
    await userEvent.type(screen.getByLabelText(/Tipo de Vaga/i), 'Desenvolvedor Frontend');
    
    expect(screen.getByLabelText(/E-mail/i)).toHaveValue('teste@exemplo.com');
    expect(screen.getByLabelText(/Localização/i)).toHaveValue('São Paulo');
    expect(screen.getByLabelText(/País/i)).toHaveValue('Brasil');
    expect(screen.getByLabelText(/Tipo de Vaga/i)).toHaveValue('Desenvolvedor Frontend');
  });

  it('envia o formulário corretamente', async () => {
    render(<JobForm />);
    
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@exemplo.com');
    await userEvent.type(screen.getByLabelText(/Localização/i), 'São Paulo');
    await userEvent.type(screen.getByLabelText(/País/i), 'Brasil');
    await userEvent.type(screen.getByLabelText(/Tipo de Vaga/i), 'Desenvolvedor Frontend');
    
    fireEvent.click(screen.getByRole('button', { name: /Buscar Vagas/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'teste@exemplo.com',
          location: 'São Paulo',
          country: 'Brasil',
          jobType: 'Desenvolvedor Frontend',
        }),
      });
    });
  });

  it('mostra mensagem de erro quando o limite de buscas é atingido', async () => {
    // Mock para simular usuário não premium que já atingiu o limite
    render(<JobForm />);
    
    // Simular que o usuário já fez uma busca
    await userEvent.type(screen.getByLabelText(/E-mail/i), 'teste@exemplo.com');
    await userEvent.type(screen.getByLabelText(/Localização/i), 'São Paulo');
    await userEvent.type(screen.getByLabelText(/País/i), 'Brasil');
    await userEvent.type(screen.getByLabelText(/Tipo de Vaga/i), 'Desenvolvedor Frontend');
    
    // Primeira busca (deve funcionar)
    fireEvent.click(screen.getByRole('button', { name: /Buscar Vagas/i }));
    
    // Segunda busca (deve mostrar erro de limite)
    fireEvent.click(screen.getByRole('button', { name: /Buscar Vagas/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Você atingiu seu limite diário de buscas/i)).toBeInTheDocument();
    });
  });
});