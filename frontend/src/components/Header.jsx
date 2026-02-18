import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

/**
 * Header — top navigation bar
 * Props: none (reads auth state internally)
 */
export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-xs font-bold">H</span>
          <span className="font-semibold tracking-tight text-white">HypnoScript</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-xs text-gray-500 mr-2">{user.email}</span>
              <button onClick={logout} className="btn-ghost text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/auth?mode=register" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
