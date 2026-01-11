import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '20px' }}>
                {/* Aquí se renderizará la página actual (Profile, Home, etc.) */}
                <Outlet />
            </main>
        </div>
    );
};
