import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { username, password }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const token = res.data.token;
      console.log('Login success, token:', token);
      localStorage.setItem('token', token);
      setToken(token);
      setError('');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err.response?.data);
      setError(err.response?.data.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Welcome to ShopSync</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="ShopSync Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ background: '#ff6f61', color: '#fff' }}>
          Login
        </button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>
        Need an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;