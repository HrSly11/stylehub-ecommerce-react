import React, { useState, useId } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, CheckCircle, KeyRound, Mail, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const correoId = useId();
  const claveId = useId();

  const [formData, setFormData] = useState({
    correo: 'usuario@stylehub.com',
    clave: '1234'
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar datos de acceso
    if (!formData.correo.trim() || !formData.clave.trim()) {
      setMensaje({
        texto: 'Por favor, ingresa tu correo y contraseña.',
        tipo: 'error'
      });
      return;
    }

    const resultado = await login(formData.correo, formData.clave);

    if (resultado.success) {
      setMensaje({
        texto: `¡Bienvenido(a) ${resultado.user.nombre}! Redirigiendo...`,
        tipo: 'success'
      });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } else {
      setMensaje({
        texto: resultado.message,
        tipo: 'error'
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <span className="auth-badge">Acceso Seguro</span>
        <h2>Iniciar Sesión</h2>
        <p>Ingresa con tu cuenta para acceder a tu historial y compras.</p>
      </div>

      {/* Datos del usuario de prueba */}
      <div className="demo-account-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
          <Info size={16} /> Credenciales de prueba:
        </div>
        <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>• <strong>Correo:</strong> usuario@stylehub.com</p>
        <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>• <strong>Contraseña:</strong> 1234</p>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor={correoId}>
            <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Correo Electrónico
          </label>
          <input
            id={correoId}
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            placeholder="usuario@stylehub.com"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor={claveId}>
            <KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Contraseña
          </label>
          <input
            id={claveId}
            type="password"
            name="clave"
            value={formData.clave}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="boton" style={{ width: '100%', padding: '13px', marginTop: '10px' }}>
          <LogIn size={18} /> Ingresar a StyleHub
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
        <p>
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" style={{ color: 'var(--color-brand)', fontWeight: 700, textDecoration: 'none' }}>
            Regístrate gratis aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
