'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function NewEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', location: '', eventDate: '', eventTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });
    
    try {
      await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setMsg({ text: 'Evento cadastrado com sucesso e sincronizado!', type: 'success' });
      setTimeout(() => router.push('/owner/dashboard'), 1500);
    } catch(err: any) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontWeight: '800', margin: 0, fontSize: '2rem', color: '#fff' }}>Organizar Novo Evento</h1>
        <button onClick={() => router.push('/owner/dashboard')} className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>← Cancela e Voltar</button>
      </header>

      <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Forneça as diretrizes e coordenação</h2>
        
        {msg.text && <div style={{ padding: '1rem', marginBottom: '1.5rem', fontWeight: 'bold', background: msg.type === 'error' ? 'rgba(248,81,73,0.1)' : 'rgba(35,134,54,0.1)', color: msg.type === 'error' ? 'var(--error)' : '#2ea043', borderRadius: '8px' }}>{msg.text}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Nome Oficial (Projeto)</label>
            <input type="text" required className="input-field" placeholder="Ex: Lançamento de Software Alpha" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Endereçamento Tático (Localização)</label>
            <input type="text" required className="input-field" placeholder="Setor 4 - São Paulo" onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Data de Ativação</label>
              <input type="date" required className="input-field" onChange={e => setFormData({...formData, eventDate: e.target.value})} />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label className="input-label">Relógio Local Central</label>
              <input type="time" required className="input-field" onChange={e => setFormData({...formData, eventTime: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
            {loading ? 'INSTANCIANDO NO BANCO DE DADOS...' : 'CRIAR ENTRADA DEFINITIVA DE EVENTO'}
          </button>
        </form>
      </div>
    </div>
  );
}
