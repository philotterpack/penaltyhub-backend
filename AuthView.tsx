// AuthView.tsx - VERSIONE CORRETTA
import React, { useState } from 'react';

interface AuthViewProps {
  onAuthSuccess: (user: any) => void;
}

type AuthMode = 'login-email' | 'login-nickname' | 'register';

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('register');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login con Email
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Login con Nickname
  const [loginNickname, setLoginNickname] = useState('');
  const [loginTag, setLoginTag] = useState('');

  // Registrazione
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNickname, setRegNickname] = useState('');
  const [regTag, setRegTag] = useState('');

  const API_BASE = 'http://127.0.0.1:8000';

  // ========== UTILITY ==========
  const generateRandomTag = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const validateNickname = (nickname: string): boolean => {
    if (!nickname || nickname.trim().length === 0) {
      setError('Il nickname non può essere vuoto');
      return false;
    }
    if (nickname.length < 3) {
      setError('Il nickname deve essere almeno 3 caratteri');
      return false;
    }
    if (nickname.length > 20) {
      setError('Il nickname non può superare 20 caratteri');
      return false;
    }
    // Solo lettere, numeri, underscore
    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
      setError('Il nickname può contenere solo lettere, numeri e underscore');
      return false;
    }
    return true;
  };

  const validateTag = (tag: string): boolean => {
    if (!tag || tag.trim().length === 0) return true; // opzionale
    if (!/^\d{4}$/.test(tag)) {
      setError('Il codice deve essere esattamente 4 cifre');
      return false;
    }
    return true;
  };

  // ========== LOGIN EMAIL ==========
  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      setError('Compila tutti i campi');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Login fallito');
      }

      const data = await res.json();
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  // ========== LOGIN NICKNAME ==========
  const handleLoginNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!loginNickname || !loginTag) {
      setError('Compila nickname e codice');
      setLoading(false);
      return;
    }

    if (!validateTag(loginTag)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login/nickname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: loginNickname,
          tag: loginTag,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Nickname/Tag non trovati');
      }

      const data = await res.json();
      onAuthSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTRAZIONE ==========
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validazioni
    if (!regEmail || !regPassword || !regNickname) {
      setError('Compila tutti i campi obbligatori');
      setLoading(false);
      return;
    }

    if (!validateNickname(regNickname)) {
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError('La password deve essere almeno 6 caratteri');
      setLoading(false);
      return;
    }

    // Genera tag se vuoto
    const finalTag = regTag.trim() || generateRandomTag();

    if (!validateTag(finalTag)) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          nickname: regNickname,
          tag: finalTag,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Registrazione fallita');
      }

      const data = await res.json();
      onAuthSuccess(data);
    } catch (err: any) {
      // Se il backend non è attivo, simula registrazione (SOLO PER TEST)
      if (err.message.includes('fetch')) {
        console.warn('Backend non disponibile, simulazione registrazione...');
        const mockUser = {
          uid: 'mock_' + Date.now(),
          email: regEmail,
          nickname: regNickname,
          tag: finalTag,
        };
        onAuthSuccess(mockUser);
      } else {
        setError(err.message || 'Errore di connessione');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-emerald-400 mb-2">
            PenaltyHub
          </h1>
          <p className="text-slate-400 text-sm">Locker Room Elite</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => {
              setMode('login-email');
              setError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${
              mode === 'login-email'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setMode('login-nickname');
              setError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${
              mode === 'login-nickname'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Nickname
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${
              mode === 'register'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registrati
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Login con Email */}
        {mode === 'login-email' && (
          <form onSubmit={handleLoginEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="tua@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
          </form>
        )}

        {/* Login con Nickname */}
        {mode === 'login-nickname' && (
          <form onSubmit={handleLoginNickname} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nickname
              </label>
              <input
                type="text"
                value={loginNickname}
                onChange={(e) => setLoginNickname(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="IlTuoNickname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Codice #
              </label>
              <input
                type="text"
                value={loginTag}
                onChange={(e) => setLoginTag(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="1234"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Accesso...' : 'Accedi'}
            </button>
          </form>
        )}

        {/* Registrazione */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="tua@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password * (min 6 caratteri)
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nickname * (3-20 caratteri)
              </label>
              <input
                type="text"
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="IlTuoNickname"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Codice # (opzionale, 4 cifre)
              </label>
              <input
                type="text"
                value={regTag}
                onChange={(e) => setRegTag(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
                placeholder="1234 (lascia vuoto per generarlo)"
              />
              <p className="text-xs text-slate-500 mt-1">
                Se vuoto, verrà generato automaticamente
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Registrazione...' : 'Inizia la Carriera'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


export { AuthView };