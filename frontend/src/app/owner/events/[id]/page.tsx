'use client';
import { useEffect, useState, use } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function EventTeamManager({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ freelancerId: '', paymentAmount: '' });
  const [msg, setMsg] = useState({ text: '', erro: false });

  const [editId, setEditId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');

  const candidates = participants.filter(p => p.status === 'APPLIED');
  const squad = participants.filter(p => p.status !== 'APPLIED');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [partsData, freesData] = await Promise.all([
        apiFetch(`/events/${id}/participation`),
        apiFetch(`/freelancers/all`)
      ]);
      setParticipants(partsData);
      setFreelancers(freesData);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', erro: false });
    try {
      if (participants.some(p => p.freelancerId?.toString() === form.freelancerId || p.freelancerName === freelancers.find(f => f.id.toString() === form.freelancerId)?.name)) {
         throw new Error("Este Operador já foi escalado na grade principal deste evento! Use a edição ou exclusão.");
      }
      
      await apiFetch(`/events/${id}/participation`, {
        method: 'POST',
        body: JSON.stringify({ freelancerId: Number(form.freelancerId), paymentAmount: Number(form.paymentAmount) })
      });
      setMsg({ text: 'Freelancer adicionado com sucesso na grade de operação!', erro: false });
      setForm({ freelancerId: '', paymentAmount: '' });
      loadData();
    } catch(err: any) {
      setMsg({ text: 'Falha crítica: ' + err.message, erro: true });
    }
  };

  const handleEditSave = async (participationId: number) => {
    try {
      await apiFetch(`/events/participation/${participationId}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentAmount: Number(editAmount) })
      });
      setEditId(null);
      loadData();
    } catch(err: any) {
      alert("Erro ao editar: " + err.message);
    }
  };

  const offerPayment = async (participationId: number) => {
    const valStr = prompt("Digite o cachê inicial oferecido para este candidato (ex: 200.00):");
    if (!valStr || isNaN(Number(valStr))) return alert("Valor numérico inválido.");
    
    try {
      await apiFetch(`/events/participation/${participationId}/offer`, {
        method: 'PUT',
        body: JSON.stringify({ paymentAmount: Number(valStr) })
      });
      setMsg({ erro: false, text: 'Cachê oferecido! O Freelancer precisará confirmar pelo próprio celular dele.' });
      loadData();
    } catch(err: any) {
      alert("Erro ao aprovar e oferecer cache: " + err.message);
    }
  };

  const handleDelete = async (participationId: number) => {
    if (!confirm('DESMISSÃO: Você deseja remover definitivamente este Freelancer da base contratual deste evento?')) return;
    try {
      await apiFetch(`/events/participation/${participationId}`, { method: 'DELETE' });
      loadData();
    } catch(err: any) {
      alert("Erro ao remover: " + err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)' }}>Autorizando tráfego de dados para listagem de agentes...</div>;

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <header className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontWeight: '800', margin: 0, fontSize: '2rem', color: '#fff' }}>Sala de Recrutamento (Evento #{id})</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Escale e defina o orçamento de quem vai trabalhar neste evento.</p>
        </div>
        <button onClick={() => router.push('/owner/dashboard')} className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '0.6rem 1.2rem' }}>← Voltar pra Mesa Central</button>
      </header>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Painel Central de Seleção */}
        <div className="glass-card animate-fade-in" style={{ flex: 1, minWidth: '100%', alignSelf: 'flex-start' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Designar Colaborador (Convite)</h2>
          {msg.text && <p style={{ padding: '0.8rem', borderRadius: '4px', background: msg.erro ? 'rgba(248,81,73,0.1)' : 'rgba(46, 160, 67, 0.1)', color: msg.erro ? 'var(--error)' : '#2ea043', marginBottom: '1rem', fontWeight: 'bold' }}>{msg.erro ? 'X ' : '✓ '}{msg.text}</p>}
          
          <form onSubmit={handleAdd}>
            <div className="input-group">
              <label className="input-label">Banco de Freelancers Cadastrados</label>
              <select required className="input-field" value={form.freelancerId} onChange={e => setForm({...form, freelancerId: e.target.value})}>
                <option value="" disabled>-- Filtrar da Base Global --</option>
                {freelancers.map(f => (
                  <option key={f.id} value={f.id}>{f.name} (CNPJ/Doc: {f.document})</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Promessa de Cachê / Orçamento (R$)</label>
              <input type="number" step="0.01" min="0" required className="input-field" value={form.paymentAmount} onChange={e => setForm({...form, paymentAmount: e.target.value})} placeholder="Ex: 500.00" />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Enviar Convite Oficial</button>
          </form>
        </div>

        {/* Candidaturas Pendentes */}
        {candidates.length > 0 && (
          <div className="glass-card animate-fade-in" style={{ flex: 2, minWidth: '100%', maxWidth: '100%' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#58a6ff' }}>Auto-Indicações (Freelancers Interessados)</h2>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '1rem' }}>Profissional Interessado</th>
                    <th style={{ padding: '1rem' }}>Situação Temporal</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Análise Corporativa</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(48,54,61,0.5)' }}>
                      <td style={{ padding: '1rem', color: '#fff', fontWeight: 'bold' }}>{p.freelancerName} <br/><small style={{color:'var(--text-muted)', fontWeight: 'normal'}}>Doc: {p.document}</small></td>
                      <td style={{ padding: '1rem', color: '#d29922' }}>Aguardando Oferta do Contratante</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                         <button onClick={() => offerPayment(p.id)} style={{ padding: '0.6rem 1.2rem', background: '#58a6ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '0.5rem' }}>Aprovar Entrada (Ofertar Cachê)</button>
                         <button onClick={() => handleDelete(p.id)} style={{ padding: '0.6rem 1.2rem', background: 'transparent', color: '#f85149', border: '1px solid currentColor', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Recusar Inscrição</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabela do Esquadrão */}
        <div className="glass-card animate-fade-in" style={{ flex: 2, minWidth: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Quadro de Escalados Pendentes</h2>
            
            {/* O Botão Mágico Novo de Check-in */}
            <button onClick={() => router.push(`/owner/events/${id}/checkin`)} style={{ background: '#58a6ff', color: '#fff', border: 'none', padding: '0.8rem 1.4rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(88, 166, 255, 0.3)' }}>
              <span>Acessar Lista de Check-in (Dia do Evento)</span>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </div>
          
          {squad.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Nenhum operador fixado na Base Operacional Direta deste Setor.</p>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Profissional</th>
                  <th style={{ padding: '1rem' }}>Chave PIX Oculta</th>
                  <th style={{ padding: '1rem' }}>Cachê Combinado</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Resposta do Agente</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {squad.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(48,54,61,0.5)' }}>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: 'bold' }}>{p.freelancerName} <br/><small style={{color:'var(--text-muted)', fontWeight: 'normal'}}>Doc: {p.document}</small></td>
                    <td style={{ padding: '1rem', color: '#58a6ff' }}>{p.pixKey || 'Não cadastrado'}</td>
                    <td style={{ padding: '1rem', color: '#2ea043', fontWeight: 'bold' }}>
                      {editId === p.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(22,27,34,0.8)', padding: '0.3rem', borderRadius: '4px' }}>
                           <input type="number" step="0.01" min="0" className="input-field" style={{ width: '90px', padding: '0.3rem', height: '32px' }} value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                           <button onClick={() => handleEditSave(p.id)} style={{ padding: '0.3rem 0.6rem', background: '#2ea043', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>Salvar</button>
                           <button onClick={() => setEditId(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                           <span>R$ {p.paymentAmount}</span>
                           <button onClick={() => { setEditId(p.id); setEditAmount(p.paymentAmount); }} style={{ background: 'transparent', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '1rem' }} title="Reajustar Orçamento">✎</button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: p.status === 'CONFIRMED' ? '#2ea043' : p.status === 'DECLINED' ? '#f85149' : '#d29922' }}>
                      {p.status === 'CONFIRMED' ? '✔ CONFIRMADO' : p.status === 'DECLINED' ? '✖ DECLINOU' : '⏳ PENDENTE'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button style={{ padding: '0.5rem', cursor: 'pointer', background: 'transparent', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleDelete(p.id)} title="Remover Convite e tirar da Aba">
                        Excluir da Grade ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
