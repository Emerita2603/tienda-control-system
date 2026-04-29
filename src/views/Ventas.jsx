import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");

  const productosCollection = collection(db, "productos");
  const ventasCollection = collection(db, "ventas");

  useEffect(() => {
    const escucharProductos = onSnapshot(productosCollection, (snapshot) => {
      const productosData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((producto) => producto.userId === auth.currentUser.uid);

      setProductos(productosData);
    });

    const escucharVentas = onSnapshot(ventasCollection, (snapshot) => {
      const ventasData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((venta) => venta.userId === auth.currentUser.uid);

      setVentas(ventasData);
    });

    return () => {
      escucharProductos();
      escucharVentas();
    };
  }, []);

  const productoSeleccionado = productos.find((p) => p.id === productoId);

  const totalVenta =
    productoSeleccionado && cantidad
      ? Number(productoSeleccionado.precioVenta || 0) * Number(cantidad || 0)
      : 0;

  const gananciaVenta =
    productoSeleccionado && cantidad
      ? (Number(productoSeleccionado.precioVenta || 0) -
          Number(productoSeleccionado.precioCompra || 0)) *
        Number(cantidad || 0)
      : 0;

  const registrarVenta = async () => {
    if (!productoId || !cantidad) {
      alert("Selecciona un producto e ingresa la cantidad");
      return;
    }

    if (Number(cantidad) <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (Number(cantidad) > Number(productoSeleccionado.stock || 0)) {
      alert("No hay suficiente stock disponible");
      return;
    }

    const cantidadVendida = Number(cantidad);
    const precioVenta = Number(productoSeleccionado.precioVenta || 0);
    const precioCompra = Number(productoSeleccionado.precioCompra || 0);
    const total = precioVenta * cantidadVendida;
    const ganancia = (precioVenta - precioCompra) * cantidadVendida;

    await addDoc(ventasCollection, {
      productoId: productoSeleccionado.id,
      productoNombre: productoSeleccionado.nombre,
      cantidad: cantidadVendida,
      precioUnitario: precioVenta,
      precioCompra,
      total,
      ganancia,
      fecha: new Date(),
      userId: auth.currentUser.uid,
    });

    await updateDoc(doc(db, "productos", productoSeleccionado.id), {
      stock: Number(productoSeleccionado.stock || 0) - cantidadVendida,
    });

    setProductoId("");
    setCantidad("");

    alert("Venta registrada correctamente");
  };

  const eliminarVenta = async (venta) => {
    const confirmar = confirm(
      "¿Seguro que deseas eliminar esta venta? Se devolverá el stock al producto."
    );

    if (!confirmar) return;

    const productoEncontrado = productos.find(
      (producto) => producto.id === venta.productoId
    );

    if (productoEncontrado) {
      await updateDoc(doc(db, "productos", venta.productoId), {
        stock:
          Number(productoEncontrado.stock || 0) + Number(venta.cantidad || 0),
      });
    }

    await deleteDoc(doc(db, "ventas", venta.id));

    alert("Venta eliminada correctamente");
  };

  const totalVendido = ventas.reduce(
    (total, venta) => total + Number(venta.total || 0),
    0
  );

  const gananciaTotal = ventas.reduce(
    (total, venta) => total + Number(venta.ganancia || 0),
    0
  );

  return (
    <div>
      <section className="mb-8">
        <h2 className="text-4xl font-black mb-2">Módulo de Ventas</h2>
        <p className="text-slate-500 max-w-2xl">
          Registra ventas, calcula el total, muestra ganancias y descuenta
          automáticamente las existencias del inventario.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ventas registradas</p>
          <h3 className="text-3xl font-black">{ventas.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Total vendido</p>
          <h3 className="text-3xl font-black text-orange-600">
            S/ {totalVendido.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ganancia total</p>
          <h3
            className={`text-3xl font-black ${
              gananciaTotal < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            S/ {gananciaTotal.toFixed(2)}
          </h3>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        <aside className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h3 className="text-xl font-black mb-4">💸 Registrar venta</h3>

          <div className="space-y-3">
            <select
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
            >
              <option value="">Selecciona un producto</option>

              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - Stock: {producto.stock}
                </option>
              ))}
            </select>

            <input
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              type="number"
              placeholder="Cantidad vendida"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />

            {productoSeleccionado && (
              <div className="bg-slate-100 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Producto:</span>
                  <strong>{productoSeleccionado.nombre}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Precio venta:</span>
                  <strong>
                    S/ {Number(productoSeleccionado.precioVenta || 0).toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Precio compra:</span>
                  <strong>
                    S/{" "}
                    {Number(productoSeleccionado.precioCompra || 0).toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Total venta:</span>
                  <strong className="text-orange-600">
                    S/ {totalVenta.toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Ganancia:</span>
                  <strong
                    className={
                      gananciaVenta < 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    S/ {gananciaVenta.toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <button
              onClick={registrarVenta}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl"
            >
              Registrar venta
            </button>
          </div>
        </aside>

        <section>
          <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
            <h3 className="text-2xl font-black">Historial de ventas</h3>
            <p className="text-sm text-slate-500">
              Últimas ventas registradas en la tienda.
            </p>
          </div>

          {ventas.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border">
              <p className="text-slate-500">
                Todavía no hay ventas registradas.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-4">Producto</th>
                    <th className="text-left p-4">Cantidad</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Ganancia</th>
                    <th className="text-left p-4">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-t">
                      <td className="p-4 font-semibold">
                        {venta.productoNombre}
                      </td>
                      <td className="p-4">{venta.cantidad}</td>
                      <td className="p-4 text-orange-600 font-bold">
                        S/ {Number(venta.total || 0).toFixed(2)}
                      </td>
                      <td
                        className={`p-4 font-bold ${
                          Number(venta.ganancia || 0) < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        S/ {Number(venta.ganancia || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => eliminarVenta(venta)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl font-bold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

export default Ventas;