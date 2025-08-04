// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Re-export our custom render
export { render, renderHook } from './render';