import { useEffect, useState } from 'react';
import { toast } from "sonner";

import { profileService } from '../services/profile.service';
import { statisticService } from '../services/statistic.service';
import { useAuth } from '../context/AuthContext';
import { type User } from '../types/user.types';
import { type PlayerStatsData } from '../types/statistic.types';
import { UserProfile } from '../components/users/UserProfile';
import { PlayerStatsCard } from '../components/users/PlayerStatsCard';

export default function ProfilePage() {
    const { logout } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<PlayerStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userData = await profileService.getProfile();
            setUser(userData);

            // Si el usuario tiene un perfil de jugador, cargamos sus estadísticas
            if (userData.profile?.id) {
                const statsData = await statisticService.getPlayerStats(userData.profile.id);
                setStats(statsData);
            }
        } catch {
            toast.error('No se pudo cargar la información del perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando perfil...</div>;
    if (!user) return <div className="p-8 text-center">No se encontró el usuario.</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <UserProfile user={user} onLogout={logout} />
            
            {stats && (
                <div className="mt-6">
                    <PlayerStatsCard data={stats} />
                </div>
            )}
        </div>
    );
}
