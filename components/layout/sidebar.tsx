'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Home,
    Users,
    Shield,
    FileText,
    Settings,
    Briefcase,
    UserCheck,
    UserX,
    BarChart2,
    CreditCard,
    Archive,
    Tag,
    HelpCircle,
    ChevronDown,
    Menu,
    X,
    PieChart,
    ClipboardList,
    Flag,
    Ban
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export type SidebarItem = {
    title: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
    subItems?: SidebarItem[];
    disabled?: boolean;
    disabledReason?: string;
};

export type SidebarSection = {
    title?: string;
    items: SidebarItem[];
};

interface SidebarProps {
    sideCount?: {
        jobsCount?: number;
        usersCount?: number;
        categoriesCount?: number;
    };
}

export const Sidebar = ({ sideCount }: SidebarProps) => {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Fechar sidebar mobile ao mudar de rota
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    const isActive = (href: string, subItems?: SidebarItem[]) => {
        if (pathname === href) return true;
        if (subItems) {
            return subItems.some(subItem => pathname.startsWith(subItem.href));
        }
        return false;
    };

    const sidebarSections: SidebarSection[] = [
        {
            items: [
                {
                    title: 'Dashboard',
                    href: '/dashboard',
                    icon: <Home className="size-4" />
                }
            ]
        },
        {
            title: 'Gestão de Conteúdo',
            items: [ 
                {
                    title: 'Trabalhos',
                    href: '/dashboard/jobs',
                    icon: <ClipboardList className="size-4" />,
                    badge: sideCount?.jobsCount
                },
                {
                    title: 'Categorias',
                    href: '/dashboard/categories',
                    icon: <Tag className="size-4" />,
                    badge: sideCount?.categoriesCount
                }
            ]
        },
        {
            title: 'Gestão de Utilizadores',
            items: [
                {
                    title: 'Todos Utilizadores',
                    href: '/dashboard/users',
                    icon: <Users className="size-4" />,
                    badge: sideCount?.usersCount
                },
                {
                    title: 'Trabalhadores',
                    href: '/dashboard/workers',
                    icon: <UserCheck className="size-4" />,
                    subItems: [
                        {
                            title: 'Verificação',
                            href: '/dashboard/verification-requests',
                            icon: <Shield className="size-3" />
                        },
                        {
                            title: 'Trabalhadores Top',
                            href: '/dashboard/workers',
                            icon: <BarChart2 className="size-3" />
                        }
                    ]
                },
                {
                    title: 'Clientes',
                    href: '/dashboard/clients',
                    icon: <Users className="size-4" />
                },
                {
                    title: 'Administradores',
                    href: '/dashboard/admins',
                    icon: <Shield className="size-4" />
                },
                {
                    title: 'Utilizadores Bloqueados',
                    href: '/dashboard/blocked-users',
                    icon: <UserX className="size-4" />, 
                },
                {
                    title: 'Pedidos Eliminação',
                    href: '/dashboard/deletion-requests',
                    icon: <Archive className="size-4" />, 
                }
            ]
        },
        {
            title: 'Moderação',
            items: [
                {
                    title: 'Denúncias',
                    href: '/dashboard/reports',
                    icon: <Flag className="size-4" />,
                    disabled: true,
                    disabledReason: 'Em breve'
                },
                {
                    title: 'Disputas',
                    href: '/dashboard/disputes',
                    icon: <HelpCircle className="size-4" />,
                    disabled: true,
                    disabledReason: 'Em breve'
                }
            ]
        },
        {
            title: 'Administração',
            items: [
                {
                    title: 'Pagamentos',
                    href: '/dashboard/payments',
                    icon: <CreditCard className="size-4" />,
                    subItems: [
                        {
                            title: 'Transações',
                            href: '/dashboard/transactions',
                            icon: <CreditCard className="size-3" />
                        },
                        {
                            title: 'Subscrições',
                            href: '/dashboard/subscriptions',
                            icon: <PieChart className="size-3" />
                        }
                    ]
                },
                {
                    title: 'Relatórios',
                    href: '/dashboard/analytics',
                    icon: <BarChart2 className="size-4" />,
                    disabled: true,
                    disabledReason: 'Em breve'
                },
                {
                    title: 'Logs do Sistema',
                    href: '/dashboard/system-logs',
                    icon: <FileText className="size-4" />
                },
                {
                    title: 'Configurações',
                    href: '/settings',
                    icon: <Settings className="size-4" />,
                    disabled: true,
                    disabledReason: 'Em breve'
                }
            ]
        }
    ];

    const renderSidebarItem = (item: SidebarItem, level = 0) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems.has(item.title);
        const active = isActive(item.href, item.subItems);

        return (
            <div key={item.href} className="space-y-1">
                <div className="relative">
                    {item.disabled ? ( 
                        <div
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group cursor-not-allowed",
                                "text-muted-foreground/50 bg-muted/20",
                                level > 0 && "ml-4 pl-3 text-xs"
                            )}
                            title={item.disabledReason}
                        >
                            <div className="text-muted-foreground/50">
                                {item.icon}
                            </div>
                            
                            <span className={cn(
                                "transition-all duration-200 whitespace-nowrap",
                                isCollapsed && level === 0 ? "opacity-0 w-0" : "opacity-100 w-auto"
                            )}>
                                {item.title}
                            </span>

                            <div className="ml-auto flex items-center gap-1">
                                {item.badge !== undefined && (
                                    <Badge 
                                        variant="outline"
                                        className={cn(
                                            "ml-auto flex size-5 items-center justify-center p-0 text-xs transition-all bg-muted/50",
                                            isCollapsed && level === 0 && "opacity-0"
                                        )}
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                                <Ban className="size-3 text-muted-foreground/50" />
                            </div>
                        </div>
                    ) : (
                        // Item habilitado
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group",
                                "hover:bg-accent hover:text-accent-foreground",
                                active 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "text-muted-foreground",
                                level > 0 && "ml-4 pl-3 text-xs"
                            )}
                            onClick={(e) => {
                                if (hasSubItems) {
                                    e.preventDefault();
                                    toggleExpanded(item.title);
                                }
                            }}
                        >
                            <div className={cn(
                                "transition-transform duration-200",
                                active && "scale-110"
                            )}>
                                {item.icon}
                            </div>
                            
                            <span className={cn(
                                "transition-all duration-200 whitespace-nowrap",
                                isCollapsed && level === 0 ? "opacity-0 w-0" : "opacity-100 w-auto"
                            )}>
                                {item.title}
                            </span>

                            <div className="ml-auto flex items-center gap-1">
                                {item.badge !== undefined && (
                                    <Badge 
                                        variant={active ? "secondary" : "default"}
                                        className={cn(
                                            "ml-auto flex size-5 items-center justify-center p-0 text-xs transition-all",
                                            isCollapsed && level === 0 && "opacity-0"
                                        )}
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                                {hasSubItems && (
                                    <ChevronDown 
                                        className={cn(
                                            "size-3 transition-transform duration-200",
                                            isExpanded && "rotate-180",
                                            isCollapsed && level === 0 && "opacity-0"
                                        )} 
                                    />
                                )}
                            </div>
                        </Link>
                    )}

                    {/* Indicador ativo */}
                    {active && level === 0 && !item.disabled && (
                        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                </div>

                {/* Subitems com animação */}
                {hasSubItems && isExpanded && (
                    <div 
                        className="overflow-hidden transition-all duration-300"
                        style={{
                            maxHeight: isExpanded ? `${item.subItems!.length * 40}px` : '0px'
                        }}
                    >
                        <div className="space-y-1 border-l border-border ml-3 pl-1">
                            {item.subItems!.map(subItem => 
                                renderSidebarItem(subItem, level + 1)
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <> 
            <div className="flex items-center justify-between border-b bg-background p-4 md:hidden fixed top-0 left-0 right-0 z-50 h-14">
                <Link href="" className="flex items-center gap-2 font-semibold">
                    <Shield className="h-6 w-6" />
                    <span>Kiala Jobs Admin</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
            </div>
 
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
 
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-all duration-300 md:sticky md:top-0 md:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    isCollapsed && "w-16"
                )}
            >
                {/* Header */}
                <div className="flex h-14 items-center justify-between border-b px-4 lg:h-[60px] shrink-0">
                    <Link 
                        href="" 
                        className={cn(
                            "flex items-center gap-2 font-semibold transition-all duration-200 whitespace-nowrap",
                            isCollapsed && "justify-center w-full"
                        )}
                    >
                        <Shield className="h-6 w-6 shrink-0" />
                        <span className={cn(
                            "transition-all duration-200",
                            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                        )}>
                            Kiala Jobs
                        </span>
                    </Link>
                    
                    <div className="flex items-center gap-1"> 
                        {/* Toggle Collapse - apenas desktop */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex shrink-0"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <ChevronDown className={cn(
                                "size-4 transition-transform duration-200",
                                isCollapsed && "rotate-180"
                            )} />
                        </Button>
                    </div>
                </div>

                {/* Navigation com Scroll */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
                    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                        {sidebarSections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="space-y-1">
                                {section.title && (
                                    <h3 className={cn(
                                        "px-4 pt-4 text-xs font-semibold uppercase text-muted-foreground transition-all duration-200 whitespace-nowrap",
                                        isCollapsed ? "opacity-0 text-center text-[10px] h-0 pt-0" : "opacity-100 h-auto"
                                    )}>
                                        {section.title}
                                    </h3>
                                )}
                                {section.items.map((item) => renderSidebarItem(item))}
                            </div>
                        ))}
                    </nav>
                </div> 
            </div>
        </>
    );
};