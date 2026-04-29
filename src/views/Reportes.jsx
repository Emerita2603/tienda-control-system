import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function Reportes() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    const escucharProductos = onSnapshot(collection(db, "productos"), (snapshot) => {
      const productosData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((producto) => producto.userId === auth.currentUser.uid);

      setProductos(productosData);
    });

    const escucharVentas = onSnapshot(collection(db, "ventas"), (snapshot) => {
      const ventasData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((venta) => venta.userId === auth.currentUser.uid);

      setVentas(ventasData);
    });

    const escucharGastos = onSnapshot(collection(db, "gastos"), (snapshot) => {
      const gastosData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((gasto) => gasto.userId === auth.currentUser.uid);

      setGastos(gastosData);
    });

    return () => {
      escucharProductos();
      escucharVentas();
      escucharGastos();
    };
  }, []);

  const totalVendido = ventas.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  const gananciaVentas = ventas.reduce(
    (total, venta) => total + Number(venta.ganancia || 0),
    0
  );

  const totalGastos = gastos.reduce(
    (total, gasto) => total + Number(gasto.monto || 0),
    0
  );

  const gananciaNeta = gananciaVentas - totalGastos;

  const valorInventario = productos.reduce(
    (total, producto) =>
      total + Number(producto.precioVenta || 0) * Number(producto.stock || 0),
    0
  );

  const productosBajoStock = productos.filter(
    (producto) => Number(producto.stock || 0) <= 3
  );

  return (
    <div>
      <section className="mb-8">
        <h2 className="text-4xl font-black mb-2">Reportes y estadísticas</h2>
        <p className="text-slate-500 max-w-2xl">
          Resumen general de ventas, gastos, ganancias e inventario de la tienda.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Total vendido</p>
          <h3 className="text-3xl font-black text-orange-600">
            S/ {totalVendido.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ganancia en ventas</p>
          <h3 className="text-3xl font-black text-green-600">
            S/ {gananciaVentas.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Total gastos</p>
          <h3 className="text-3xl font-black text-red-600">
            S/ {totalGastos.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ganancia neta</p>
          <h3
            className={`text-3xl font-black ${
              gananciaNeta < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            S/ {gananciaNeta.toFixed(2)}
          </h3>
        </div>
      </section>

      {gananciaNeta < 0 ? (
        <div className="bg-red-100 border border-red-300 text-red-700 rounded-2xl p-4 mb-8 font-bold">
          ⚠️ La tienda está registrando pérdida neta. Los gastos superan la
          ganancia obtenida por ventas.
        </div>
      ) : (
        <div className="bg-green-100 border border-green-300 text-green-700 rounded-2xl p-4 mb-8 font-bold">
          ✅ La tienda está generando ganancia neta positiva.
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Productos registrados</p>
          <h3 className="text-3xl font-black">{productos.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ventas registradas</p>
          <h3 className="text-3xl font-black">{ventas.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Valor del inventario</p>
          <h3 className="text-3xl font-black">
            S/ {valorInventario.toFixed(2)}
          </h3>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-2xl font-black mb-2">Productos con bajo stock</h3>
        <p className="text-sm text-slate-500 mb-5">
          Productos con 3 unidades o menos disponibles.
        </p>

        {productosBajoStock.length === 0 ? (
          <p className="text-slate-500">No hay productos con bajo stock.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left p-4">Producto</th>
                <th className="text-left p-4">Categoría</th>
                <th className="text-left p-4">Stock</th>
              </tr>
            </thead>

            <tbody>
              {productosBajoStock.map((producto) => (
                <tr key={producto.id} className="border-t">
                  <td className="p-4 font-semibold">{producto.nombre}</td>
                  <td className="p-4">{producto.categoria}</td>
                  <td className="p-4 font-bold text-red-600">
                    {producto.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Reportes;