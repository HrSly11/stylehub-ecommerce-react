import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sparkles, ShoppingBag, User, LogOut, UserPlus, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header>
      <div className="encabezado-contenido">
        <div className="marca">
          <Link to="/">
            <div className="marca-icono">
              <Sparkles size={22} />
            </div>
            <div className="marca-texto">
              <h1>StyleHub</h1>
              <p>PREMIUM FASHION STORE</p>
            </div>
          </Link>
        </div>

        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link activo' : 'nav-link')}
          >
            Inicio
          </NavLink>

          <a href="/#opiniones" className="nav-link">
            <MessageSquare size={16} />
            Opiniones
          </a>

          {!isAuthenticated ? (
            <>
              <NavLink
                to="/registro"
                className={({ isActive }) => (isActive ? 'nav-link activo' : 'nav-link')}
              >
                <UserPlus size={16} />
                Registrarse
              </NavLink>
              <NavLink
                to="/inicio-sesion"
                className={({ isActive }) => (isActive ? 'nav-link activo' : 'nav-link')}
              >
                <User size={16} />
                Iniciar sesión
              </NavLink>
            </>
          ) : (
            <div className="nav-user-chip">
              <User size={14} style={{ color: '#818cf8' }} />
              <span>{user?.nombres || user?.nombre || 'Usuario'}</span>
              <button
                type="button"
                onClick={logout}
                className="nav-logout-btn"
                title="Cerrar sesión"
              >
                <LogOut size={12} />
                Salir
              </button>
            </div>
          )}

          <NavLink
            to="/carrito"
            className={({ isActive }) => (isActive ? 'nav-link activo' : 'nav-link')}
          >
            <ShoppingBag size={17} />
            <span>Carrito</span>
            {totalItems > 0 && (
              <span className="contador-carrito">{totalItems}</span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
