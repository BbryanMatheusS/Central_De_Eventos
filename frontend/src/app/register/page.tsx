'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterOwner() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', cnpj: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://' + window.location.hostname + ':8080/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'OWNER' })
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro ao registrar, verifique os dados.');
      }
      
      setMsg({ text: 'Empresa criada com sucesso! Redirecionando...', type: 'success' });
      setTimeout(() => router.push('/'), 2000);
    } catch(err: any) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 0' }}>
      
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(88,166,255,0.06) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }}></div>

      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '700' }}>Nova Franquia</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Seja o dono do seu negócio de eventos.</p>
        
        {msg.text && (
          <div className="animate-fade-in" style={{ color: msg.type === 'error' ? 'var(--error)' : 'var(--success)', background: msg.type === 'error' ? 'rgba(248,81,73,0.1)' : 'rgba(35,134,54,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontWeight: '500' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">E-mail Administrativo</label>
            <input type="email" required className="input-field" placeholder="ceo@empresa.com" onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Senha Global</label>
            <input type="password" required className="input-field" placeholder="••••••••" onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Nome Fantasia (Sua Empresa)</label>
            <input type="text" required className="input-field" placeholder="Festas & Cia" onChange={e => setFormData({...formData, companyName: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">CNPJ</label>
            <input type="text" required className="input-field" placeholder="00.000.000/0000-00" onChange={e => setFormData({...formData, cnpj: e.target.value})} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem', padding: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'INSTANCIANDO...' : 'CRIAR EMPRESA E ACESSAR'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <a href="/">← Voltar ao Login Seguro</a>
        </p>
      </div>
    </div>
  );
}
