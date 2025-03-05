import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumPlan from '@/components/PremiumPlan';

describe('PremiumPlan Component', () => {
  beforeEach(() => {
    // Restaurar todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock do window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: jest.fn() },
      writable: true,
    });
    
    // Mock do alert
    global.alert = jest.fn();
  });

  it('renderiza o plano premium corretamente', () => {
    render(<PremiumPlan />);
    
    expect(screen.getByText(/Plano Premium/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 15\/mês/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancele quando quiser/i)).toBeInTheDocument();
    expect(screen.getByText(/Buscas ilimitadas por dia/i)).toBeInTheDocument();
    expect(screen.getByText(/Receba mais de 10 vagas por busca/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrega prioritária por e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtros avançados de busca/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Assinar Premium/i })).toBeInTheDocument();
  });

  it('inicia o processo de assinatura ao clicar no botão', async () => {
    render(<PremiumPlan />);
    
    // Clicar no botão de assinar
    fireEvent.click(screen.getByRole('button', { name: /Assinar Premium/i }));
    
    // Verificar se o botão mostra estado de carregamento
    expect(screen.getByText(/Processando/i)).toBeInTheDocument();
    
    // Esperar pelo alerta de redirecionamento
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Você será redirecionado para a página de pagamento.');
    });
    
    // Verificar se o redirecionamento foi chamado
    await waitFor(() => {
      expect(window.location.href).toBe('#pagamento');
    });
  });

  it('exibe todos os benefícios do plano premium', () => {
    render(<PremiumPlan />);
    
    const beneficios = [
      'Buscas ilimitadas por dia',
      'Receba mais de 10 vagas por busca',
      'Entrega prioritária por e-mail',
      'Filtros avançados de busca',
    ];
    
    beneficios.forEach(beneficio => {
      expect(screen.getByText(beneficio)).toBeInTheDocument();
    });
  });

  it('tem estilo visual destacado para chamar atenção', () => {
    render(<PremiumPlan />);
    
    // Verificar se o componente tem o gradiente de fundo
    const premiumCard = screen.getByText(/Plano Premium/i).closest('div');
    expect(premiumCard).toHaveClass('bg-gradient-to-br');
    
    // Verificar se o botão tem estilo contrastante
    const button = screen.getByRole('button', { name: /Assinar Premium/i });
    expect(button).toHaveClass('btn-secondary');
  });
});