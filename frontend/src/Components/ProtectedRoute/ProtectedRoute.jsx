import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext/AuthContext";

const ProtectedRoute = ({ element }) => {
    const { user } = useAuth();
    const { pathname } = useLocation();

    const userPages = ['/panel'];
    const managerPages = ['/manager', '/createbooking'];
    const adminPages = ['/createlottery', '/admin'];

    const checkAccess = () => {
        if (!user?.isValid) return false;

        if (pathname === '/login') {
            switch (user?.type) {
                case 'user': return '/panel';
                case 'manager': return '/manager';
                case 'admin': return '/admin';
                default: return false;
            }
        }

        if (user?.type === 'user' && (managerPages.includes(pathname) || adminPages.includes(pathname))) {
            return '/panel';
        }

        if (user?.type === 'manager' && (userPages.includes(pathname) || adminPages.includes(pathname))) {
            return '/manager';
        }

        if (user?.type === 'admin' && (userPages.includes(pathname) || managerPages.includes(pathname))) {
            return '/admin';
        }

        return true;
    };

    const accessResult = checkAccess();

    if (accessResult === false) {
        return element;
    }

    if (typeof accessResult === 'string') {
        return <Navigate to={accessResult} replace />;
    }

    return element;
};

export default ProtectedRoute;