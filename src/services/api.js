import { PRODUCTOS } from '../data/productos';

const API_BASE_URL = 'http://localhost:3001/api';

// Función auxiliar para peticiones con timeout y fallback
async function fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const token = typeof window !== 'undefined' ? localStorage.getItem('stylehub_token') : null;
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 1. Obtener productos (con fallback a catálogo local si no hay servidor)
export async function getProductos(categoria = 'todos') {
  try {
    const url = `${API_BASE_URL}/productos${categoria !== 'todos' ? `?categoria=${categoria}` : ''}`;
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { data, fromDatabase: true };
      }
    }
  } catch {
    // Si la API no está activa, usamos el catálogo local
  }

  // Fallback local
  if (categoria === 'todos') {
    return { data: PRODUCTOS, fromDatabase: false };
  }
  return {
    data: PRODUCTOS.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase()),
    fromDatabase: false
  };
}

// 2. Iniciar sesión (intenta PostgreSQL -> fallback local)
export async function loginUser(correo, clave, localUsers = []) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      body: JSON.stringify({ correo, clave })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      if (result.token && typeof window !== 'undefined') {
        localStorage.setItem('stylehub_token', result.token);
      }
      return { success: true, user: result.user, token: result.token, fromDatabase: true };
    }
    if (!res.ok) {
      return { success: false, message: result.message || 'Error al iniciar sesión' };
    }
  } catch {
    // Fallback local
  }

  // Fallback contra usuarios locales
  const cleanEmail = correo.trim().toLowerCase();
  const cleanPass = clave.trim();
  const existing = localUsers.find(u => u.correo.toLowerCase() === cleanEmail);

  if (!existing) {
    return { success: false, message: 'No se encontró un usuario con ese correo.' };
  }
  if (existing.clave !== cleanPass) {
    return { success: false, message: 'La contraseña ingresada no es correcta.' };
  }

  return { success: true, user: existing, fromDatabase: false };
}

// 3. Registrar usuario (intenta PostgreSQL -> fallback local)
export async function registerUser(userData, localUsers = []) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios/registro`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message, user: result.user, fromDatabase: true };
    }
    if (!res.ok) {
      return { success: false, message: result.message || 'Error al registrar usuario' };
    }
  } catch {
    // Fallback local
  }

  // Fallback local
  const cleanEmail = userData.correo.trim().toLowerCase();
  const exists = localUsers.some(u => u.correo.toLowerCase() === cleanEmail);

  if (exists) {
    return { success: false, message: 'Ya existe una cuenta con este correo electrónico.' };
  }

  const newUser = {
    ...userData,
    correo: cleanEmail,
    nombre: `${userData.nombres} ${userData.apellidos}`.trim()
  };

  return {
    success: true,
    message: `Registro exitoso. Usuario validado: ${newUser.nombre}.`,
    user: newUser,
    fromDatabase: false
  };
}

// 4. Crear pedido (intenta PostgreSQL -> fallback local)
export async function createPedido(pedidoData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      body: JSON.stringify(pedidoData)
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        return { success: true, pedido: result.pedido, fromDatabase: true };
      }
    }
  } catch {
    // Fallback local
  }

  // Fallback local
  const ordenLocal = {
    codigo: 'SH-' + Math.floor(100000 + Math.random() * 900000),
    fecha: new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ...pedidoData
  };

  return { success: true, pedido: ordenLocal, fromDatabase: false };
}

const REVIEWS_STORAGE_KEY = 'stylehub_local_reviews';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    productoId: 1,
    author: "Ana Morales",
    text: "Excelente prenda, muy <b>recomendada</b>. La tela es fresca y de calidad.",
    rating: 5,
    creado_en: new Date().toISOString()
  },
  {
    id: 2,
    productoId: 2,
    author: "Carlos Mendoza",
    text: "El envío fue rápido y el producto llegó en <i>óptimas condiciones</i>.",
    rating: 4,
    creado_en: new Date().toISOString()
  }
];

// 5. Obtener opiniones de productos (API con fallback a almacenamiento local)
export async function getReviews(productoId = null) {
  try {
    const url = `${API_BASE_URL}/reviews${productoId ? `?productoId=${productoId}` : ''}`;
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return { success: true, data, fromDatabase: true };
      }
    }
  } catch {
    // Fallback local
  }

  try {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const list = saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    const filtered = productoId ? list.filter(r => String(r.productoId) === String(productoId)) : list;
    return { success: true, data: filtered, fromDatabase: false };
  } catch {
    return { success: true, data: DEFAULT_REVIEWS, fromDatabase: false };
  }
}

// 6. Publicar nueva reseña con validación Zod y sanitización (API con fallback a almacenamiento local)
export async function createReview(reviewData) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, data: result.data, message: result.message, fromDatabase: true };
    }
    if (!res.ok) {
      const errMsg = result.detalles ? result.detalles.map(d => d.mensaje).join(', ') : (result.error || 'Error al publicar la reseña');
      return { success: false, message: errMsg };
    }
  } catch {
    // Fallback local
  }

  try {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const list = saved ? JSON.parse(saved) : [...DEFAULT_REVIEWS];
    const newReview = {
      id: Date.now(),
      author: reviewData.author,
      text: reviewData.text,
      rating: reviewData.rating || 5,
      productoId: reviewData.productoId || null,
      creado_en: new Date().toISOString()
    };
    list.unshift(newReview);
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(list));
    return { success: true, data: newReview, message: 'Reseña guardada localmente', fromDatabase: false };
  } catch {
    return { success: false, message: 'Error al guardar la reseña localmente' };
  }
}

// 7. Obtener perfil de usuario autenticado mediante JWT
export async function getUserProfile() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/usuarios/perfil`, {
      method: 'GET'
    });
    if (res.ok) {
      const result = await res.json();
      return result;
    }
    return { success: false, error: 'No autorizado o error al obtener perfil' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
