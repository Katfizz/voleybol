import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types';
import { authService } from '../services/auth.service';


// Definimos qué datos y funciones tendrá nuestro contexto
interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

// Creamos el contexto con un valor inicial nulo
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar el contexto fácilmente
// Esto te permite hacer: const { user } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Al cargar la app, verificamos si hay sesión guardada
    useEffect(() => {
        const checkAuth = () => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login(email, password);
            if (response.ok && response.user) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
            }
        } catch (error) {
            // Relanzamos el error para que el componente de Login (la vista) pueda mostrar el mensaje rojo
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Valores que se compartirán en toda la app
    const value = {
        user,
        isAuthenticated: !!user, // true si user existe, false si es null
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {/* 
              Si está cargando (verificando token), no mostramos nada para evitar parpadeos.
              O podrías mostrar un <Spinner /> aquí.
            */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};