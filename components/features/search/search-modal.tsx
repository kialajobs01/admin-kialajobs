'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  X, 
  Clock, 
  User, 
  Briefcase, 
  CreditCard, 
  Crown,
  FileText,
  History,
  Trash2,
  ArrowRight,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType, usersService } from '@/types/user';
import { Job } from '@/types/job';
import { Payment } from '@/types/payment';
import { Subscription } from '@/types/subscription';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSelect: (type: string, id: string) => void;
}

interface SearchHistoryItem {
  id: string;
  type: 'user' | 'job' | 'payment' | 'subscription';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  timestamp: number;
}

export function SearchModal({ isOpen, onClose, onItemSelect }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    users: UserType[];
    jobs: Job[];
    payments: Payment[];
    subscriptions: Subscription[];
  }>({
    users: [],
    jobs: [],
    payments: [],
    subscriptions: []
  });
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'jobs' | 'payments' | 'subscriptions'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('admin-search-history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Focar no input quando o modal abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Buscar dados
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ users: [], jobs: [], payments: [], subscriptions: [] });
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você implementaria as chamadas reais para a API
      // Por enquanto, vou simular uma busca
      const allUsers = await usersService.getAllUsers();
      
      const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.phone?.toLowerCase().includes(query.toLowerCase())
      );

      // Simular outras buscas (substitua por chamadas reais quando disponíveis)
      const filteredJobs: Job[] = []; // await jobsService.searchJobs(query);
      const filteredPayments: Payment[] = []; // await paymentsService.searchPayments(query);
      const filteredSubscriptions: Subscription[] = []; // await subscriptionsService.searchSubscriptions(query);

      setSearchResults({
        users: filteredUsers,
        jobs: filteredJobs,
        payments: filteredPayments,
        subscriptions: filteredSubscriptions
      });
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const addToHistory = (item: Omit<SearchHistoryItem, 'timestamp'>) => {
    const historyItem: SearchHistoryItem = {
      ...item,
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.id !== item.id);
      const newHistory = [historyItem, ...filtered].slice(0, 10); // Manter apenas 10 itens
      localStorage.setItem('admin-search-history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('admin-search-history');
  };

  const handleItemClick = (item: SearchHistoryItem) => {
    onItemSelect(item.type, item.id);
    addToHistory(item);
    onClose();
  };

  const handleResultClick = (type: 'user' | 'job' | 'payment' | 'subscription', item: any) => {
    const historyItem: Omit<SearchHistoryItem, 'timestamp'> = {
      id: item.id,
      type,
      title: getItemTitle(type, item),
      subtitle: getItemSubtitle(type, item),
      icon: getItemIcon(type)
    };

    addToHistory(historyItem);
    onItemSelect(type, item.id);
    onClose();
  };

  const getItemTitle = (type: string, item: any): string => {
    switch (type) {
      case 'user':
        return item.name;
      case 'job':
        return item.title;
      case 'payment':
        return `Pagamento #${item.id.slice(-8)}`;
      case 'subscription':
        return `Subscrição ${item.plan}`;
      default:
        return 'Item';
    }
  };

  const getItemSubtitle = (type: string, item: any): string => {
    switch (type) {
      case 'user':
        return item.email;
      case 'job':
        return `R$ ${item.price}`;
      case 'payment':
        return `R$ ${item.amount}`;
      case 'subscription':
        return item.user?.email || '';
      default:
        return '';
    }
  };

  const getItemIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'subscription':
        return <Crown className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'job':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'payment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'subscription':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredResults = {
    users: activeTab === 'all' || activeTab === 'users' ? searchResults.users : [],
    jobs: activeTab === 'all' || activeTab === 'jobs' ? searchResults.jobs : [],
    payments: activeTab === 'all' || activeTab === 'payments' ? searchResults.payments : [],
    subscriptions: activeTab === 'all' || activeTab === 'subscriptions' ? searchResults.subscriptions : []
  };

  const hasResults = Object.values(filteredResults).some(arr => arr.length > 0);
  const hasHistory = searchHistory.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar utilizadores, trabalhos, pagamentos, subscrições..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 h-12 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
            {[
              { id: 'all' as const, label: 'Tudo', icon: Search },
              { id: 'users' as const, label: 'Utilizadores', icon: Users },
              { id: 'jobs' as const, label: 'Trabalhos', icon: Briefcase },
              { id: 'payments' as const, label: 'Pagamentos', icon: CreditCard },
              { id: 'subscriptions' as const, label: 'Subscrições', icon: Crown }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {searchQuery ? (
            // Resultados da busca
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">A pesquisar...</p>
                </div>
              ) : hasResults ? (
                <div className="space-y-4">
                  {/* Utilizadores */}
                  {filteredResults.users.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Utilizadores ({filteredResults.users.length})
                      </h3>
                      <div className="grid gap-2">
                        {filteredResults.users.map(user => (
                          <Card 
                            key={user.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleResultClick('user', user)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={cn(
                                    "capitalize",
                                    user.role === 'ADMIN' && "bg-purple-100 text-purple-800 border-purple-200",
                                    user.role === 'WORKER' && "bg-blue-100 text-blue-800 border-blue-200",
                                    user.role === 'CLIENT' && "bg-green-100 text-green-800 border-green-200"
                                  )}>
                                    {user.role.toLowerCase()}
                                  </Badge>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trabalhos */}
                  {filteredResults.jobs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Trabalhos ({filteredResults.jobs.length})
                      </h3>
                      <div className="grid gap-2">
                        {filteredResults.jobs.map(job => (
                          <Card 
                            key={job.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleResultClick('job', job)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-100 rounded-full">
                                    <Briefcase className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{job.title}</p>
                                    <p className="text-sm text-muted-foreground">R$ {job.price}</p>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pagamentos */}
                  {filteredResults.payments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pagamentos ({filteredResults.payments.length})
                      </h3>
                      <div className="grid gap-2">
                        {filteredResults.payments.map(payment => (
                          <Card 
                            key={payment.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleResultClick('payment', payment)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 rounded-full">
                                    <CreditCard className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Pagamento #{payment.id.slice(-8)}</p>
                                    <p className="text-sm text-muted-foreground">R$ {payment.amount}</p>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subscrições */}
                  {filteredResults.subscriptions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Crown className="h-4 w-4" />
                        Subscrições ({filteredResults.subscriptions.length})
                      </h3>
                      <div className="grid gap-2">
                        {filteredResults.subscriptions.map(subscription => (
                          <Card 
                            key={subscription.id} 
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleResultClick('subscription', subscription)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-yellow-100 rounded-full">
                                    <Crown className="h-4 w-4 text-yellow-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Subscrição {subscription.plan}</p>
                                    <p className="text-sm text-muted-foreground">{subscription.user?.email}</p>
                                  </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum resultado encontrado para {searchQuery}</p>
                </div>
              )}
            </div>
          ) : (
            // Histórico de pesquisas
            <div className="space-y-6">
              {hasHistory && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Pesquisas Recentes
                    </h3>
                    <Button variant="ghost" size="sm" onClick={clearHistory} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Limpar
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    {searchHistory.map((item) => (
                      <Card 
                        key={`${item.type}-${item.id}-${item.timestamp}`}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("p-2 rounded-full", getTypeColor(item.type))}>
                                {item.icon}
                              </div>
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Sugestões de busca */}
              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Sugestões de Pesquisa
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'user', label: 'Utilizadores', icon: Users },
                    { type: 'job', label: 'Trabalhos', icon: Briefcase },
                    { type: 'payment', label: 'Pagamentos', icon: CreditCard },
                    { type: 'subscription', label: 'Subscrições', icon: Crown }
                  ].map((suggestion) => (
                    <Button
                      key={suggestion.type}
                      variant="outline"
                      className="h-auto py-3 justify-start gap-3"
                      onClick={() => setActiveTab(suggestion.type as any)}
                    >
                      <suggestion.icon className="h-4 w-4" />
                      <span>{suggestion.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}