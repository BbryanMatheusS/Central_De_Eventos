'use client';
import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CheckinPortaria({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const partsData = await apiFetch(`/events/${id}/participation`);
      // Focar na portaria: Apenas galera que não recusou de cara
      setParticipants(partsData.filter((p: any) => p.status !== 'DECLINED'));
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async (participationId: number, name: string) => {
    if (!confirm(`CONFIRMAÇÃO LEGAL: Você atesta que [ ${name} ] está fisicamente presente no evento local agora? Isso autorizará o futuro processamento do cachê dela na folha de exportação de dados.`)) return;
    try {
      await apiFetch(`/events/participation/${participationId}/attend`, { method: 'PUT' });
      loadData();
    } catch(err: any) {
      alert("Falha na varredura. " + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Iniciando o Terminal Móvel de Portaria na rede...</div>;

  return (
    <div style={{ paddingTop: '1rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      
      {/* Header Sticky (Grudado no topo) pra quem vai usar no celular */}
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', background: 'rgba(13, 17, 23, 0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, paddingTop: '1rem' }}>
        <div>
          <h1 style={{ fontWeight: '800', margin: 0, fontSize: '1.5rem', color: '#fff' }}>📱 Portaria Ativa (Ref #{id})</h1>
          <p style={{ color: 'var(--success)', margin: 0, fontWeight: 'bold' }}>Sistemas de Aprovação Eletrônica on-line</p>
        </div>
        <button onClick={() => router.push(`/owner/events/${id}`)} className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.6rem 1.2rem' }}>Encerrar</button>
      </header>

      <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {participants.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%', padding: '2rem' }}>Nenhum operador com status confirmado ou pendente detectado na base deste evento.</p>
        ) : (
          participants.map(p => (
            <div key={p.id} style={{
                background: p.attended ? 'rgba(46, 160, 67, 0.05)' : 'var(--panel-bg)',
                border: p.attended ? '2px solid #2ea043' : '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: p.attended ? '0 4px 20px rgba(46, 160, 67, 0.1)' : '0 4px 10px rgba(0,0,0,0.2)',
                opacity: p.attended ? 0.7 : 1,
                transition: 'all 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.2rem 0', color: p.attended ? '#2ea043' : '#fff' }}>{p.freelancerName}</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '1px', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>🎫 DOC ID: {p.document}</div>
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                     <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cachê Autorizado Fixado:</div>
                     <div style={{ fontSize: '1.3rem', color: '#2ea043', fontWeight: 'bold' }}>R$ {p.paymentAmount}</div>
                     {p.status === 'PENDENTE' && <div style={{ fontSize: '0.8rem', color: '#d29922', marginTop: '0.5rem', fontWeight: 'bold' }}>⚠️ Este agente esqueceu/ainda não confirmou presença voluntária no aplicativo dele, mas você pode liberar a entrada mesmo assim se ele estiver na porta.</div>}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                    {p.attended ? (
                        <div style={{ width: '100%', padding: '1rem', background: 'rgba(46, 160, 67, 0.15)', color: '#2ea043', fontWeight: 'bold', textAlign: 'center', borderRadius: '8px', border: '1px dashed #2ea043' }}>
                            ✔ ACESSO LIBERADO
                        </div>
                    ) : (
                        <button onClick={() => handleAttend(p.id, p.freelancerName)} style={{ width: '100%', padding: '1.2rem', background: '#2ea043', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 24px rgba(46, 160, 67, 0.4)', textTransform: 'uppercase' }}>
                            VALIDAR ENTRADA NA PORTA
                        </button>
                    )}
                </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
