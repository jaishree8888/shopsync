import { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  console.log('PrivateRoute checked, token:', token);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Token state updated:', token);
    const storedToken = localStorage.getItem('token');
    if (storedToken !== token) {
      setToken(storedToken || '');
    }
  }, [token]);

  useEffect(() => {
    console.log('Location changed:', window.location.pathname);
  }, []);

  const setAuthToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setAuthToken('');
    navigate('/login', { replace: true });
  };

  console.log('App rendered, token:', token);

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setAuthToken} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <Register setToken={setAuthToken} /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard token={token} logout={logout} />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;