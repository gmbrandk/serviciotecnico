import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ProgressBar } from '../Progressbar';

// Componente wrapper para poder simular step dinámico
function TestWrapper({ labels }) {
  const [step, setStep] = useState(0);

  return (
    <div>
      <ProgressBar step={step} labels={labels} />
      <button onClick={() => setStep((s) => s + 1)}>Next</button>
      <button onClick={() => setStep((s) => s - 1)}>Prev</button>
    </div>
  );
}

describe('ProgressBar animation hook', () => {
  const labels = ['Step 1', 'Step 2', 'Step 3'];

  test('marca el primer step como activo en inicio', () => {
    render(<TestWrapper labels={labels} />);
    const first = screen.getByText('Step 1');
    const second = screen.getByText('Step 2');
    expect(first).toHaveClass('active');
    expect(second).not.toHaveClass('active');
  });

  test('avanza y marca completed el paso anterior', async () => {
    render(<TestWrapper labels={labels} />);
    const user = userEvent.setup();

    const first = screen.getByText('Step 1');
    const second = screen.getByText('Step 2');

    await user.click(screen.getByText('Next'));

    expect(first).toHaveClass('completed');
    expect(second).toHaveClass('fill-step');
  });

  test('retrocede y marca active el paso previo', async () => {
    render(<TestWrapper labels={labels} />);
    const user = userEvent.setup();

    const first = screen.getByText('Step 1');
    const second = screen.getByText('Step 2');

    // avanzar al segundo
    await user.click(screen.getByText('Next'));
    // retroceder al primero
    await user.click(screen.getByText('Prev'));

    expect(first).toHaveClass('active');
    expect(second).toHaveClass('unfill-step');
  });
});
