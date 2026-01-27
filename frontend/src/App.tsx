import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterUserPage from './pages/RegisterUserPage';
import UsersPage from './pages/UsersPage';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import CategoryDetailsPage from './pages/CategoryDetailsPage';
import PlayerDetailsPage from './pages/PlayerDetailsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import EditUserPage from './pages/EditUserPage';
import AttendanceReportsPage from './pages/AttendanceReportsPage';
import { Layout } from './components/Layout';
import { Toaster } from 'sonner';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Ruta pública: Login */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rutas protegidas: Requieren autenticación */}
                    <Route element={<ProtectedRoute />}>
                        {/* El Layout agrega el Navbar a todas estas rutas */}
                        <Route element={<Layout />}>
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/register-user" element={<RegisterUserPage />} />
                            <Route path="/users" element={<UsersPage />} />
                            <Route path="/users/:id/edit" element={<EditUserPage />} />
                            <Route path="/categories" element={<CategoriesPage />} />
                            <Route path="/categories/:id" element={<CategoryDetailsPage />} />
                            <Route path="/players/:id" element={<PlayerDetailsPage />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/new" element={<CreateEventPage />} />
                            <Route path="/events/:id" element={<EventDetailsPage />} />
                            <Route path="/events/:id/edit" element={<EditEventPage />} />
                            <Route path="/matches/:id" element={<MatchDetailsPage />} />
                            <Route path="/reports/attendance" element={<AttendanceReportsPage />} />

                            {/* Landing Page de desarrollo */}
                            <Route path="/" element={<HomePage />} />
                        </Route>
                    </Route>

                    {/* Cualquier ruta desconocida redirige al inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Toaster />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;