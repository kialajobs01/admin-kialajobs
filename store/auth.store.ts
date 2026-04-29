// store/auth.store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { setAuthCookie, getAuthCookie, removeAuthCookie } from '@/lib/cookies';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN' | 'WORKER' | 'CLIENT';
}

interface ResponseLogin {
    status: string;
    data: any;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<ResponseLogin | undefined>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    isAdmin: () => boolean;
    hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    initializeAuth: () => Promise<void>; // Nova função
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isLoading: false,
            error: null,
            hasHydrated: false,

            setHasHydrated: (state) => {
                set({ hasHydrated: state });
            },


            // store/auth.store.ts - versão mais robusta
            initializeAuth: async () => {
                const { hasHydrated } = get();
                if (!hasHydrated) {
                    console.log('⏳ Waiting for hydration...');
                    return;
                }

                const cookieToken = getAuthCookie();
                console.log('🔍 initializeAuth - Cookie token:', !!cookieToken);

                if (cookieToken) {
                    set({ token: cookieToken, isLoading: true });

                    try {
                        console.log('📡 initializeAuth - Fetching user data...');
                        const response = await api.get('/users/get/me', {
                            headers: {
                                Authorization: `Bearer ${cookieToken}`
                            }
                        });

                        console.log('📊 initializeAuth - Full API response:', response.data);

                        // EXTRAÇÃO ROBUSTA - funciona com ambas as estruturas
                        let userData = null;

                        // Estrutura do /users/get/me: { data: { user: { ... } } }
                        if (response.data?.data?.user) {
                            userData = response.data.data.user;
                        }
                        // Estrutura do login: { data: { ...userData } }
                        else if (response.data?.data) {
                            userData = response.data.data;
                        }
                        // Fallback
                        else if (response.data) {
                            userData = response.data;
                        }

                        console.log('👤 initializeAuth - Extracted user:', userData);
                        console.log('👤 initializeAuth - User role:', userData?.role);

                        if (!userData || !userData.role) {
                            throw new Error('Estrutura de dados inválida ou role não encontrado');
                        }

                        // Verifica se é admin
                        if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
                            console.log('❌ initializeAuth - User is not admin');
                            removeAuthCookie();
                            set({
                                token: null,
                                user: null,
                                isLoading: false,
                                error: 'Acesso negado. Apenas administradores podem acessar.'
                            });
                            return;
                        }

                        // Sucesso - atualiza o state
                        set({
                            token: cookieToken,
                            user: userData,
                            isLoading: false,
                            error: null
                        });

                        console.log('✅ initializeAuth - Successful - User is admin');

                    } catch (error) {
                        console.error('❌ initializeAuth - Failed:', error);
                        removeAuthCookie();
                        set({
                            token: null,
                            user: null,
                            isLoading: false,
                            error: 'Sessão expirada. Faça login novamente.'
                        });
                    }
                } else {
                    set({
                        token: null,
                        user: null,
                        isLoading: false,
                        error: null
                    });
                }
            },

            
            login: async (email, password): Promise<ResponseLogin | undefined> => {
                set({ isLoading: true, error: null });
                try {
                    console.log('🚀 Starting login process...');
                    const response = await api.post('/auth/login', { email, password });
                    console.log('✅ Login API response received');

                    const { token, user } = response.data.data;
                    console.log('👤 User role:', user.role);

                    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
                        console.log('❌ Access denied - user is not admin');
                        set({
                            error: 'Acesso negado. Apenas administradores podem acessar o painel.',
                            isLoading: false,
                        });
                        return undefined;
                    }

                    console.log('🍪 Setting auth cookie...');
                    await setAuthCookie(token);

                    const cookieCheck = getAuthCookie();
                    console.log('🍪 Cookie verification:', !!cookieCheck);

                    if (!cookieCheck) {
                        console.warn('⚠️ Cookie not found after setting, but continuing...');
                    }

                    console.log('💾 Updating auth state...');
                    set({
                        token,
                        user,
                        isLoading: false,
                        error: null
                    });

                    console.log('✅ Login completed successfully');
                    return response.data as ResponseLogin;
                } catch (error: any) {
                    console.error('❌ Login error:', error);
                    const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
                    set({
                        error: errorMessage,
                        isLoading: false,
                    });
                    return undefined;
                }
            },

            logout: () => {
                console.log('🚪 Logging out...');
                removeAuthCookie();
                set({
                    token: null,
                    user: null,
                    error: null
                });
            },

            checkAuth: async () => {
                // Agora usa a nova função initializeAuth
                await get().initializeAuth();
            },

            isAdmin: () => {
                const { user } = get();
                return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                user: state.user
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                    console.log('✅ Store rehydrated');

                    // Ao reidratar, verifica se tem token no localStorage
                    // e sincroniza com o cookie se necessário
                    if (state.token && !getAuthCookie()) {
                        console.log('🔄 Reapplying cookie from localStorage');
                        setAuthCookie(state.token);
                    }
                }
            },
        }
    )
);