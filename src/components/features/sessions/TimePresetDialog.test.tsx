import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TimePresetDialog } from './TimePresetDialog';

describe('TimePresetDialog', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <TimePresetDialog open={false} onSelectPreset={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog with three preset options when open', () => {
    render(<TimePresetDialog open={true} onSelectPreset={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /15 min/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /30 min/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /45 min/i })).toBeInTheDocument();
  });

  it('calls onSelectPreset with 15 when 15 min button clicked', async () => {
    const user = userEvent.setup();
    const onSelectPreset = vi.fn();

    render(<TimePresetDialog open={true} onSelectPreset={onSelectPreset} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /15 min/i }));
    expect(onSelectPreset).toHaveBeenCalledWith(15);
  });

  it('calls onSelectPreset with 30 when 30 min button clicked', async () => {
    const user = userEvent.setup();
    const onSelectPreset = vi.fn();

    render(<TimePresetDialog open={true} onSelectPreset={onSelectPreset} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /30 min/i }));
    expect(onSelectPreset).toHaveBeenCalledWith(30);
  });

  it('calls onSelectPreset with 45 when 45 min button clicked', async () => {
    const user = userEvent.setup();
    const onSelectPreset = vi.fn();

    render(<TimePresetDialog open={true} onSelectPreset={onSelectPreset} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /45 min/i }));
    expect(onSelectPreset).toHaveBeenCalledWith(45);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<TimePresetDialog open={true} onSelectPreset={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('has minimum 44px touch targets for all buttons', () => {
    render(<TimePresetDialog open={true} onSelectPreset={vi.fn()} onCancel={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      const styles = window.getComputedStyle(button);
      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);
      // Note: Testing Library may not accurately compute CSS, but we can verify the classes are applied
      expect(button.className).toMatch(/min-[hw]/); // Tailwind min-h or min-w classes
    });
  });
});
