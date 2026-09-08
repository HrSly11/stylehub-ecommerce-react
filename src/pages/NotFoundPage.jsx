import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-circle" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)' }}>
        <AlertTriangle size={38} />
      </div>
      <h2>404 - Página no encontrada</h2>
      <p style={{ maxWidth: '420px', margin: '8px auto 24px auto' }}>
        La ruta a la que intentas acceder no existe o fue movida.
      </p>
      <Link to="/" className="boton">
        <Home size={16} /> Volver al Inicio
      </Link>
    </div>
  );
}

export default NotFoundPage;
