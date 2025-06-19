import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from './Button';

describe('Button Component', () => {
  // Happy path tests
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should render with custom text content', () => {
      render(<Button>Custom Text</Button>);
      expect(screen.getByText('Custom Text')).toBeInTheDocument();
    });

    it('should render as disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should render with default button type', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Variants and Styling', () => {
    it('should apply primary variant class', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });

    it('should apply secondary variant class', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-secondary');
    });

    it('should apply danger variant class', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-danger');
    });

    it('should apply success variant class', () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-success');
    });

    it('should apply small size class', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-small');
    });

    it('should apply large size class', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-large');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should combine multiple classes correctly', () => {
      render(<Button variant="primary" size="large" className="custom">Combined</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary', 'btn-large', 'custom');
    });
  });

  describe('Event Handling', () => {
    it('should call onClick handler when clicked', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={mockOnClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event object to onClick handler', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={mockOnClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should not call onClick when disabled', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button disabled onClick={mockOnClick}>Disabled</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events (Enter)', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={mockOnClick}>Keyboard</Button>);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events (Space)', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={mockOnClick}>Keyboard</Button>);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{ }');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple rapid clicks', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={mockOnClick}>Rapid Click</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Loading States', () => {
    it('should show loading state when loading prop is true', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading Button</Button>);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should preserve button text when loading with showTextOnLoading prop', () => {
      render(<Button loading showTextOnLoading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading Button');
    });

    it('should hide text content when loading without showTextOnLoading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('Loading Button');
    });

    it('should not call onClick when in loading state', async () => {
      const mockOnClick = jest.fn();
      const user = userEvent.setup();

      render(<Button loading onClick={mockOnClick}>Loading</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should show custom loading text when provided', () => {
      render(<Button loading loadingText="Processing...">Submit</Button>);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      render(<Button></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should handle null children', () => {
      render(<Button>{null}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle undefined children', () => {
      render(<Button>{undefined}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle zero as children', () => {
      render(<Button>{0}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('0');
    });

    it('should handle boolean children', () => {
      render(<Button>{false}</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle multiple children', () => {
      render(<Button><span>Icon</span> Text</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(1000);
      render(<Button>{longText}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('should handle special characters in text', () => {
      const specialText = '!@#$%^&*()_+{}[]|\\:";\'<>?,./"';
      render(<Button>{specialText}</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(specialText);
    });

    it('should handle emoji in text', () => {
      render(<Button>Click me! 👍 🚀</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Click me! 👍 🚀');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should support custom aria-describedby', () => {
      render(<Button aria-describedby="description">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('should support aria-pressed for toggle buttons', () => {
      render(<Button aria-pressed="true">Toggle</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('should be focusable by default', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('should support custom tabIndex', () => {
      render(<Button tabIndex={5}>Custom Tab</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '5');
    });

    it('should have proper focus visible styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Form Integration', () => {
    it('should submit form when type is submit', () => {
      const mockSubmit = jest.fn(e => e.preventDefault());
      render(
        <form onSubmit={mockSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(mockSubmit).toHaveBeenCalled();
    });

    it('should reset form when type is reset', () => {
      render(
        <form>
          <input defaultValue="test" data-testid="test-input" />
          <Button type="reset">Reset</Button>
        </form>
      );
      const button = screen.getByRole('button');
      const input = screen.getByTestId('test-input');
      fireEvent.click(button);
      expect(input.value).toBe('');
    });

    it('should have button type by default', () => {
      render(<Button>Default Type</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should accept custom form attributes', () => {
      render(<Button form="my-form" formAction="/submit">Form Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
      expect(button).toHaveAttribute('formAction', '/submit');
    });
  });

  describe('Performance and Refs', () => {
    it('should forward refs correctly', () => {
      const ref = React.createRef();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current.textContent).toBe('Ref Button');
    });

    it('should work with callback refs', () => {
      let buttonRef = null;
      const callbackRef = node => { buttonRef = node; };
      render(<Button ref={callbackRef}>Callback Ref</Button>);
      expect(buttonRef).toBeInstanceOf(HTMLButtonElement);
      expect(buttonRef.textContent).toBe('Callback Ref');
    });

    it('should handle ref updates correctly', () => {
      const ref = React.createRef();
      const { rerender } = render(<Button ref={ref}>Test</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      rerender(<Button ref={ref}>Updated</Button>);
      expect(ref.current.textContent).toBe('Updated');
    });
  });

  describe('Error Boundaries and Edge Cases', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    it('should handle onClick errors gracefully', async () => {
      const errorOnClick = () => { throw new Error('Test error'); };
      const user = userEvent.setup();
      expect(() => render(<Button onClick={errorOnClick}>Error Button</Button>)).not.toThrow();
      const button = screen.getByRole('button');
      await expect(user.click(button)).rejects.toThrow('Test error');
    });

    it('should handle invalid prop combinations gracefully', () => {
      expect(() => render(<Button variant="invalid" size="invalid">Invalid Props</Button>)).not.toThrow();
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle extremely nested children', () => {
      const NestedComponent = () => (
        <div><span><em><strong>Deeply nested content</strong></em></span></div>
      );
      render(<Button><NestedComponent /></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Deeply nested content')).toBeInTheDocument();
    });
  });

  describe('Custom Props and Data Attributes', () => {
    it('should pass through data attributes', () => {
      render(<Button data-testid="custom-button" data-analytics="click">Data Button</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('data-analytics', 'click');
    });

    it('should pass through custom HTML attributes', () => {
      render(<Button title="Tooltip text" id="custom-id">Custom Attrs</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Tooltip text');
      expect(button).toHaveAttribute('id', 'custom-id');
    });

    it('should handle style prop', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' };
      render(<Button style={customStyle}>Styled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background-color: red');
      expect(button).toHaveStyle('color: white');
    });
  });
});