import React from 'react';
import { ShieldCheck, Truck, CreditCard, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-brand">
          <h4>StyleHub Store</h4>
          <p>Proyecto Académico de E-commerce con React.js • Módulo Front End - PUCP</p>
        </div>

        <div className="footer-meta">
          <p style={{ color: '#ffffff', fontWeight: 600, marginBottom: '4px' }}>
            Desarrollado por: Harry Sly Rodríguez Sandoval
          </p>
          <p style={{ fontSize: '0.82rem' }}>
            Grupo 4 &copy; {new Date().getFullYear()} StyleHub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
