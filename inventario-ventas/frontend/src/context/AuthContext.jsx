import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const u = localStorage.getItem('usuario');
    if (token && u) setUsuario(JSON.parse(u));
    setCargando(false);
  }, []);

  const login = async (correo, contrasena) => {
    const { data } = await loginAPI({ correo, contrasena });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data;
  };

  const logout = () => { localStorage.clear(); setUsuario(null); };
  const esAdmin = () => usuario?.rol === 'Administrador';

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esAdmin, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
