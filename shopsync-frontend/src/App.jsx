import React, { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  const setAuthToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setAuthToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register setToken={setAuthToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;