/* global jest, describe, test, expect, beforeEach */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Task from '../components/Task';
import * as firestore from 'firebase/firestore';
import * as authModule from 'firebase/auth';

// Mock modular Firebase Firestore functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({
    // Return a mock collection reference
  })),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(),
}));
// Mock modular Firebase Auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Task Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock a logged-in user
    authModule.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: '123' });
      return jest.fn();
    });
    // Mock tasks data
    firestore.onSnapshot.mockImplementation((q, callback) => {
      callback({
        docs: [
          { id: 'task1', data: () => ({ userId: '123', description: 'Task 1', completed: false }) },
          { id: 'task2', data: () => ({ userId: '123', description: 'Task 2', completed: true }) },
        ],
      });
      return jest.fn();
    });
  });

  test('redirects to login if no user is authenticated', () => {
    authModule.onAuthStateChanged.mockImplementation((callback) => {
      callback(null); // No user logged in
      return jest.fn();
    });

    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('renders task page correctly with tasks', async () => {
    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('TasksBoard')).toBeInTheDocument();
      expect(screen.getByText('Active Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Add a task')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  test('opens modal to add a new task', async () => {
    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add a task'));
    expect(screen.getByText('Add a New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter task description')).toBeInTheDocument();
  });

  test('adds a new task', async () => {
    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add a task'));
    await userEvent.type(screen.getByPlaceholderText('Enter task description'), 'New Task');
    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: '123',
          description: 'New Task',
          completed: false,
          createdAt: expect.any(Date),
        })
      );
    });
  });

  test('marks a task as completed', async () => {
    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    const checkbox = screen.getAllByRole('checkbox')[0]; // First task (Task 1)
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalled();
    });
  });

  test('logs out the user', async () => {
    render(
      <BrowserRouter>
        <Task />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(authModule.signOut).toHaveBeenCalled();
    expect(localStorage.getItem('userAddress')).toBeNull();
    expect(localStorage.getItem('profilePicId')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});