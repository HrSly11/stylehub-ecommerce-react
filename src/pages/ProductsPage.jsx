import React, { useState, useEffect, useMemo } from 'react';
import { Layers, CheckCircle, Truck, ShieldCheck, RefreshCw, Sparkles, User, Smile, ArrowRight, Database } from 'lucide-react';
import { PRODUCTOS } from '../data/productos';
import { getProductos } from '../services/api';
import { filterProductsByCategory } from '../utils/filterLogic';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { useCart } from '../context/CartContext';

export function ProductsPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  const [listaProductos, setListaProductos] = useState(PRODUCTOS);
  const [conectadoBD, setConectadoBD] = useState(false);
  const [productoParaResena, setProductoParaResena] = useState(null);
  const { lastNotification } = useCart();

  // Carga de productos desde PostgreSQL / API
  useEffect(() => {
    let montado = true;
    getProductos('todos').then(res => {
      if (montado && res && res.data) {
        setListaProductos(res.data);
        setConectadoBD(res.fromDatabase);
      }
    });
    return () => {
      montado = false;
    };
  }, []);

  // Filtro de productos mediante la función pura testeada
  const productosFiltrados = useMemo(() => {
    return filterProductsByCategory(listaProductos, categoriaSeleccionada);
  }, [categoriaSeleccionada, listaProductos]);

  const categorias = [
    { id: 'todos', label: 'Todos los productos', icon: <Layers size={16} /> },
    { id: 'hombres', label: 'Hombres', icon: <User size={16} /> },
    { id: 'mujeres', label: 'Mujeres', icon: <Sparkles size={16} /> },
    { id: 'ninos', label: 'Niños', icon: <Smile size={16} /> }
  ];

  return (
    <div>
      {/* Banner Principal */}
      <section className="hero">
        <span className="hero-etiqueta">
          <Sparkles size={14} /> Colección Primavera / Verano 2026
        </span>
        <h2>Moda y estilo para cada miembro de la familia</h2>
        <p>
          Descubre prendas de alta calidad confeccionadas con los mejores materiales. Diseños pensados para tu confort diario y ocasiones especiales.
        </p>

        <a className="boton boton-claro" href="#catalogo">
          Explorar catálogo <ArrowRight size={16} />
        </a>

        <div className="hero-trust-bar">
          <div className="trust-item">
            <Truck size={18} />
            <span>Envío a todo el Perú</span>
          </div>
          <div className="trust-item">
            <ShieldCheck size={18} />
            <span>Garantía de Satisfacción 100%</span>
          </div>
          <div className="trust-item">
            <RefreshCw size={18} />
            <span>Cambios y Devoluciones</span>
          </div>
          {conectadoBD && (
            <div className="trust-item" style={{ color: '#86efac' }}>
              <Database size={18} />
              <span>PostgreSQL Conectado</span>
            </div>
          )}
        </div>
      </section>

      {/* Mensaje al agregar producto */}
      {lastNotification && (
        <div className="alert alert-success" style={{ maxWidth: '640px', margin: '0 auto 24px auto' }}>
          <CheckCircle size={20} />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* Filtros por categoría */}
      <section className="filtros-card" id="catalogo">
        <div className="filtros-header">
          <h3>
            <Layers size={20} style={{ color: 'var(--color-brand)' }} />
            Categorías Disponibles
          </h3>
          <span className="filtro-resultado-badge">
            {productosFiltrados.length} prenda(s) encontrada(s)
          </span>
        </div>

        <div className="filtros-pills">
          {categorias.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`filtro-pill ${categoriaSeleccionada === cat.id ? 'activo' : ''}`}
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Lista de productos */}
      <section>
        <div className="titulo-seccion">
          <h2>Catálogo de Prendas</h2>
          <p>Selecciona tus prendas y agrégalas directamente a tu carrito.</p>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="alert alert-info">
            <span>No se encontraron productos disponibles para este filtro.</span>
          </div>
        ) : (
          <div className="productos-grid">
            {productosFiltrados.map(producto => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onVerResenas={(prod) => {
                  setProductoParaResena(prod);
                  const el = document.getElementById('opiniones');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Sección de Opiniones y Reseñas de Clientes */}
      <section id="opiniones" style={{ marginTop: '56px', scrollMarginTop: '80px' }}>
        {productoParaResena && (
          <div className="alert alert-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span>
              Filtrando opiniones de: <strong>{productoParaResena.nombre}</strong>
            </span>
            <button
              type="button"
              className="boton boton-claro"
              style={{ padding: '4px 12px', fontSize: '0.85rem' }}
              onClick={() => setProductoParaResena(null)}
            >
              Ver todas las opiniones
            </button>
          </div>
        )}
        <ProductReviews producto={productoParaResena} />
      </section>
    </div>
  );
}

export default ProductsPage;
