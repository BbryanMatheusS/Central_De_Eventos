'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, apiDownloadFile } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RootDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ROOT') {
        router.push('/');
      } else {
        loadAllEvents();
      }
    }
  }, [user, loading]);

  const loadAllEvents = async () => {
    try {
      const data = await apiFetch('/events');
      setEvents(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) return <div style={{color:'var(--text-muted)', textAlign: 'center', marginTop: '3rem'}}>Lendo Dados Master ROOT...</div>;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontWeight: '800', margin: 0, fontSize: '2rem', color: '#f85149' }}>Terminal de Comando (ROOT)</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Visão de supervisão irrestrita. Eventos de todas as empresas integradas.</p>
        </div>
        <button onClick={logout} style={{ border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', color: '#fff' }}>Fechar Terminal Segredado</button>
      </header>

      <div className="glass-card animate-fade-in">
        <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.2rem', color: '#fff' }}>Relatório Central de Ocorrência Global</h2>
        {events.length === 0 ? (
           <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>O banco de dados não encontrou movimentação de eventos até o milissegundo atual.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Registro ID</th>
                <th style={{ padding: '1rem' }}>Nomenclatura do Evento</th>
                <th style={{ padding: '1rem' }}>Local Geográfico</th>
                <th style={{ padding: '1rem' }}>Data Confidencial</th>
                <th style={{ padding: '1rem' }}>Despacho Base de Dados (Participantes)</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(48,54,61,0.5)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{ev.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#fff' }}>{ev.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-color)' }}>{ev.location}</td>
                  <td style={{ padding: '1rem' }}>{ev.eventDate} ás {ev.eventTime}</td>
                  <td style={{ padding: '1rem' }}>
                    <button style={{ color: '#f85149', background: 'transparent', border: '1px solid #f85149', padding: '0.5rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => apiDownloadFile(`/events/${ev.id}/export-csv`, `ROOT_dump_evento_${ev.id}.csv`)}>Baixar Interceptação CSV Root</button>
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
