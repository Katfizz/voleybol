import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

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
                        
                        {/* Por ahora, redirigimos la raíz al perfil */}
                        <Route path="/" element={<Navigate to="/profile" replace />} />
                    </Route>

                    {/* Cualquier ruta desconocida redirige al inicio */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;