import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useConnectedAccounts } from './hooks/useConnectedAccounts';
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
  const { accounts, loading, addAccount, removeAccount } = useConnectedAccounts();

  async function handleConnect(provider: string) {
    // For now, add a placeholder account (OAuth will come later)
    const email = prompt(`Enter your ${provider} email:`);
    if (!email) return;
    
    try {
      await addAccount({
        provider,
        provider_user_id: `${provider}_${Date.now()}`,
        access_token: 'placeholder_token',
        refresh_token: 'placeholder_refresh',
        email
      });
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    try {
      await removeAccount(id);
    } catch (err: any) {
      alert(err.message);
    }
  }

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
          {accounts.length === 0 ? (
            <p className="placeholder">Connect your Google or Outlook account to see your calendar, emails, and todos.</p>
          ) : (
            <div className="day-view">
              <p className="placeholder">Your connected accounts are loaded. Calendar, email, and todo views coming soon!</p>
            </div>
          )}
        </div>
        
        <div className="accounts-section">
          <h3>Connected Accounts</h3>
          
          {loading ? (
            <p className="placeholder">Loading...</p>
          ) : accounts.length === 0 ? (
            <p className="placeholder">No accounts connected yet.</p>
          ) : (
            <div className="accounts-list">
              {accounts.map(account => (
                <div key={account.id} className="account-item">
                  <span className={`provider-badge ${account.provider}`}>
                    {account.provider === 'google' ? '📧' : '📅'} {account.email}
                  </span>
                  <button 
                    onClick={() => handleDisconnect(account.id)}
                    className="disconnect-btn"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="connect-buttons">
            <button 
              className="connect-btn google" 
              onClick={() => handleConnect('google')}
            >
              Connect Google
            </button>
            <button 
              className="connect-btn outlook" 
              onClick={() => handleConnect('microsoft')}
            >
              Connect Outlook
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
