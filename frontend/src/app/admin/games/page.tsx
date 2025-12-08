'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface Game {
  id_jogo: number;
  id_sala: number;
  data_hora: string;
  preco_cartela: any;
  sala_nome?: string;
  status?: string;
  SALA?: { nome: string }; // Caso venha do include do Prisma
}

interface Room {
  id_sala: number;
  nome: string;
}

export default function GamesAdminPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [games, setGames] = useState<Game[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Formulário (Modal)
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    id_sala: '',
    data_hora: '',
    preco_cartela: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  // --- CARREGAMENTO DE DADOS (COM CORREÇÃO DE CACHE) ---
  const fetchData = async () => {
    const token = localStorage.getItem('bingoToken');
    if (!token) return router.push('/login');

    setLoading(true);
    try {
      // 1. Busca Jogos
      const gamesRes = await fetch(`${API_BASE}/games`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store' // <--- OBRIGATÓRIO: Ignora cache antigo
      });

      // 2. Busca Salas (para o select)
      const roomsRes = await fetch(`${API_BASE}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (gamesRes.ok && roomsRes.ok) {
        const gamesData = await gamesRes.json();
        const roomsData = await roomsRes.json();
        
        setGames(gamesData);
        setRooms(roomsData);
        console.log("Dados atualizados:", gamesData);
      } else {
        console.error("Erro ao buscar dados. Status:", gamesRes.status);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- MANIPULADORES DE AÇÃO ---

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;
    const token = localStorage.getItem('bingoToken');

    try {
      const res = await fetch(`${API_BASE}/games/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Jogo excluído com sucesso.');
        fetchData();
      } else {
        const err = await res.json();
        alert(`Erro ao excluir: ${err.message}`);
      }
    } catch (e) { alert('Erro de rede.'); }
  };

  const handleStartGame = async (id: number) => {
    const token = localStorage.getItem('bingoToken');
    if (!confirm('Iniciar o sorteio deste jogo agora?')) return;

    try {
        const res = await fetch(`${API_BASE}/games/${id}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) alert('Sorteio iniciado! ⚡');
        else alert('Erro ao iniciar sorteio.');
    } catch (e) { alert('Erro de conexão.'); }
  };

  // --- LÓGICA DO FORMULÁRIO (CRIAR / EDITAR) ---

  const openCreateModal = () => {
    setEditingGame(null);
    setFormData({ id_sala: '', data_hora: '', preco_cartela: '' });
    setShowForm(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    // Formata a data para o input datetime-local (YYYY-MM-DDTHH:mm)
    const dateObj = new Date(game.data_hora);
    // Ajuste simples de fuso horário para exibir no input
    const offset = dateObj.getTimezoneOffset() * 60000;
    const localIso = new Date(dateObj.getTime() - offset).toISOString().slice(0, 16);

    setFormData({
      id_sala: game.id_sala.toString(),
      data_hora: localIso,
      preco_cartela: Number(game.preco_cartela).toFixed(2)
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('bingoToken');
    
    const url = editingGame 
      ? `${API_BASE}/games/${editingGame.id_jogo}` 
      : `${API_BASE}/games`;
    
    const method = editingGame ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_sala: parseInt(formData.id_sala),
          data_hora: new Date(formData.data_hora).toISOString(),
          preco_cartela: parseFloat(formData.preco_cartela)
        })
      });

      if (res.ok) {
        alert(editingGame ? 'Jogo atualizado!' : 'Jogo criado!');
        setShowForm(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Erro: ${err.message}`);
      }
    } catch (e) { alert('Erro de conexão ao salvar.'); }
  };

  // --- RENDERIZAÇÃO ---

  if (loading) return (
    <UserLayout>
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Carregando sistema...</div>
    </UserLayout>
  );

  return (
    <UserLayout>
      <div className="page-container">
        
        {/* CABEÇALHO */}
        <div className="header-actions">
            <Button variant="secondary" onClick={() => router.push('/rooms')}>← Salas</Button>
            <h1 className="page-title">Gerenciar Jogos</h1>
            <Button variant="primary" onClick={() => router.push('/admin')} style={{ backgroundColor: '#a855f7' }}>Painel Admin →</Button>
        </div>

        <div className="main-content">
            {/* BOTÃO NOVO JOGO */}
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                <Button onClick={openCreateModal} style={{ backgroundColor: '#22c55e' }}>
                    + Novo Jogo
                </Button>
            </div>

            {/* TABELA DE JOGOS */}
            <div className="table-card">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Sala</th>
                            <th>Data / Hora</th>
                            <th>Preço</th>
                            <th>Status</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(game => (
                            <tr key={game.id_jogo}>
                                <td>#{game.id_jogo}</td>
                                <td style={{ fontWeight: 'bold', color: '#bfdbfe' }}>
                                    {game.SALA?.nome || rooms.find(r => r.id_sala === game.id_sala)?.nome || `Sala ${game.id_sala}`}
                                </td>
                                <td>{new Date(game.data_hora).toLocaleString()}</td>
                                <td style={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '1.1em' }}>
                                    R$ {Number(game.preco_cartela).toFixed(2)}
                                </td>
                                <td>
                                    <span className={`badge ${game.status === 'AGUARDANDO' ? 'pending' : 'active'}`}>
                                        {game.status || 'Ativo'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button onClick={() => handleStartGame(game.id_jogo)} className="action-btn start" title="Iniciar Sorteio">▶️</button>
                                    <button onClick={() => openEditModal(game)} className="action-btn edit" title="Editar">✏️</button>
                                    <button onClick={() => handleDelete(game.id_jogo)} className="action-btn delete" title="Excluir">🗑️</button>
                                </td>
                            </tr>
                        ))}
                        {games.length === 0 && (
                            <tr><td colSpan={6} className="empty-msg">Nenhum jogo cadastrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* MODAL DE CRIAÇÃO / EDIÇÃO */}
        {showForm && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{editingGame ? 'Editar Jogo' : 'Criar Novo Jogo'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Sala Vinculada</label>
                            <select 
                                value={formData.id_sala} 
                                onChange={e => setFormData({...formData, id_sala: e.target.value})}
                                required
                            >
                                <option value="">Selecione uma sala...</option>
                                {rooms.map(r => (
                                    <option key={r.id_sala} value={r.id_sala}>{r.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Data e Hora de Início</label>
                            <input 
                                type="datetime-local" 
                                value={formData.data_hora} 
                                onChange={e => setFormData({...formData, data_hora: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Preço da Cartela (R$)</label>
                            <input 
                                type="number" step="0.01" min="0" placeholder="0.00"
                                value={formData.preco_cartela} 
                                onChange={e => setFormData({...formData, preco_cartela: e.target.value})}
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
                            <Button type="submit">{editingGame ? 'Salvar Alterações' : 'Criar Jogo'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ESTILOS CSS (Glassmorphism) */}
        <style jsx>{`
            .page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; color: white; font-family: sans-serif; }
            .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
            .page-title { font-size: 2rem; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            
            .table-card {
                background: rgba(30, 41, 59, 0.75);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
                overflow-x: auto;
            }

            .custom-table { width: 100%; border-collapse: collapse; }
            .custom-table th { text-align: left; padding: 1rem; background: rgba(0,0,0,0.4); color: #94a3b8; text-transform: uppercase; font-size: 0.8rem; }
            .custom-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #e2e8f0; vertical-align: middle; }
            .custom-table tr:hover { background: rgba(255,255,255,0.05); }
            .text-center { text-align: center; }
            .empty-msg { text-align: center; padding: 3rem; color: #64748b; font-style: italic; }

            .badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
            .badge.pending { background: rgba(253, 224, 71, 0.2); color: #fde047; border: 1px solid rgba(253, 224, 71, 0.3); }
            .badge.active { background: rgba(74, 222, 128, 0.2); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }

            .actions-cell { display: flex; gap: 10px; justify-content: center; }
            .action-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; }
            .action-btn:hover { transform: scale(1.2); }

            /* MODAL STYLES */
            .modal-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
                display: flex; justify-content: center; align-items: center; z-index: 1000;
            }
            .modal-content {
                background: #1e293b; border: 1px solid #334155;
                padding: 2rem; border-radius: 16px; width: 100%; max-width: 500px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; color: white; text-align: center; }
            
            .form-group { margin-bottom: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 600; font-size: 0.9rem; }
            .form-group input, .form-group select {
                width: 100%; padding: 0.75rem; border-radius: 8px;
                border: 1px solid #475569; background: #0f172a; color: white;
                font-size: 1rem; outline: none;
            }
            .form-group input:focus, .form-group select:focus { border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2); }
            
            .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
        `}</style>
      </div>
    </UserLayout>
  );
}