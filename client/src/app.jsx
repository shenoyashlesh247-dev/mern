import { useState } from 'react';

export default function App() {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null); // set after a successful request

  const isSignup = mode === 'signup';

  function switchMode(next) {
    setMode(next);
    setError('');
    setPassword('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setUser({ email: data.email, created: isSignup });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <main className="page">
        <h1>{user.created ? 'Account created' : 'Welcome back'}</h1>
        <p className="sub">
          {user.created ? 'You signed up as' : 'You are logged in as'} <strong>{user.email}</strong>
        </p>
        <p className="sub">
          <button
            type="button"
            className="link"
            onClick={() => {
              setUser(null);
              setEmail('');
              setPassword('');
              switchMode('login');
            }}
          >
            Back to Log In
          </button>
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>{isSignup ? 'Sign Up' : 'Log In'}</h1>

      <p className="sub">
        {isSignup ? 'Already a member? ' : 'New here? '}
        <button type="button" className="link" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
          {isSignup ? 'Log In' : 'Sign Up'}
        </button>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <p className="error" role="alert" aria-live="polite">{error}</p>

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Please wait…' : isSignup ? 'Sign Up' : 'Log In'}
        </button>
      </form>
    </main>
  );
}