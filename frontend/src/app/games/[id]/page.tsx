'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserLayout from '@/app/components/UserLayout';
import Button from '@/app/components/button';

const API_BASE = 'http://localhost:3333';

// --- TENTATIVA DE PEGAR ID DO USUÁRIO ---
const getUserId = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('bingoToken');
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload).sub;
    } catch (e) { console.error(e); }
  }
  return '1'; // Fallback para teste
};

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id;
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState('Carregando...');
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]); 
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [myCards, setMyCards] = useState<any[]>([]); // Cartelas do usuário
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');

  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. CARREGAR DADOS INICIAIS (Jogo + Cartelas)
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('bingoToken'); // 1. Pega o token salvo

      try {
        // A. Busca dados do Jogo
        const gameRes = await fetch(`${API_BASE}/games/${gameId}`);
        if (gameRes.ok) {
          const gameData = await gameRes.json();
          
          if (gameData.numeros_sorteados) {
            setDrawnNumbers(gameData.numeros_sorteados);
            // Pega o último número do array com segurança
            if (gameData.numeros_sorteados.length > 0) {
                setLastNumber(gameData.numeros_sorteados[gameData.numeros_sorteados.length - 1]);
            }
          }
          setGameStatus(gameData.status || 'Ativo');
        }

        // B. Busca Cartelas do Usuário (CORREÇÃO AQUI) 🛠️
        if (token) {
            // Usa a rota 'my/cards' que lê o ID do usuário direto do token no backend
            const cardsRes = await fetch(`${API_BASE}/cards/my/cards?gameId=${gameId}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Envia o token para autenticar
                }
            });

            if (cardsRes.ok) {
              const cardsData = await cardsRes.json();
              setMyCards(cardsData);
              console.log("🎟️ Cartelas carregadas com sucesso:", cardsData);
            } else {
              console.warn("⚠️ Falha ao carregar cartelas. Status:", cardsRes.status);
            }
        } else {
            console.warn("⚠️ Usuário não está logado (sem token).");
        }

      } catch (error) {
        console.error("Erro no fetch inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gameId]);

  // 2. CONEXÃO EM TEMPO REAL (SSE)
  useEffect(() => {
    const userId = getUserId();
    const url = `${API_BASE}/games/${gameId}/stream?userId=${userId}`;
    
    setConnectionStatus('Conectando...');
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('🟢 Conectado ao Sorteio');
      console.log("SSE Aberto");
    };

    es.onmessage = (event) => {
      // O backend envia o JSON dentro de data
      const payload = JSON.parse(event.data);
      const { type, data } = payload;

      console.log("📩 Evento:", type, data);

      if (type === 'number_drawn') {
        setLastNumber(data.number);
        setDrawnNumbers(data.drawnNumbers);
      }
      if (type === 'bingo_winner') {
        alert(`🏆 BINGO! Vencedor: ${data.winnerName}`);
        setGameStatus('Finalizado');
      }
      if (type === 'init') {
        setDrawnNumbers(data.drawnNumbers);
      }
    };

    es.onerror = (err) => {
      setConnectionStatus('🔴 Erro na Conexão');
      console.error("Erro SSE", err);
    };

    return () => es.close();
  }, [gameId]);

  if (loading) return <div className="p-10 text-center text-white">Carregando sala...</div>;

  return (
    <UserLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#333' }}>
        
        {/* CABEÇALHO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <Button variant="secondary" onClick={() => router.push('/rooms')}>Sair</Button>
          <div>
            <h1 style={{ margin: 0 }}>Sala #{gameId}</h1>
            <small>Status: {connectionStatus}</small>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          
          {/* ESQUERDA: ÁREA DO SORTEIO */}
          <div>
            <div style={{ 
              background: '#6366f1', color: 'white', padding: '30px', 
              borderRadius: '15px', textAlign: 'center', marginBottom: '20px' 
            }}>
              <h2 style={{ margin: 0 }}>Último Número</h2>
              <div style={{ fontSize: '5rem', fontWeight: 'bold' }}>{lastNumber || '--'}</div>
            </div>

            <div style={{ background: 'white', padding: '15px', borderRadius: '10px' }}>
              <h3>Sorteados ({drawnNumbers.length}/75)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Array.from({length: 75}, (_, i) => i + 1).map(n => (
                  <span key={n} style={{
                    width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', fontSize: '0.8rem',
                    background: drawnNumbers.includes(n) ? '#22c55e' : '#eee',
                    color: drawnNumbers.includes(n) ? 'white' : '#999'
                  }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* DIREITA: MINHAS CARTELAS */}
          <div>
            <h3>Minhas Cartelas ({myCards.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myCards.map((card) => (
                <div key={card.id_cartela} style={{ 
                  background: 'white', padding: '10px', borderRadius: '10px', border: '2px solid #ccc' 
                }}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Cartela #{card.id_cartela}</div>
                  
                  {/* GRID 5x5 DA CARTELA */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px' }}>
                    {/* Renderiza os números da cartela */}
                    {/* IMPORTANTE: Aqui assumo que o backend manda NUMEROS_CARTELA como lista. 
                        Se você já implementou a matriz no backend, ajuste aqui. 
                        Vou usar a lógica de renderizar a lista plana que vem do banco. */}
                    {renderCardGrid(card.NUMEROS_CARTELA, drawnNumbers)}
                  </div>
                </div>
              ))}
              {myCards.length === 0 && <p>Você não comprou cartelas para este jogo.</p>}
            </div>
          </div>

        </div>
      </div>
    </UserLayout>
  );
}

// Função auxiliar para montar o grid 5x5 com o espaço livre no meio
function renderCardGrid(numerosDb: any[], drawnNumbers: number[]) {
  // Cria um array de 25 posições
  const grid = [];
  let numIndex = 0;

  for (let i = 0; i < 25; i++) {
    const isCenter = i === 12; // Posição central (index 12)
    let value = 0;
    let isMarked = false;

    if (isCenter) {
      value = 0; // Free space
      isMarked = true;
    } else {
      const numObj = numerosDb[numIndex];
      value = numObj ? numObj.numero : 0;
      isMarked = drawnNumbers.includes(value);
      numIndex++;
    }

    grid.push(
      <div key={i} style={{
        aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isMarked ? '#fbbf24' : '#f3f4f6', // Amarelo se marcado
        color: isMarked ? 'black' : '#666',
        fontWeight: 'bold', fontSize: '0.9rem', borderRadius: '4px'
      }}>
        {isCenter ? '★' : value}
      </div>
    );
  }
  return grid;
}