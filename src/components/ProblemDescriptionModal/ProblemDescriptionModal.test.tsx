import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ProblemDescriptionModal } from './ProblemDescriptionModal';

afterEach(cleanup);

describe('ProblemDescriptionModal', () => {
  it('shows only the statement, examples and constraints', () => {
    render(React.createElement(ProblemDescriptionModal, { isOpen: true, onClose: vi.fn() }));
    expect(screen.getByRole('heading', { name: '题目描述' })).toBeTruthy();
    expect(screen.getByText(/给定字符串数组/)).toBeTruthy();
    expect(screen.getByText(/约束/)).toBeTruthy();
    expect(screen.queryByText('算法思路')).toBeNull();
    expect(screen.queryByText('核心规则')).toBeNull();
  });

  it('closes on Escape and restores body scrolling', () => {
    const close = vi.fn();
    render(React.createElement(ProblemDescriptionModal, { isOpen: true, onClose: close }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    cleanup();
    expect(document.body.style.overflow).toBe('');
  });
});
