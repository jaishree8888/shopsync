import React, { useState } from 'react';
import api from "../api.jsx";
import { useNavigate , Link} from 'react-router-dom';
import "./Auth.css";

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const token = res.data.token;
      console.log('Login success, token:', token);
      setToken(token);
      setError('');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err.message, err.response?.data);
      if (err.response) {
        setError(err.response.data?.msg || 'Login failed');
      } else if (err.request) {
        setError('Network error: Unable to reach the server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
      <p style={{marginTop: '20px'}}>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;