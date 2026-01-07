import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterUserPage from './pages/RegisterUserPage';
import HomePage from './pages/HomePage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Ruta pública: Login */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rutas protegidas: Requieren autenticación */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/register-user" element={<RegisterUserPage />} />
                        
                        {/* Landing Page de desarrollo */}
                        <Route path="/" element={<HomePage />} />
                    </Route>

                    {/* Cualquier ruta desconocida redirige al inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;