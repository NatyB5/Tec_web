'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface Prize {
  id_premio: number;
  descricao: string;
  valor: any;
  id_jogo: number;
  JOGO?: { id_jogo: number; data_hora: string };
  USUARIO?: { nome: string; email: string };
}

export default function AdminPrizesPage() {
  const router = useRouter();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [gameId, setGameId] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('bingoToken');
    setLoading(true);

    try {
      // 1. Busca PRÊMIOS
      const prizesRes = await fetch(`${API_BASE}/prizes`, { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store' // <--- Força buscar dados novos
      });

      if (prizesRes.ok) {
        const data = await prizesRes.json();
        setPrizes(data);
      } else {
        console.error("Erro ao buscar prêmios. Status:", prizesRes.status);
      }

      // 2. Busca JOGOS (Separado para não quebrar se prêmios falhar)
      const gamesRes = await fetch(`${API_BASE}/games`, { 
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store' // <--- Força buscar dados novos
      });

      if (gamesRes.ok) {
        const data = await gamesRes.json();
        console.log("🎮 Jogos carregados para o select:", data);
        setGames(data);
      } else {
        console.error("Erro ao buscar jogos. Status:", gamesRes.status);
        const text = await gamesRes.text();
        console.error("Resposta do erro:", text);
      }

    } catch (error) {
      console.error("Erro crítico no fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('bingoToken');

    if (!gameId) {
        alert("Selecione um jogo!");
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/prizes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: desc,
          valor: parseFloat(valor),
          id_jogo: parseInt(gameId),
        })
      });

      if (res.ok) {
        alert('Prêmio criado com sucesso! 🏆');
        setDesc('');
        setValor('');
        setGameId('');
        fetchData(); // Recarrega a lista
      } else {
        const err = await res.json();
        alert(`Erro ao criar: ${err.message}`);
      }
    } catch (error) {
      alert('Erro de conexão ao criar prêmio.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este prêmio?')) return;
    const token = localStorage.getItem('bingoToken');
    
    try {
        const res = await fetch(`${API_BASE}/prizes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            fetchData();
        } else {
            alert('Erro ao excluir prêmio.');
        }
    } catch (e) { alert('Erro de rede ao excluir.'); }
  };

  const formatCurrency = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return "0.00";
    return num.toFixed(2);
  };

  if (loading) return (
    <UserLayout>
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Carregando dados...</div>
    </UserLayout>
  );

  return (
    <UserLayout>
      <div className="prizes-container">
        
        <div className="header-actions">
            <Button variant="secondary" onClick={() => router.push('/rooms')}>← Salas</Button>
            <h1 className="page-title">Gerenciar Prêmios</h1>
            <Button variant="primary" onClick={() => router.push('/admin')} style={{ backgroundColor: '#a855f7' }}>Painel Admin →</Button>
        </div>

        {/* FORMULÁRIO */}
        <div className="form-card">
          <h2 className="section-title">Novo Prêmio</h2>
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-group">
              <label>Descrição</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Bicicleta" required />
            </div>
            <div className="form-group">
              <label>Valor (R$)</label>
              <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label>Jogo Alvo</label>
              <select value={gameId} onChange={e => setGameId(e.target.value)} required style={{ background: '#0f172a' }}>
                <option value="">Selecione um Jogo...</option>
                {games.map(g => (
                    <option key={g.id_jogo} value={g.id_jogo}>
                        Jogo #{g.id_jogo} (Sala {g.SALA?.nome || g.id_sala}) - {new Date(g.data_hora).toLocaleDateString()}
                    </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
                <Button type="submit" style={{ width: '100%', height: '45px' }}>Criar Prêmio ✨</Button>
            </div>
          </form>
        </div>

        {/* TABELA */}
        <div className="table-card">
          <h2 className="section-title">Lista de Prêmios ({prizes.length})</h2>
          <div className="table-responsive">
            <table className="prizes-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Jogo</th>
                    <th>Ganhador</th>
                    <th className="text-center">Ações</th>
                </tr>
                </thead>
                <tbody>
                {prizes.map(prize => (
                    <tr key={prize.id_premio}>
                    <td>#{prize.id_premio}</td>
                    <td className="desc-cell">{prize.descricao}</td>
                    <td className="value-cell">R$ {formatCurrency(prize.valor)}</td>
                    <td>{prize.JOGO ? `Jogo #${prize.id_jogo}` : <span className="text-red">Sem Jogo</span>}</td>
                    <td>
                        {prize.USUARIO ? (
                            <span className="winner-badge">🏆 {prize.USUARIO.nome}</span>
                        ) : (
                            <span className="pending-badge">Em aberto</span>
                        )}
                    </td>
                    <td className="text-center">
                        <button onClick={() => handleDelete(prize.id_premio)} className="delete-btn">Excluir</button>
                    </td>
                    </tr>
                ))}
                {prizes.length === 0 && (
                    <tr><td colSpan={6} className="empty-message">Nenhum prêmio encontrado.</td></tr>
                )}
                </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          .prizes-container { padding: 2rem; max-width: 1100px; margin: 0 auto; color: white; font-family: sans-serif; }
          .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
          .page-title { font-size: 2rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
          .section-title { font-size: 1.3rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem; color: #f3f4f6; }
          .form-card, .table-card { background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5); }
          .create-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end; }
          .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
          .form-group label { font-weight: 600; font-size: 0.9rem; color: #cbd5e1; }
          .form-group input, .form-group select { padding: 0.75rem; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: white; font-size: 1rem; outline: none; }
          .form-group input:focus, .form-group select:focus { border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2); }
          .table-responsive { overflow-x: auto; }
          .prizes-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
          .prizes-table th { text-align: left; padding: 1rem; background: rgba(0, 0, 0, 0.4); color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
          .prizes-table td { padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #e2e8f0; vertical-align: middle; }
          .prizes-table tr:hover { background-color: rgba(255, 255, 255, 0.05); }
          .desc-cell { font-weight: bold; color: #fff; }
          .value-cell { color: #4ade80; font-weight: bold; font-family: monospace; font-size: 1.1em; }
          .text-red { color: #ef4444; }
          .winner-badge { background: #facc15; color: #000; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.8rem; }
          .pending-badge { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; color: #94a3b8; }
          .delete-btn { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5; cursor: pointer; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s; }
          .delete-btn:hover { background: rgba(239, 68, 68, 0.2); color: #fff; border-color: #ef4444; }
          .empty-message { text-align: center; padding: 3rem; color: #94a3b8; font-style: italic; }
          .text-center { text-align: center; }
        `}</style>
      </div>
    </UserLayout>
  );
}