import React from 'react';
/* global jest, describe, test, expect, beforeEach */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Signup from '../components/Signup';
// Use consistent import for firebase mock
import { auth } from '../firebase/firebase';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
// Mock the 'auth' object and its methods
jest.mock('../firebase/firebase', () => ({
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form correctly', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign up with Email')).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Log in')).toBeInTheDocument();
  });

  test('handles email signup successfully', async () => {
    auth.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Email Address'), 'newuser@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.click(screen.getByText('Sign up with Email'));

    await waitFor(() => {
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'newuser@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  test('displays error on failed signup', async () => {
    auth.createUserWithEmailAndPassword.mockRejectedValue(new Error('Signup failed'));

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByPlaceholderText('Email Address'), 'invalid@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'short');
    fireEvent.click(screen.getByText('Sign up with Email'));

    await waitFor(() => {
      expect(screen.getByText('Failed to sign up')).toBeInTheDocument();
    });
  });

  test('navigates to login page when link is clicked', async () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Already have an account? Log in'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});