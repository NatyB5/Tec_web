"use client";
import React, { useEffect, useState } from "react";
import styles from "../reports/reports.module.css";
import type { ReportResult, Relatorio1, Relatorio2, SalaMetricas } from "./types";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export default function EstatisticasPage() {
  const [report1, setReport1] = useState<ReportResult<Relatorio1> | null>(null);
  const [report2, setReport2] = useState<ReportResult<Relatorio2> | null>(null);
  const [activeTab, setActiveTab] = useState<'r1' | 'r2'>('r1');
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [searchUserId, setSearchUserId] = useState("");

  async function fetchReport(path: string, setter: (r: ReportResult) => void) {
    try {
      setLoading(true);
      const token = localStorage.getItem('bingoToken');
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBase}${path}`, {
        method: "GET",
        headers: headers,
      });
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const body = isJson ? await res.json() : await res.text();

      if (!res.ok) {
        const errorMessage = isJson && body.message ? body.message : "Erro ao buscar dados";
        setter({ ok: false, status: res.status, data: null, error: errorMessage });
      } else {
        setter({ ok: true, status: res.status, data: body });
      }
    } catch (e: any) {
      setter({ ok: false, status: 0, data: null, error: e?.message || "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    const query = searchUserId ? `?userId=${searchUserId}` : "";
    fetchReport(`/reports/relatorio1${query}`, (r) => setReport1(r as ReportResult<Relatorio1>));
  };

  // Carrega ambos os relatórios automaticamente
  useEffect(() => {
    // Decodifica token para saber se é admin (forma simplificada, ideal seria endpoint /me)
    const token = localStorage.getItem('bingoToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.isAdmin === true);
      } catch (e) {
        console.error("Erro ao decodificar token", e);
      }
    }

    fetchReport("/reports/relatorio1", (r) => setReport1(r as ReportResult<Relatorio1>));
    fetchReport("/reports/relatorio2", (r) => setReport2(r as ReportResult<Relatorio2>));
  }, []);

  return (
    <div className="page-container">
      <header>
        <nav className='navbar'>
          <div className={styles.navbarReportsPage}>
            <div className={styles.navbarLinksLeftReports}>
              {isAdmin ? (
                <a className="nav-links" href="/admin">Painel Admin</a>
              ) : (
                <>
                  <a className="nav-links" href="/profile">Minha Conta</a>
                  <a className="nav-links" href="/rooms">Salas</a>
                </>
              )}
            </div>

            <div className={styles.navbarLogoCenterReports}>
              <img src="/bingo-logo.png" alt="logo" className={styles.navbarLogoReports} />
            </div>

            <div className={styles.navbarLinksRightReports}>
              <a className="nav-links" style={{ fontWeight: 'bold', color: 'var(--primary-green)' }}>Estatísticas</a>
              {!isAdmin && <a className="nav-links" href="/como-jogar">Como Jogar</a>}
            </div>
          </div>
        </nav>
      </header>

      <main className={styles.reportsMainContent}>
        <div className={styles.reportsContainer}>
          <div className={styles.reportsHeader}>
            <h1>Relatórios e Estatísticas</h1>
            <p>Análise resumida com dois relatórios</p>
            <div className={styles.reportsActions}>
              <button
                onClick={() => setActiveTab('r1')}
                className={`${styles.exportButton} ${activeTab === 'r1' ? '' : styles.exportButtonSecondary}`}
              >
                Ver Resumo do Sistema
              </button>
              <button
                onClick={() => setActiveTab('r2')}
                className={`${styles.exportButton} ${activeTab === 'r2' ? '' : styles.exportButtonSecondary}`}
              >
                Ver Métricas por Sala
              </button>
            </div>
          </div>

          <div className={styles.reportsGrid}>
            {activeTab === 'r1' && (
            <div className={styles.reportCard}>
              <div className={styles.reportCardHeader}>
                <h2 className={styles.reportCardTitle}>Resumo do Sistema</h2>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input 
                      type="number" 
                      placeholder="ID do Usuário (Opcional)" 
                      value={searchUserId}
                      onChange={(e) => setSearchUserId(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#333' }}
                    />
                    <button 
                      onClick={handleSearch}
                      style={{ padding: '8px 16px', borderRadius: '4px', background: 'var(--primary-green)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Pesquisar
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.reportCardContent}>
                {loading && <p className={styles.timelineTime}>Carregando...</p>}
                {!loading && !report1 && <p className={styles.timelineTime}>Sem dados.</p>}
                {!loading && report1 && !report1.ok && (
                  <p className={styles.timelineTime} style={{ color: 'red', fontWeight: 'bold' }}>
                    {report1.error || "Erro ao buscar dados."}
                  </p>
                )}
                {report1 && report1.data && typeof report1.data !== 'string' && (
                  <>
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>
                          {report1.data.resumo?.hora ?? '—'}h
                        </div>
                        <div className={styles.statLabel}>Horário Mais Jogado</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>
                          {report1.data.resumo?.partidasNesseHorario ?? 0}
                        </div>
                        <div className={styles.statLabel}>Partidas Nesse Horário</div>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statValue}>
                          {report1.data.resumo?.totalPartidas ?? 0}
                        </div>
                        <div className={styles.statLabel}>Total de Partidas</div>
                      </div>
                      {report1.data.resumo?.taxaVitoria !== undefined && report1.data.resumo?.taxaVitoria !== null && (
                        <div className={styles.statItem}>
                          <div className={styles.statValue}>
                            {report1.data.resumo.taxaVitoria.toFixed(1)}%
                          </div>
                          <div className={styles.statLabel}>Taxa de Vitória</div>
                        </div>
                      )}
                    </div>

                    {/* Lista de jogos do usuário */}
                    {Array.isArray(report1.data.jogos) && report1.data.jogos.length > 0 ? (
                      <table className={styles.numbersTable} style={{ marginTop: 16 }}>
                        <thead>
                          <tr>
                            <th>Data/Hora</th>
                            <th>Sala</th>
                            <th>Preço Cartela</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report1.data.jogos.map((j: any) => (
                            <tr key={j.id}>
                              <td>{new Date(j.dataHora).toLocaleString('pt-BR')}</td>
                              <td>{j.sala || '—'}</td>
                              <td>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(j.precoCartela || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className={styles.timelineEvent}>Nenhum jogo encontrado para o usuário.</p>
                    )}
                  </>
                )}
              </div>
            </div>
            )}

            {activeTab === 'r2' && (
            <div className={styles.reportCard}>
              <div className={styles.reportCardHeader}>
                <h2 className={styles.reportCardTitle}>Métricas por Sala</h2>
              </div>
              <div className={styles.reportCardContent}>
                {loading && <p className={styles.timelineTime}>Carregando...</p>}
                {!loading && !report2 && <p className={styles.timelineTime}>Sem dados.</p>}
                {report2 && report2.data && typeof report2.data !== 'string' && (
                  Array.isArray((report2.data as Relatorio2).salas) && (report2.data as Relatorio2).salas.length > 0 ? (
                    <table className={styles.numbersTable}>
                      <thead>
                        <tr>
                          <th>Sala</th>
                          <th>Jogadores</th>
                          <th>Jogos Hoje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(report2.data as Relatorio2).salas.map((sala: SalaMetricas) => (
                          <tr key={sala.id}>
                            <td>{sala.nome}</td>
                            <td>{sala.jogadores}</td>
                            <td>{sala.jogosHoje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className={styles.timelineEvent}>Nenhuma sala encontrada.</p>
                  )
                )}
              </div>
            </div>
            )}
          </div>

          <div className={styles.reportsActions}>
            <a className={`${styles.exportButton} ${styles.exportButtonSecondary}`} href={isAdmin ? "/admin" : "/profile"}>
              ← Voltar para {isAdmin ? "Painel Admin" : "Meu Perfil"}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
