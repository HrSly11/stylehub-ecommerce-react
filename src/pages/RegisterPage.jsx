import React, { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateRegistrationData } from '../utils/userValidation';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const nombresId = useId();
  const apellidosId = useId();
  const correoId = useId();
  const telefonoId = useId();
  const ciudadId = useId();
  const direccionId = useId();
  const claveId = useId();
  const clave2Id = useId();
  const terminosId = useId();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    clave: '',
    clave2: '',
    terminos: false
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación mediante función pura
    const validation = validateRegistrationData(formData);
    if (!validation.isValid) {
      setMensaje({
        texto: validation.error,
        tipo: 'error'
      });
      return;
    }

    const resultado = await register({
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      correo: formData.correo,
      telefono: formData.telefono,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      clave: formData.clave
    });

    if (resultado.success) {
      setMensaje({
        texto: resultado.message,
        tipo: 'success'
      });
      setTimeout(() => {
        navigate('/inicio-sesion');
      }, 1800);
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
        <span className="auth-badge">Nueva Cuenta</span>
        <h2>Crear una Cuenta</h2>
        <p>Regístrate para comprar y gestionar tus pedidos en StyleHub.</p>
      </div>

      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor={nombresId}>Nombres *</label>
            <input
              id={nombresId}
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej. Harry Sly"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor={apellidosId}>Apellidos *</label>
            <input
              id={apellidosId}
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej. Rodríguez Sandoval"
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor={correoId}>Correo Electrónico *</label>
            <input
              id={correoId}
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor={telefonoId}>Teléfono / Celular</label>
            <input
              id={telefonoId}
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="987654321"
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor={ciudadId}>Ciudad / Distrito *</label>
            <input
              id={ciudadId}
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Lima"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor={direccionId}>Dirección *</label>
            <input
              id={direccionId}
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Av. Universitaria 1801"
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor={claveId}>Contraseña *</label>
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

          <div className="form-field">
            <label htmlFor={clave2Id}>Confirmar Contraseña *</label>
            <input
              id={clave2Id}
              type="password"
              name="clave2"
              value={formData.clave2}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div style={{ margin: '14px 0 22px 0' }}>
          <label htmlFor={terminosId} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              id={terminosId}
              type="checkbox"
              name="terminos"
              checked={formData.terminos}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand)' }}
            />
            <span>Acepto los términos y condiciones del servicio y privacidad</span>
          </label>
        </div>

        <button type="submit" className="boton" style={{ width: '100%', padding: '13px' }}>
          <UserPlus size={18} /> Validar y Crear Cuenta
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
        <p>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/inicio-sesion" style={{ color: 'var(--color-brand)', fontWeight: 700, textDecoration: 'none' }}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
