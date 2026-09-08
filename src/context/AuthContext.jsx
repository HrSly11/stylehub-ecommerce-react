import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

const AuthContext = createContext();

// Usuario inicial de prueba
const USUARIOS_INICIALES = [
  {
    correo: 'usuario@stylehub.com',
    clave: '1234',
    nombre: 'Harry Sly Rodríguez Sandoval',
    nombres: 'Harry Sly',
    apellidos: 'Rodríguez Sandoval',
    ciudad: 'Lima',
    direccion: 'Av. Universitaria 1801, San Miguel',
    telefono: '987654321',
    documento: '72345678'
  }
];

export function AuthProvider({ children }) {
  // Usuario autenticado
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('stylehub_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Lista de usuarios locales
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const storedList = localStorage.getItem('stylehub_users');
    return storedList ? JSON.parse(storedList) : USUARIOS_INICIALES;
  });

  useEffect(() => {
    localStorage.setItem('stylehub_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Login conectado a PostgreSQL / API
  const login = async (correo, clave) => {
    const result = await loginUser(correo, clave, registeredUsers);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('stylehub_user', JSON.stringify(result.user));
    }
    return result;
  };

  // Registro conectado a PostgreSQL / API
  const register = async (userData) => {
    const result = await registerUser(userData, registeredUsers);
    if (result.success && result.user) {
      setRegisteredUsers(prev => [...prev, result.user]);
    }
    return result;
  };

  // Cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('stylehub_user');
    localStorage.removeItem('stylehub_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        registeredUsers,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;
