'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function FreelancerDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'FREELANCER') {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, loading]);

  const loadData = async () => {
    try {
      const [profData, evtsData] = await Promise.all([
        apiFetch('/freelancers/me'),
        apiFetch('/freelancers/me/events')
      ]);
      setProfile(profData);
      setEvents(evtsData);
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      const req = {
        name: profile.name,
        document: profile.document,
        pixKey: profile.pixKey
      };
      
      const updated = await apiFetch('/freelancers/me', {
        method: 'PUT',
        body: JSON.stringify(req)
      });
      setProfile(updated);
      setMsg('CHAVE PIX e dados atualizados com sucesso e Segurança de Ponta a Ponta!');
      setTimeout(() => setMsg(''), 5000);
    } catch(err: any) {
      setMsg('Erro ao atualizar: ' + err.message);
    }
  };

  const answerInvite = async (participationId: number, newStatus: string) => {
    try {
        await apiFetch(`/freelancers/participation/${participationId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        loadData();
    } catch (err: any) {
        alert("Falha ao responder chamada: " + err.message);
    }
  };

  if (loading || loadingData) return <div style={{display:'flex',justifyContent:'center',marginTop:'5rem',color:'var(--text-muted)'}}>Sincronizando a carteira do Freelancer...</div>;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontWeight: '800', margin: 0, fontSize: '2rem', color: '#fff' }}>Central do Freelancer</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gerencie suas informações de contratação e Pagamentos Pix.</p>
        </div>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>Desconectar Dispositivo</button>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Meus Dados Pessoais</h2>
          {msg && <div style={{ color: msg.includes('Erro') ? 'var(--error)' : '#2ea043', marginBottom: '1.5rem', fontWeight: 600, padding: '1rem', background: 'rgba(46, 160, 67, 0.1)', borderRadius: '8px' }}>🚀 {msg}</div>}
          
          <form onSubmit={handleUpdate}>
            <div className="input-group">
              <label className="input-label">E-mail de Login Protegido</label>
              <input type="email" disabled value={profile.email} className="input-field" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Nome Completo</label>
              <input type="text" required value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input-field" />
            </div>
            <div className="input-group">
              <label className="input-label">Documentação Sensível (CPF/RG)</label>
              <input type="text" required value={profile.document} onChange={e => setProfile({...profile, document: e.target.value})} className="input-field" />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ color: '#58a6ff', fontWeight: 'bold' }}>Sua Chave PIX de Recebimentos</label>
              <input type="text" required value={profile.pixKey} onChange={e => setProfile({...profile, pixKey: e.target.value})} className="input-field" style={{ borderColor: '#58a6ff', boxShadow: '0 0 5px rgba(88,166,255,0.3)' }} />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }}>Efetivar Atualizações do Perfil</button>
          </form>
        </div>

        <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(88,166,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem' }}>💡</span>
          </div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#fff' }}>Central de Oportunidades</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Sempre que os franqueados listarem o seu nome para missões operacionais, o evento aparecerá na aba inferior. <strong>Lembre-se de Aceitar ou Recusar imediatamente a escala.</strong></p>
        </div>
      </div>

      <div className="glass-card animate-fade-in" style={{ marginTop: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Minhas Escalas Formais (Eventos)</h2>
        {events.length === 0 ? <p style={{color:'var(--text-muted)'}}>Nenhum contratante acionou as suas operações ainda.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Sinal (Evento / Local)</th>
                  <th style={{ padding: '1rem' }}>Relógio Coodernado</th>
                  <th style={{ padding: '1rem' }}>Cachê Prometido</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Seu Veredito / Status</th>
                </tr>
              </thead>
              <tbody>
                  {events.map((e, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(48,54,61,0.5)' }}>
                          <td style={{ padding: '1.5rem 1rem', color: '#fff', fontWeight: 'bold' }}>{e.eventName} <br/><small style={{color:'var(--text-muted)', fontWeight: 'normal'}}>{e.eventLocation}</small></td>
                          <td style={{ padding: '1.5rem 1rem', color: 'var(--primary-color)' }}>{e.eventDate} às {e.eventTime}</td>
                          <td style={{ padding: '1.5rem 1rem', color: '#2ea043', fontWeight: 'bold', fontSize: '1.1rem' }}>R$ {e.paymentAmount}</td>
                          <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                              {e.status === 'PENDING' ? (
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button onClick={() => answerInvite(e.participationId, 'DECLINED')} style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: '#f85149', border: '1px solid currentColor', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Recusar Missão</button>
                                      <button onClick={() => answerInvite(e.participationId, 'CONFIRMED')} style={{ padding: '0.6rem 1.2rem', background: '#2ea043', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>CONFIRMAR PRESENÇA</button>
                                  </div>
                              ) : (
                                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: e.status === 'CONFIRMED' ? '#2ea043' : '#f85149', background: e.status === 'CONFIRMED' ? 'rgba(46, 160, 67, 0.1)' : 'rgba(248,81,73,0.1)', padding: '0.5rem 1rem', borderRadius: '6px' }}>{e.status === 'CONFIRMED' ? 'REDIRECIONAMENTO ACEITO' : 'MANDATO CANCELADO'}</span>
                              )}
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
