import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Register({ setToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!username || !email || !password) {
      setError('Please provide username, email, and password');
      return;
    }
    if (username.length > 10) {
      setError('Username must be 10 characters or less');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', { username, email, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = res.data.token;
      console.log('Register success, token:', token);
      localStorage.setItem('token', token);
      setToken(token);
      setError('');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Register error:', err.response?.data);
      setError(err.response?.data.msg || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Join ShopSync</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="ShopSync Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ background: '#6ab04c', color: '#fff' }}>
          Register
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;