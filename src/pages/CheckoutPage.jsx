import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Smartphone, Truck, CheckCircle, ShoppingBag, ArrowLeft, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPedido } from '../services/api';

export function CheckoutPage() {
  const { items, subtotal, shippingCost, total, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    documento: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    referencia: '',
    metodoPago: 'tarjeta',
    titular: '',
    numeroTarjeta: '',
    vencimiento: '',
    cvv: '',
    numeroOperacion: ''
  });

  // Autocompletar datos del usuario si inició sesión
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombreCompleto: user.nombre || `${user.nombres || ''} ${user.apellidos || ''}`.trim(),
        correo: user.correo || '',
        telefono: user.telefono || '',
        ciudad: user.ciudad || 'Lima',
        direccion: user.direccion || '',
        documento: user.documento || ''
      }));
    }
  }, [user]);

  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmarPedido = async (e) => {
    e.preventDefault();
    setErrorMensaje('');

    if (items.length === 0 && !pedidoConfirmado) {
      setErrorMensaje('Tu carrito no contiene productos para procesar un pedido.');
      return;
    }

    // Validar datos del comprador y entrega
    if (
      !formData.nombreCompleto.trim() ||
      !formData.correo.trim() ||
      !formData.documento.trim() ||
      !formData.telefono.trim() ||
      !formData.direccion.trim() ||
      !formData.ciudad.trim()
    ) {
      setErrorMensaje('Por favor, completa todos los campos obligatorios del comprador y de envío.');
      return;
    }

    // Validar según el método de pago seleccionado
    if (formData.metodoPago === 'tarjeta') {
      if (
        !formData.titular.trim() ||
        !formData.numeroTarjeta.trim() ||
        !formData.vencimiento.trim() ||
        !formData.cvv.trim()
      ) {
        setErrorMensaje('Por favor, completa todos los datos requeridos de tu tarjeta.');
        return;
      }
    } else if (formData.metodoPago === 'yape') {
      if (!formData.numeroOperacion.trim()) {
        setErrorMensaje('Por favor, ingresa el número de operación de tu transferencia Yape o Plin.');
        return;
      }
    }

    // Guardar pedido en PostgreSQL o fallback
    const res = await createPedido({
      comprador: { ...formData },
      productos: [...items],
      subtotal,
      envio: shippingCost,
      total,
      metodoPago: formData.metodoPago
    });

    if (res.success) {
      setPedidoConfirmado(res.pedido);
      clearCart();
    } else {
      setErrorMensaje('No se pudo procesar la orden. Intenta nuevamente.');
    }
  };

  // Vista de confirmación de pedido
  if (pedidoConfirmado) {
    return (
      <div className="receipt-card">
        <div className="receipt-icon-circle">
          <CheckCircle size={44} />
        </div>
        <h2>¡Orden Confirmada con Éxito!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '6px' }}>
          Gracias por confiar en <strong>StyleHub</strong>. Tu compra ha sido procesada correctamente.
        </p>

        <div className="receipt-body">
          <div className="receipt-row">
            <strong>Código de Seguimiento:</strong>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-brand)' }}>
              {pedidoConfirmado.codigo}
            </span>
          </div>

          <div className="receipt-row">
            <span>Fecha y Hora:</span>
            <span>{pedidoConfirmado.fecha}</span>
          </div>

          <div className="receipt-row">
            <span>Cliente:</span>
            <span>{pedidoConfirmado.comprador.nombreCompleto}</span>
          </div>

          <div className="receipt-row">
            <span>Correo de Notificación:</span>
            <span>{pedidoConfirmado.comprador.correo}</span>
          </div>

          <div className="receipt-row">
            <span>Dirección de Entrega:</span>
            <span>{pedidoConfirmado.comprador.direccion}, {pedidoConfirmado.comprador.ciudad}</span>
          </div>

          <div className="receipt-row">
            <span>Método de Pago:</span>
            <span style={{ fontWeight: 600 }}>
              {pedidoConfirmado.metodoPago === 'tarjeta'
                ? 'Tarjeta de Crédito / Débito'
                : pedidoConfirmado.metodoPago === 'yape'
                ? `Yape / Plin (Op. ${pedidoConfirmado.comprador.numeroOperacion})`
                : 'Pago Contra Entrega'}
            </span>
          </div>

          <div className="receipt-row" style={{ marginTop: '10px', paddingTop: '10px', fontSize: '1.15rem' }}>
            <strong>Total Pagado:</strong>
            <strong style={{ color: 'var(--color-brand)' }}>
              S/ {pedidoConfirmado.total.toFixed(2)}
            </strong>
          </div>
        </div>

        <Link to="/" className="boton">
          <ShoppingBag size={18} /> Volver a la Tienda
        </Link>
      </div>
    );
  }

  // Vista si no hay items
  if (items.length === 0) {
    return (
      <div className="empty-state-card">
        <h2>No hay productos por procesar</h2>
        <p style={{ maxWidth: '420px', margin: '8px auto 24px auto' }}>
          Para continuar al checkout primero tienes que seleccionar prendas en nuestro catálogo.
        </p>
        <Link to="/" className="boton">
          <ArrowLeft size={16} /> Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="titulo-seccion">
        <h2>Finalizar Pedido</h2>
        <p>Ingresa tus datos de envío y selecciona tu método de pago preferido para confirmar la compra.</p>
      </div>

      {errorMensaje && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{errorMensaje}</span>
        </div>
      )}

      <form onSubmit={handleConfirmarPedido}>
        <div className="checkout-wrapper">
          <div>
            {/* 1. Datos del Comprador */}
            <div className="checkout-card">
              <h3>
                <UserCheck size={20} style={{ color: 'var(--color-brand)' }} />
                1. Datos del Comprador
              </h3>

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="nombreCompleto">Nombre Completo *</label>
                  <input
                    id="nombreCompleto"
                    type="text"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Ej. Harry Sly Rodríguez Sandoval"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="correo">Correo Electrónico *</label>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="documento">Documento de Identidad (DNI) *</label>
                  <input
                    id="documento"
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    placeholder="72345678"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="telefono">Teléfono / Celular *</label>
                  <input
                    id="telefono"
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="987654321"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Datos de Envío */}
            <div className="checkout-card">
              <h3>
                <Truck size={20} style={{ color: 'var(--color-brand)' }} />
                2. Datos de Envío a Domicilio
              </h3>

              <div className="form-field">
                <label htmlFor="direccion">Dirección de Entrega *</label>
                <input
                  id="direccion"
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Av. Universitaria 1801, San Miguel"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="ciudad">Ciudad / Distrito *</label>
                  <input
                    id="ciudad"
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    placeholder="Lima"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="referencia">Referencia de Ubicación</label>
                  <input
                    id="referencia"
                    type="text"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleChange}
                    placeholder="Frente al campus PUCP"
                  />
                </div>
              </div>
            </div>

            {/* 3. Selección de Método de Pago */}
            <div className="checkout-card">
              <h3>
                <CreditCard size={20} style={{ color: 'var(--color-brand)' }} />
                3. Selección de Método de Pago
              </h3>

              <div className="payment-selector">
                <label className={`payment-option-card ${formData.metodoPago === 'tarjeta' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="tarjeta"
                    checked={formData.metodoPago === 'tarjeta'}
                    onChange={handleChange}
                  />
                  <CreditCard size={20} />
                  <div>
                    <strong style={{ display: 'block' }}>Tarjeta de Crédito o Débito</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visa, Mastercard, American Express</span>
                  </div>
                </label>

                <label className={`payment-option-card ${formData.metodoPago === 'yape' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="yape"
                    checked={formData.metodoPago === 'yape'}
                    onChange={handleChange}
                  />
                  <Smartphone size={20} />
                  <div>
                    <strong style={{ display: 'block' }}>Billetera Digital (Yape / Plin)</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transferencia rápida por código o QR</span>
                  </div>
                </label>

                <label className={`payment-option-card ${formData.metodoPago === 'contraentrega' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="contraentrega"
                    checked={formData.metodoPago === 'contraentrega'}
                    onChange={handleChange}
                  />
                  <Truck size={20} />
                  <div>
                    <strong style={{ display: 'block' }}>Pago Contra Entrega</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Efectivo o POS al recibir en tu domicilio</span>
                  </div>
                </label>
              </div>

              {/* Formulario de tarjeta */}
              {formData.metodoPago === 'tarjeta' && (
                <div style={{ background: 'var(--bg-muted)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <div className="form-field">
                    <label htmlFor="titular">Nombre del Titular de la Tarjeta *</label>
                    <input
                      id="titular"
                      type="text"
                      name="titular"
                      value={formData.titular}
                      onChange={handleChange}
                      placeholder="Como aparece en la tarjeta"
                      required={formData.metodoPago === 'tarjeta'}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="numeroTarjeta">Número de Tarjeta *</label>
                    <input
                      id="numeroTarjeta"
                      type="text"
                      name="numeroTarjeta"
                      maxLength={19}
                      value={formData.numeroTarjeta}
                      onChange={handleChange}
                      placeholder="4557 0000 0000 0000"
                      required={formData.metodoPago === 'tarjeta'}
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label htmlFor="vencimiento">Vencimiento (MM/AA) *</label>
                      <input
                        id="vencimiento"
                        type="text"
                        name="vencimiento"
                        maxLength={5}
                        value={formData.vencimiento}
                        onChange={handleChange}
                        placeholder="12/28"
                        required={formData.metodoPago === 'tarjeta'}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="cvv">Código CVV *</label>
                      <input
                        id="cvv"
                        type="password"
                        name="cvv"
                        maxLength={4}
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        required={formData.metodoPago === 'tarjeta'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Instrucciones Yape / Plin */}
              {formData.metodoPago === 'yape' && (
                <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', padding: '18px', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontWeight: 700, color: '#86198f', marginBottom: '8px' }}>
                    Instrucciones para transferir por Yape / Plin:
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '0.88rem' }}>• <strong>Número oficial:</strong> 987 654 321</p>
                  <p style={{ margin: '2px 0', fontSize: '0.88rem' }}>• <strong>Titular:</strong> StyleHub Perú S.A.C.</p>
                  <p style={{ margin: '2px 0 12px 0', fontSize: '0.88rem' }}>• <strong>Monto exacto:</strong> S/ {total.toFixed(2)}</p>

                  <div className="form-field" style={{ marginBottom: 0 }}>
                    <label htmlFor="numeroOperacion">Número de Operación del Comprobante *</label>
                    <input
                      id="numeroOperacion"
                      type="text"
                      name="numeroOperacion"
                      value={formData.numeroOperacion}
                      onChange={handleChange}
                      placeholder="Ej. 748291"
                      required={formData.metodoPago === 'yape'}
                    />
                  </div>
                </div>
              )}

              {/* Información Contra Entrega */}
              {formData.metodoPago === 'contraentrega' && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>
                    <strong>Modalidad Contra Entrega:</strong> Pagarás directamente al repartidor en el momento de la entrega en efectivo o tarjeta con POS.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen lateral de compra */}
          <aside className="cart-summary-box">
            <h3>Resumen de Compra</h3>

            <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{item.nombre} (x{item.cantidad})</span>
                  <strong>S/ {(item.precio * item.cantidad).toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Subtotal:</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>

            <div className="summary-line">
              <span>Costo de Envío:</span>
              <span>S/ {shippingCost.toFixed(2)}</span>
            </div>

            <div className="summary-line total">
              <span>Total a Pagar:</span>
              <span style={{ color: 'var(--color-brand)' }}>S/ {total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className="boton boton-acento"
              style={{ width: '100%', padding: '14px' }}
            >
              <ShieldCheck size={18} /> Confirmar y Procesar Orden
            </button>

            <Link
              to="/carrito"
              className="boton boton-secundario"
              style={{ width: '100%', marginTop: '12px', boxSizing: 'border-box' }}
            >
              <ArrowLeft size={16} /> Volver al Carrito
            </Link>
          </aside>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;
