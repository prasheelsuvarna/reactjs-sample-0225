import jest from 'jest-mock';

const mockAuth = {
  onAuthStateChanged: jest.fn((callback) => {
    callback(null); // Default to no user logged in
    return jest.fn(); // Mock unsubscribe
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

const mockDb = {
  collection: jest.fn(() => ({
    addDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn(),
    updateDoc: jest.fn(),
    doc: jest.fn(),
  })),
};

export const auth = mockAuth;
export const db = mockDb;