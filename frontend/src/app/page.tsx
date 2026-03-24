'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loadingReq, setLoadingReq] = useState(false);
  
  // Puxando o hook milagroso da nossa engine de Contexto
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setLoadingReq(true);
    
    try {
      await login(email, password);
    } catch(err: any) {
      setErrorText(err.message || 'Falha catastrófica ao conectar com a API.');
      alert("ERRO DETECTADO NO CELULAR: " + err.message);
    } finally {
      setLoadingReq(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* Esfera decorativa flutuando */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(88,166,255,0.08) 0%, transparent 60%)', borderRadius: '50%', zIndex: -1 }}></div>

      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', zIndex: 10 }}>
        <h1 style={{ marginBottom: '0.2rem', fontSize: '2.2rem', textAlign: 'center', fontWeight: '800', background: 'linear-gradient(90deg, #fff, #8b949e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Central Eventos
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2.5rem', fontWeight: 500, letterSpacing: '0.5px' }}>
          O futuro da gestão inteligente.
        </p>
        
        {errorText && (
          <div className="animate-fade-in" style={{background: 'rgba(248,81,73,0.1)', color: '#ff7b72', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(248,81,73,0.3)', textAlign: 'center', fontWeight: '500', fontSize: '0.9rem'}}>
            {errorText}
          </div>
        )}

        <div>
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail corporativo ou Freelancer</label>
            <input 
              type="email" 
              id="email"
              className="input-field" 
              placeholder="seuemail@sistema.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="password">Chave de Acesso</label>
            <input 
              type="password" 
              id="password"
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="button" onClick={handleLogin} className="btn-primary" style={{ marginTop: '1.5rem', padding: '1rem', opacity: loadingReq ? 0.7 : 1 }} disabled={loadingReq}>
            {loadingReq ? 'CONECTANDO...' : 'ENTRAR NO PAINEL'}
          </button>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.95rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Empresa iniciante? <a href="/register" style={{ fontWeight: '500' }}>Criar minha franquia</a>
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.8rem' }}>
            Sou um Freelancer. <a href="/register-freelancer" style={{ fontWeight: '500' }}>Fazer meu cadastro</a>
          </p>
        </div>
      </div>
    </div>
  );
}
