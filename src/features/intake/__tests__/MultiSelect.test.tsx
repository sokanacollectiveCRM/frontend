import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { vi } from 'vitest';

// Mock the form context
const mockForm = {
  register: vi.fn(),
  getValues: vi.fn(),
  setValue: vi.fn(),
  formState: {
    errors: {},
    isValid: true,
    isSubmitting: false,
  },
  trigger: vi.fn(),
};

// Mock the step component with multi-select logic
const MockMultiSelect = ({ form, onSelectionChange }: any) => {
  const selectedMulti = form.getValues('demographics_multi') || [];

  const handleMultiSelect = (opt: string) => {
    if (opt === 'None apply') {
      form.setValue('demographics_multi', ['None apply']);
    } else {
      let updated = selectedMulti.filter((v: string) => v !== 'None apply');
      if (selectedMulti.includes(opt)) {
        updated = updated.filter((v: string) => v !== opt);
      } else {
        updated = [...updated, opt];
      }
      form.setValue('demographics_multi', updated);
    }
    onSelectionChange && onSelectionChange();
  };

  return (
    <div data-testid="multi-select">
      <div data-testid="selected-count">{selectedMulti.length}</div>
      <div data-testid="selected-items">
        {selectedMulti.map((item: string) => (
          <span key={item} data-testid={`selected-${item}`}>{item}</span>
        ))}
      </div>
      <button
        data-testid="option-person-of-color"
        onClick={() => handleMultiSelect('Identify as a person of color')}
      >
        Identify as a person of color
      </button>
      <button
        data-testid="option-lgbtq"
        onClick={() => handleMultiSelect('Identify as LGBTQ+')}
      >
        Identify as LGBTQ+
      </button>
      <button
        data-testid="option-none"
        onClick={() => handleMultiSelect('None apply')}
      >
        None apply
      </button>
    </div>
  );
};

// Stateful multi-select for testing
function StatefulMultiSelect() {
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);

  const handleMultiSelect = (opt: string) => {
    if (opt === 'None apply') {
      setSelectedMulti(['None apply']);
    } else {
      let updated = selectedMulti.filter((v) => v !== 'None apply');
      if (selectedMulti.includes(opt)) {
        updated = updated.filter((v) => v !== opt);
      } else {
        updated = [...updated, opt];
      }
      setSelectedMulti(updated);
    }
  };

  return (
    <div data-testid="multi-select">
      <div data-testid="selected-count">{selectedMulti.length}</div>
      <div data-testid="selected-items">
        {selectedMulti.map((item) => (
          <span key={item} data-testid={`selected-${item}`}>{item}</span>
        ))}
      </div>
      <button
        data-testid="option-person-of-color"
        onClick={() => handleMultiSelect('Identify as a person of color')}
      >
        Identify as a person of color
      </button>
      <button
        data-testid="option-lgbtq"
        onClick={() => handleMultiSelect('Identify as LGBTQ+')}
      >
        Identify as LGBTQ+
      </button>
      <button
        data-testid="option-none"
        onClick={() => handleMultiSelect('None apply')}
      >
        None apply
      </button>
    </div>
  );
}

describe('Multi-Select Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockForm.getValues.mockReturnValue([]);
  });

  test('allows selecting multiple options (stateful)', () => {
    render(<StatefulMultiSelect />);
    // Select first option
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    expect(screen.getByTestId('selected-Identify as a person of color')).toBeInTheDocument();
    // Select second option
    fireEvent.click(screen.getByTestId('option-lgbtq'));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');
    expect(screen.getByTestId('selected-Identify as a person of color')).toBeInTheDocument();
    expect(screen.getByTestId('selected-Identify as LGBTQ+')).toBeInTheDocument();
  });

  test('allows deselecting options', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue(['Identify as a person of color', 'Identify as LGBTQ+']);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    // Deselect first option
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    expect(mockForm.setValue).toHaveBeenCalledWith('demographics_multi', ['Identify as LGBTQ+']);
  });

  test('"None apply" deselects all other options', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue(['Identify as a person of color', 'Identify as LGBTQ+']);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    // Click "None apply"
    fireEvent.click(screen.getByTestId('option-none'));
    expect(mockForm.setValue).toHaveBeenCalledWith('demographics_multi', ['None apply']);
  });

  test('selecting other options removes "None apply"', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue(['None apply']);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    // Select another option
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    expect(mockForm.setValue).toHaveBeenCalledWith('demographics_multi', ['Identify as a person of color']);
  });

  test('displays correct number of selected items', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue(['Identify as a person of color', 'Identify as LGBTQ+']);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');
    expect(screen.getByTestId('selected-Identify as a person of color')).toBeInTheDocument();
    expect(screen.getByTestId('selected-Identify as LGBTQ+')).toBeInTheDocument();
  });

  test('handles empty selection state', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue([]);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    expect(screen.queryByTestId('selected-items')).toBeEmptyDOMElement();
  });
});

describe('Multi-Select Edge Cases', () => {
  test('handles duplicate selections gracefully', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue(['Identify as a person of color']);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    // Try to select the same option again
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    expect(mockForm.setValue).toHaveBeenCalledWith('demographics_multi', []);
  });

  test('maintains selection order (stateful)', () => {
    render(<StatefulMultiSelect />);
    // Select options in specific order
    fireEvent.click(screen.getByTestId('option-lgbtq'));
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    expect(screen.getByTestId('selected-count')).toHaveTextContent('2');
    // Only get the selected pills (spans with data-testid starting with 'selected-')
    const items = Array.from(document.querySelectorAll('span[data-testid^="selected-"]')).map((el) => el.textContent);
    expect(items).toEqual(['Identify as LGBTQ+', 'Identify as a person of color']);
  });

  test('handles rapid selection changes', () => {
    const onSelectionChange = vi.fn();
    mockForm.getValues.mockReturnValue([]);

    render(<MockMultiSelect form={mockForm} onSelectionChange={onSelectionChange} />);

    // Rapidly click multiple options
    fireEvent.click(screen.getByTestId('option-person-of-color'));
    fireEvent.click(screen.getByTestId('option-lgbtq'));
    fireEvent.click(screen.getByTestId('option-none'));

    // Should end up with only "None apply"
    expect(mockForm.setValue).toHaveBeenLastCalledWith('demographics_multi', ['None apply']);
  });
}); 