'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

interface Game {
  id_jogo: number;
  data_hora: string;
  preco_cartela: any;
  // O status pode não vir do banco, então deixamos opcional na interface
  status?: string; 
  id_usuario_vencedor?: number | null; // Adicionado para calcular status
  id_sala: number;
  _count?: {
    CARTELA: number;
  };
}

export default function RoomGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;

  useEffect(() => {
    fetchGames();
  }, [roomId]);

  const fetchGames = async () => {
    const token = localStorage.getItem('bingoToken');
    try {
      const res = await fetch(`${API_BASE}/games`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (res.ok) {
        const data = await res.json();
        const roomGames = data.filter((g: any) => g.id_sala === Number(roomId));
        setGames(roomGames);
      }
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para determinar o status com segurança
  const getGameStatus = (game: Game) => {
    if (game.status) return game.status; // Se o backend mandar, usa.
    
    // Se não, calcula baseado nos dados:
    if (game.id_usuario_vencedor) return 'FINALIZADO';
    
    const gameDate = new Date(game.data_hora);
    const now = new Date();
    
    // Se a data já passou e não tem vencedor, provavelmente está rolando ou aguardando start manual
    // Para simplificar: Se data < agora, consideramos 'ATIVO' ou 'AGUARDANDO' dependendo da regra
    if (now >= gameDate) return 'ATIVO';
    
    return 'AGUARDANDO';
  };

  const handleBuyCard = async (gameId: number) => {
    const token = localStorage.getItem('bingoToken');
    
    if (!token) {
      alert('Você precisa estar logado para comprar cartelas.');
      router.push('/login');
      return;
    }

    if (!confirm('Deseja comprar 1 cartela para este jogo?')) return;

    setBuyingId(gameId);

    try {
      const response = await fetch(`${API_BASE}/games/buy-cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_jogo: gameId,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Cartela comprada com sucesso! 🎟️');
        fetchGames();
      } else {
        const errorData = await response.json();
        alert(`Erro na compra: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao comprar cartela:', error);
      alert('Erro de conexão ao tentar comprar cartela.');
    } finally {
      setBuyingId(null);
    }
  };

  const handleEnterGame = (gameId: number) => {
    router.push(`/games/${gameId}`);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="loading">Carregando jogos...</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="games-container">
        <div className="header-actions">
          <Button 
            variant="secondary" 
            onClick={() => router.push('/rooms')}
            className="back-button"
          >
            ← Voltar para Salas
          </Button>
          <h1 className="page-title">Jogos da Sala #{roomId}</h1>
        </div>

        <div className="games-grid">
          {games.map((game) => {
            const status = getGameStatus(game); // Calcula o status aqui
            const statusClass = status.toLowerCase(); // Agora é seguro usar toLowerCase

            return (
              <div key={game.id_jogo} className="game-card">
                <div className="game-info">
                  <h3>Jogo #{game.id_jogo}</h3>
                  <div className="game-details">
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`status-badge ${statusClass}`}>
                        {status}
                      </span>
                    </p>
                    <p><strong>Preço:</strong> R$ {Number(game.preco_cartela).toFixed(2)}</p>
                    <p><strong>Cartelas Vendidas:</strong> {game._count?.CARTELA || 0}</p>
                    <p><strong>Data:</strong> {new Date(game.data_hora).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="game-actions">
                  <Button 
                    onClick={() => handleBuyCard(game.id_jogo)}
                    disabled={buyingId === game.id_jogo}
                    className="buy-button"
                    style={{ marginBottom: '10px', width: '100%' }}
                  >
                    {buyingId === game.id_jogo ? 'Comprando...' : 'Comprar Cartela 🎟️'}
                  </Button>

                  <Button 
                    variant="primary"
                    onClick={() => handleEnterGame(game.id_jogo)}
                    className="enter-button"
                    style={{ width: '100%' }}
                  >
                    Entrar no Jogo ▶️
                  </Button>
                </div>
              </div>
            );
          })}

          {games.length === 0 && (
            <div className="no-games">
              <p>Nenhum jogo encontrado nesta sala.</p>
            </div>
          )}
        </div>

        <style jsx>{`
          .games-container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .header-actions {
            display: flex;
            align-items: center;
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .page-title {
            color: #fff;
            font-size: 2rem;
            margin: 0;
          }

          .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }

          .game-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 1rem;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
          }

          .game-info h3 {
            color: #fff;
            margin-top: 0;
            margin-bottom: 1rem;
            font-size: 1.5rem;
          }

          .game-details p {
            color: rgba(255, 255, 255, 0.8);
            margin: 0.5rem 0;
          }

          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.875rem;
            font-weight: bold;
            text-transform: uppercase;
          }

          .status-badge.aguardando { background: #f59e0b; color: #000; }
          .status-badge.ativo { background: #10b981; color: #fff; }
          .status-badge.finalizado { background: #ef4444; color: #fff; }

          .no-games {
            grid-column: 1 / -1;
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 3rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 1rem;
          }

          .loading {
            text-align: center;
            color: #fff;
            font-size: 1.2rem;
            margin-top: 3rem;
          }
        `}</style>
      </div>
    </UserLayout>
  );
}