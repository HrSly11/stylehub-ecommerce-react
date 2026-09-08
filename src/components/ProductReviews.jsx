import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Star, MessageSquare, Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { getReviews, createReview } from '../services/api';
import { reviewSchema } from '../../server/schemas/validation';

export function ProductReviews({ producto = null }) {
  const [reviews, setReviews] = useState([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cargarResenas = async () => {
    const res = await getReviews(producto ? producto.id : null);
    if (res && res.data) {
      setReviews(res.data);
    }
  };

  useEffect(() => {
    cargarResenas();
  }, [producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      author: author.trim(),
      text: text.trim(),
      rating: Number(rating),
      productoId: producto ? producto.id : undefined
    };

    // Validación estricta en el cliente utilizando Zod
    const validacion = reviewSchema.safeParse(payload);
    if (!validacion.success) {
      const primerError = validacion.error.issues?.[0]?.message || 'Datos del formulario inválidos.';
      setErrorMsg(primerError);
      return;
    }

    setCargando(true);
    try {
      const res = await createReview(payload);
      if (res.success) {
        setSuccessMsg(res.message || '¡Tu opinión ha sido publicada exitosamente!');
        setAuthor('');
        setText('');
        setRating(5);
        cargarResenas();
      } else {
        setErrorMsg(res.message || 'No se pudo publicar la reseña.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión al enviar la reseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="resenas-seccion">
      <div className="resenas-header">
        <div className="resenas-titulo-box">
          <MessageSquare className="icono-seccion" size={24} />
          <div>
            <h3>Opiniones de la Comunidad</h3>
            <p className="resenas-subtitulo">
              {producto 
                ? `Reseñas para "${producto.nombre}"` 
                : 'Comentarios y valoraciones de nuestros clientes'}
            </p>
          </div>
        </div>
        <div className="resenas-security-badge">
          <ShieldCheck size={16} />
          <span>Protegido con Zod & DOMPurify (Anti-XSS)</span>
        </div>
      </div>

      <div className="resenas-grid">
        {/* Formulario para escribir opinión */}
        <div className="resena-form-card">
          <h4>Comparte tu experiencia</h4>
          <p className="resena-form-help">
            * Soporta formato enriquecido seguro: puedes usar <code>&lt;b&gt;</code> para negrita o <code>&lt;i&gt;</code> para cursiva.
          </p>

          {errorMsg && (
            <div className="alert alert-error" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-resena">
            <div className="form-grupo">
              <label htmlFor="autor-input">Tu Nombre Completo:</label>
              <input
                id="autor-input"
                type="text"
                className="input-texto"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ej. Juan Pérez"
                maxLength={50}
                required
              />
            </div>

            <div className="form-grupo">
              <label>Calificación:</label>
              <div className="estrellas-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`btn-estrella ${star <= rating ? 'activa' : ''}`}
                    onClick={() => setRating(star)}
                    aria-label={`${star} estrellas`}
                  >
                    <Star size={20} fill={star <= rating ? 'var(--color-warning, #f59e0b)' : 'none'} />
                  </button>
                ))}
                <span className="rating-label">{rating} de 5 estrellas</span>
              </div>
            </div>

            <div className="form-grupo">
              <label htmlFor="texto-input">Tu Opinión:</label>
              <textarea
                id="texto-input"
                className="input-texto input-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="¿Qué tal te pareció la prenda, confección o el envío?"
                rows={4}
                maxLength={1000}
                required
              />
            </div>

            <button
              type="submit"
              className="boton boton-acento btn-submit-resena"
              disabled={cargando}
            >
              {cargando ? (
                'Publicando...'
              ) : (
                <>
                  <Send size={16} /> Publicar Opinión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Listado de comentarios */}
        <div className="resenas-lista-box">
          <h4>Comentarios Recientes ({reviews.length})</h4>

          {reviews.length === 0 ? (
            <div className="resena-vacia">
              <p>Aún no hay opiniones registradas. ¡Sé el primero en compartir tu experiencia!</p>
            </div>
          ) : (
            <div className="resenas-lista">
              {reviews.map((rev) => {
                // Sanitización estricta con DOMPurify antes del renderizado (Prevención de XSS)
                const safeHtml = DOMPurify.sanitize(rev.text, {
                  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'span'],
                  ALLOWED_ATTR: []
                });

                return (
                  <article key={rev.id} className="resena-card">
                    <div className="resena-card-header">
                      <div>
                        <strong className="resena-autor">{rev.author}</strong>
                        {rev.creado_en && (
                          <span className="resena-fecha">
                            {new Date(rev.creado_en).toLocaleDateString('es-PE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      <div className="resena-estrellas" aria-label={`${rev.rating || 5} de 5 estrellas`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= (rev.rating || 5) ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Renderizado dinámico de HTML sanitizado con DOMPurify */}
                    <div
                      className="resena-contenido"
                      dangerouslySetInnerHTML={{ __html: safeHtml }}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductReviews;
