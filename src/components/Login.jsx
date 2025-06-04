import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ethers } from 'ethers';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle email login with Firebase
  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/tasks');
    } catch {
      setError('Invalid email or password');
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        return { signer, address };
      } catch {
        setError('Failed to connect to MetaMask');
        return null;
      }
    } else {
      setError('Please install MetaMask');
      return null;
    }
  };

  // Handle MetaMask login (no transaction fees)
  const handleMetaMaskLogin = async () => {
    const wallet = await connectWallet();
    if (wallet) {
      const { signer, address } = wallet;
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Login to TaskBoard with nonce: ${nonce}`;
      try {
        const signature = await signer.signMessage(message);
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
          localStorage.setItem('userAddress', address); // Store address temporarily
          navigate('/tasks');
        } else {
          setError('Signature verification failed');
        }
      } catch {
        setError('Failed to sign message');
      }
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Log in!</h1>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ color: 'black' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ color: 'black' }}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleEmailLogin}>Log in with Email</button>
      <button onClick={handleMetaMaskLogin} className="metamask-button">
        Log in with MetaMask
      </button>
      <Link to="/signup">Don’t have an account? Sign up</Link>
    </div>
  );
};

export default Login;