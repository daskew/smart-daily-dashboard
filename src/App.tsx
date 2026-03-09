import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message);
    }
    
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Smart Daily Dashboard</h1>
        <h2>{isLogin ? 'Sign in to your account' : 'Create an account'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
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
            minLength={6}
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Smart Daily Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <main className="main">
        <div className="section">
          <h2>Your Day at a Glance</h2>
          <p className="placeholder">Connect your Google or Outlook account to see your calendar, emails, and todos.</p>
        </div>
        
        <div className="accounts-section">
          <h3>Connected Accounts</h3>
          <p className="placeholder">No accounts connected yet.</p>
          <div className="connect-buttons">
            <button className="connect-btn google">Connect Google</button>
            <button className="connect-btn outlook">Connect Outlook</button>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      {user ? <Dashboard /> : <AuthPage />}
    </AuthProvider>
  );
}

export default App;
