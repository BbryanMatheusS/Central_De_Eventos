'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, apiDownloadFile } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function OwnerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'OWNER') {
        router.push('/');
      } else {
        loadEvents();
      }
    }
  }, [user, loading]);

  const loadEvents = async () => {
    try {
      const data = await apiFetch('/events');
      setEvents(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) return <div style={{display:'flex',justifyContent:'center',marginTop:'5rem',color:'var(--text-muted)'}}>✨ Conectando ao Servidor... ✨</div>;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontWeight: '800', margin: 0, fontSize: '2rem', color: '#fff' }}>Gestão de Eventos</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Bem-vindo ao painel blindado da sua empresa.</p>
        </div>
        <button onClick={logout} style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--error)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease' }}>
          Finalizar Sessão
        </button>
      </header>

      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Meus Eventos Criptografados</h2>
        <button className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }} onClick={() => router.push('/owner/events/new')}>+ Novo Evento</button>
      </div>

      <div className="glass-card animate-fade-in" style={{ padding: '0.5rem 1.5rem' }}>
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Sua empresa ainda não inaugurou nenhum evento maravilhoso.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Evento</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Localidade</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Data e Horário</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(48,54,61,0.5)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '1.5rem 1rem', fontWeight: 600, color: '#fff' }}>{ev.name}</td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--text-main)' }}>{ev.location}</td>
                  <td style={{ padding: '1.5rem 1rem', color: 'var(--primary-color)', fontWeight: 500 }}>{ev.eventDate} às {ev.eventTime}</td>
                  <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                    <button style={{ background: 'rgba(88,166,255,0.1)', color: 'var(--primary-color)', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push(`/owner/events/${ev.id}`)}>
                      Controlar Freelancers
                    </button>
                    <button style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginLeft: '0.5rem' }} onClick={() => apiDownloadFile(`/events/${ev.id}/export-csv`, `evento_${ev.id}_folha_presenca.csv`)}>
                      Exportar folha CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
