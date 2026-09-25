# StyleHub - Proyecto E-commerce

## Descripción
StyleHub es un proyecto académico de E-commerce de ropa con categorías para hombres, mujeres y niños. Para esta entrega final se utilizó React.js junto con Vite para construir una aplicación web (SPA) con navegación por rutas, estado global y diseño responsive, con integración a base de datos PostgreSQL.

## Funcionalidades principales
- Registro de nuevos usuarios con validación de datos, confirmación de contraseña y guardado en PostgreSQL.
- Inicio de sesión con validación de credenciales y usuario de prueba.
- Catálogo de productos con filtros por categorías: Todos, Hombres, Mujeres y Niños (consultados desde base de datos).
- Carrito de compras con actualización dinámica de cantidades, eliminación de productos, cálculo de subtotal, envío y total, además de vista para carrito vacío.
- Formulario para finalizar pedido con datos del comprador, dirección de envío y selección de método de pago (Tarjeta, Yape / Plin y Pago contra entrega).
- Pantalla de confirmación con resumen de la orden, código de compra generado y guardado en PostgreSQL.
- **Módulo de Opiniones del Producto y Seguridad Web:**
  - Publicación y visualización de opiniones y valoraciones con estrellas (1 a 5).
  - **Validación de esquemas JSON con Zod:** Validación estricta tanto en cliente como en backend evitando inyección de campos no autorizados.
  - **Sanitización contra Cross-Site Scripting (XSS) con DOMPurify:** Desinfección de contenido HTML antes de renderizar con `dangerouslySetInnerHTML`, permitiendo tags seguros como `<b>` e `<i>` y neutralizando scripts o eventos `onerror`.
  - **Protección contra Escalamiento de Privilegios y Mass Assignment:** Restricción estricta en actualización de perfiles impidiendo la inyección arbitraria de roles de administrador.
  - **Control de Acceso Seguro:** Eliminación de vulnerabilidades basadas en query params inseguros (`req.query.user === "admin"`).
- Diseño responsive para computadoras, tablets y celulares.

## Usuario de prueba para inicio de sesión
- Correo: usuario@stylehub.com
- Contraseña: 1234

## Integrante del Grupo 4
- Harry Sly Rodríguez Sandoval

## Tecnologías utilizadas
- HTML5 / CSS3
- JavaScript (ES6)
- React.js 18
- React Router DOM
- Vite
- Node.js / Express
- PostgreSQL
- Zod (Validación de esquemas y sanitización de payloads)
- DOMPurify (Prevención de ataques XSS en contenido enriquecido)
- Docker & Docker Compose (Contenerización de Frontend en entorno Linux / WSL)

## Instrucciones para ejecutar el proyecto

### Opción A: Ejecución Local Tradicional (Node.js)

#### 1. Instalar dependencias
```bash
npm install
```

#### 2. (Opcional) Servidor Backend y Base de Datos
```bash
npm run db:init
npm run server
```

#### 3. Iniciar el servidor de desarrollo Frontend
```bash
npm run dev
```
Abrir en el navegador: [http://localhost:5173](http://localhost:5173)

> **Nota:** La aplicación cuenta con arquitectura resiliente: si el backend no está activo, funciona de forma autónoma con datos locales y almacenamiento en el navegador.

---

### Opción B: Ejecución con Docker (Estilo PUCP Sesión 2)

El frontend está completamente preparado para construirse y correrse en contenedor Docker (Node 20 Alpine) tanto con Docker CLI como con Docker Compose.

#### Consideración para Docker en WSL (Windows Subsystem for Linux)
Si Docker corre dentro de WSL (Ubuntu):
1. Abre tu terminal de **WSL (Ubuntu)**.
2. Navega a la ruta de tu proyecto en el disco de Windows montado en WSL:
   ```bash
   cd /mnt/c/Users/Harry/Documents/PUCP/FRONTEND/actividad3_grupo4
   ```
3. Verifica que el servicio de Docker esté activo en WSL (`sudo service docker status` o `sudo service docker start` si no usas Docker Desktop).
4. El puerto `5173` se mapea automáticamente y estará accesible directamente desde tu navegador en Windows en: [http://localhost:5173](http://localhost:5173).

---

#### 1. Con Docker CLI directo (como en el repositorio de referencia PUCP)

**Paso 1: Construir la imagen del frontend**
```bash
docker build -t pucp-front .
```

**Paso 2: Ejecutar el contenedor en segundo plano con mapeo de puertos**
```bash
docker run -d -p 5173:5173 --name mi-front pucp-front
```

**Paso 3: Ver logs o acceder al contenedor (opcional)**
```bash
# Ver logs en tiempo real
docker logs -f mi-front

# Acceder a la terminal interactiva del contenedor
docker exec -it mi-front sh
```

**Paso 4: Detener y eliminar el contenedor al terminar**
```bash
docker stop mi-front
docker rm mi-front
```

---

#### 2. Con Docker Compose (`docker-compose.yml`)

Permite levantar el entorno con un solo comando, configurando volumen montado y hot-reloading:

**Levantar el servicio:**
```bash
docker compose up --build -d
```

**Ver logs:**
```bash
docker compose logs -f frontend
```

**Detener el servicio:**
```bash
docker compose down
```

---

## 🚀 Guía de Despliegue Manual en Vercel (Frontend)

Para desplegar manualmente el frontend en Vercel sin desplegar el backend:

### 1. Preparación del Repositorio
Asegúrate de que tus últimos cambios estén subidos a GitHub:
```bash
git add .
git commit -m "feat: docker and vercel configuration for frontend"
git push origin main
```

### 2. Configuración en Vercel
1. Inicia sesión en [Vercel](https://vercel.com/) con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** > **"Project"**.
3. Importa el repositorio: `HrSly11/stylehub-ecommerce-react` (o el nombre de tu repo en GitHub).
4. Configuración del proyecto (**Project Settings**):
   - **Framework Preset**: Selecciona `Vite`.
   - **Root Directory**: `./` (la raíz del proyecto).
   - **Build Command**: `npm run build` (por defecto de Vite).
   - **Output Directory**: `dist` (por defecto de Vite).
   - **Install Command**: `npm install`.
5. *(Opcional)* En **Environment Variables**, puedes configurar variables de entorno si en el futuro conectas un backend público.
6. Haz clic en **Deploy**.

> **Nota sobre Rutas SPA:** El proyecto incluye el archivo `vercel.json` con las reglas de reescritura (`rewrites`) para asegurar que rutas directas como `/carrito`, `/login`, `/registro` o recargas del navegador funcionen correctamente con React Router sin arrojar error 404.

