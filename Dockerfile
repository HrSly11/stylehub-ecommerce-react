# Partimos de una imagen base oficial de Node.js en su versión Alpine (ultra ligera).
# Esto reduce drásticamente el tamaño del contenedor final, ideal para desarrollo web.
FROM node:20-alpine

# Definimos /app como nuestro espacio de trabajo. 
# A partir de esta línea, Docker ejecutará todos los comandos dentro de esta carpeta.
WORKDIR /app

# Copiamos estratégicamente primero los archivos package.json.
# Hacemos esto antes que el resto del código para aprovechar el caché de capas de Docker.
# Si el código cambia pero las dependencias no, Docker omitirá el "npm install" y ahorrará tiempo.
COPY package*.json ./

# Descargamos e instalamos las librerías necesarias.
RUN npm install

# Ahora sí, copiamos el resto de nuestros archivos fuente (React, Vite, etc.) al contenedor.
COPY . .

# Documentamos qué puerto utilizará nuestra aplicación en el contenedor.
# Vite utiliza el 5173 por defecto.
EXPOSE 5173

# Definimos el proceso principal que mantendrá vivo al contenedor.
# En este caso, levantamos el servidor de desarrollo en caliente.
CMD ["npm", "run", "dev"]
