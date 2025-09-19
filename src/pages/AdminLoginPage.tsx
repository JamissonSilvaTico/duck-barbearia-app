import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await login(password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Senha incorreta.');
      }
    } catch (err) {
      setError('Falha ao tentar fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-brand-dark p-8 rounded-xl shadow-2xl">
        <h1 
          className="text-4xl text-center font-bold text-brand-gold mb-2"
          style={{fontFamily: "'Playfair Display', serif"}}
        >
          Duck Barbearia
        </h1>
        <h2 className="text-center text-xl text-brand-gray mb-8">Painel Administrativo</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-brand-gray mb-2">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-light-dark p-3 rounded-md border border-brand-gold/30 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-gold text-brand-dark font-bold py-3 rounded-md hover:bg-brand-light-gold transition disabled:bg-gray-500 disabled:cursor-wait"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
