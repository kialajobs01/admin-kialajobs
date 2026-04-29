"use client"

import { StatsCard } from '@/components/features/cards/stats-card';
import { BarChart2, Briefcase, Users, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
import UsersList from '@/components/features/users';
import { statsService } from '@/services/stats.service';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalUsers: 0,
    totalRevenue: 0,
    growthRate: 0,
    workersCount: 0,
    clientsCount: 0,
    pendingJobs: 0,
    completedJobs: 0,
    inprogressJobs: 0,
    cancelledJobs: 0,
    acceptedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsService.getDashboardStats();
        setStats(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleCardClick = (cardType: string) => {
    setSelectedCard(cardType);
  };

  const closeModal = () => {
    setSelectedCard(null);
  };

  if (loading) {
    return (
      <div className=" ">
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-40">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 flex-1">
                        <div
                          className="w-10 bg-gradient-to-t from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t"
                          style={{ height: `${Math.random() * 70 + 30}%` }}
                        ></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabela de usuários skeleton */}
            <div className="rounded-xl border bg-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
              </div>

              {/* Tabela */}
              <div className="space-y-4">
                {/* Cabeçalho */}
                <div className="grid grid-cols-5 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>

                {/* Linhas */}
                {[...Array(6)].map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-5 gap-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>
                    {[...Array(3)].map((_, cellIndex) => (
                      <div key={cellIndex} className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    ))}
                    <div className="flex gap-2 justify-end">
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className=" ">
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Visão Geral</h2>
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              Horas: {lastUpdated}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total de Trabalhos"
              value={stats.totalJobs.toString()}
              description={`${stats.acceptedJobs} aceites`}
              icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
              onClick={() => handleCardClick('jobs')}
              trend={stats.growthRate}
              variant="primary"
            />
            <StatsCard
              title="Utilizadores"
              value={stats.totalUsers.toString()}
              description={`${stats.clientsCount} clientes`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              onClick={() => handleCardClick('users')}
              variant="secondary"
            />
            <StatsCard
              title="Pagamentos de Serviços"
              value={`${stats.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`}
              description={`${stats.completedJobs} serviços completados`}
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
              onClick={() => handleCardClick('payments')}
              variant="success"
            />
            <StatsCard
              title="Crescimento"
              value={`${stats.growthRate}%`}
              description="Desde o último mês"
              icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
              onClick={() => handleCardClick('growth')}
              trend={stats.growthRate}
              variant={stats.growthRate > 0 ? "success" : "destructive"}
            />
          </div>

          <div className="">
            <UsersList />
          </div>
        </main>
      </div>

      <Dialog open={selectedCard !== null} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-[600px] ">
          {selectedCard === 'jobs' && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">Detalhes dos Trabalhos</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-700/50">
                    <h3 className="text-lg font-semibold dark:text-gray-100">Total</h3>
                    <p className="text-2xl font-bold dark:text-white">{stats.totalJobs}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                    <h3 className="text-lg font-semibold dark:text-blue-200">Aceites</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.acceptedJobs}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
                    <h3 className="text-lg font-semibold dark:text-yellow-200">Pendentes</h3>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.pendingJobs}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                    <h3 className="text-lg font-semibold dark:text-green-200">Completos</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.completedJobs}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-900/30 dark:border-purple-700">
                    <h3 className="text-lg font-semibold dark:text-purple-200">Em Progresso</h3>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{stats.inprogressJobs}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                    <h3 className="text-lg font-semibold dark:text-red-200">Cancelados</h3>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.cancelledJobs}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedCard === 'users' && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">Detalhes dos Utilizadores</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-700/50">
                    <h3 className="text-lg font-semibold dark:text-gray-100">Total</h3>
                    <p className="text-2xl font-bold dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-700">
                    <h3 className="text-lg font-semibold dark:text-blue-200">Clientes</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{stats.clientsCount}</p>
                  </div>
                  <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                    <h3 className="text-lg font-semibold dark:text-green-200">Trabalhadores</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.workersCount}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Distribuição</h3>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                      style={{
                        width: `${(stats.clientsCount / stats.totalUsers) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground dark:text-gray-400">
                    <span>Clientes: {Math.round((stats.clientsCount / stats.totalUsers) * 100)}%</span>
                    <span>Trabalhadores: {Math.round((stats.workersCount / stats.totalUsers) * 100)}%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedCard === 'payments' && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">Detalhes dos Pagamentos</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-700/50">
                  <h3 className="text-lg font-semibold dark:text-gray-100">Receita Total</h3>
                  <p className="text-2xl font-bold dark:text-white">
                    {stats.totalRevenue.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                </div>
                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                  <h3 className="text-lg font-semibold dark:text-green-200">Serviços Completados</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.completedJobs}</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                    Valor médio por serviço: {(stats.totalRevenue / (stats.completedJobs || 1)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                  </p>
                </div>
              </div>
            </>
          )}

          {selectedCard === 'growth' && (
            <>
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">Detalhes de Crescimento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className={`rounded-lg border p-4 ${stats.growthRate >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'} dark:border-gray-700`}>
                  <h3 className="text-lg font-semibold dark:text-gray-100">Taxa de Crescimento</h3>
                  <div className="flex items-center">
                    <p className={`text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                      {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate}%
                    </p>
                    {stats.growthRate >= 0 ? (
                      <ArrowUp className="h-5 w-5 text-green-600 dark:text-green-300 ml-2" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-600 dark:text-red-300 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">Desde o último mês</p>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-100">Comparativo</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-700/50">
                      <h4 className="text-sm font-medium dark:text-gray-100">Novos Trabalhos</h4>
                      <p className="text-xl font-bold dark:text-white">+15%</p>
                    </div>
                    <div className="rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-700/50">
                      <h4 className="text-sm font-medium dark:text-gray-100">Novos Utilizadores</h4>
                      <p className="text-xl font-bold dark:text-white">+22%</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
