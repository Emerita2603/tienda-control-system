import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./views/Login";
import Productos from "./views/Productos";
import Ventas from "./views/Ventas";
import Gastos from "./views/Gastos";
import Reportes from "./views/Reportes";

function App() {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const escucharUsuario = onAuthStateChanged(auth, (usuarioActual) => {
      setUser(usuarioActual);
      setCargando(false);
    });

    return () => escucharUsuario();
  }, []);

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-xl font-bold">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              VENTA MINORISTA PREMIUM
            </h1>
            <p className="text-sm text-slate-500">
              Usuario: {user.email}
            </p>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600 items-center">
            <Link to="/" className="hover:text-orange-600">
              Productos
            </Link>

            <Link to="/ventas" className="hover:text-orange-600">
              Ventas
            </Link>

            <Link to="/gastos" className="hover:text-orange-600">
              Gastos
            </Link>

            <Link to="/reportes" className="hover:text-orange-600">
              Reportes
            </Link>

            <button
              onClick={cerrarSesion}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Productos />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;