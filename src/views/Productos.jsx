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

function Productos() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [stock, setStock] = useState("");
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState(false);
  const [productoId, setProductoId] = useState(null);

  const productosCollection = collection(db, "productos");

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

    return () => escucharProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setCategoria("");
    setPrecioCompra("");
    setPrecioVenta("");
    setStock("");
    setEditando(false);
    setProductoId(null);
  };

  const agregarProducto = async () => {
    if (!nombre || !categoria || !precioCompra || !precioVenta || !stock) {
      alert("Completa todos los campos");
      return;
    }

    await addDoc(productosCollection, {
      nombre,
      categoria,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
      fecha: new Date(),
      userId: auth.currentUser.uid,
    });

    limpiarFormulario();
  };

  const seleccionarProducto = (producto) => {
    setNombre(producto.nombre);
    setCategoria(producto.categoria);
    setPrecioCompra(producto.precioCompra);
    setPrecioVenta(producto.precioVenta);
    setStock(producto.stock);
    setProductoId(producto.id);
    setEditando(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const actualizarProducto = async () => {
    if (!nombre || !categoria || !precioCompra || !precioVenta || !stock) {
      alert("Completa todos los campos");
      return;
    }

    const productoDoc = doc(db, "productos", productoId);

    await updateDoc(productoDoc, {
      nombre,
      categoria,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
    });

    limpiarFormulario();
  };

  const eliminarProducto = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirmar) return;

    await deleteDoc(doc(db, "productos", id));
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalProductos = productos.length;
  const totalStock = productos.reduce(
    (total, p) => total + Number(p.stock || 0),
    0
  );

  const valorInventario = productos.reduce(
    (total, p) => total + Number(p.precioVenta || 0) * Number(p.stock || 0),
    0
  );

  const gananciaEstimada = productos.reduce(
    (total, p) =>
      total +
      (Number(p.precioVenta || 0) - Number(p.precioCompra || 0)) *
        Number(p.stock || 0),
    0
  );

  return (
    <>
      <section className="mb-8">
        <h2 className="text-4xl font-black mb-2">Control de Inventario</h2>
        <p className="text-slate-500 max-w-2xl">
          Registra productos, precios, existencias y calcula la ganancia estimada
          de tu tienda.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Productos</p>
          <h3 className="text-3xl font-black">{totalProductos}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Existencias</p>
          <h3 className="text-3xl font-black">{totalStock}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Valor inventario</p>
          <h3 className="text-3xl font-black">
            S/ {valorInventario.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Ganancia estimada</p>
          <h3 className="text-3xl font-black text-green-600">
            S/ {gananciaEstimada.toFixed(2)}
          </h3>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-8">
        <aside className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h3 className="text-xl font-black mb-4">
            {editando ? "✏️ Editar producto" : "➕ Agregar producto"}
          </h3>

          <div className="space-y-3">
            <input className="w-full border rounded-xl px-4 py-3" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input className="w-full border rounded-xl px-4 py-3" placeholder="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
            <input className="w-full border rounded-xl px-4 py-3" type="number" placeholder="Precio de compra" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
            <input className="w-full border rounded-xl px-4 py-3" type="number" placeholder="Precio de venta" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
            <input className="w-full border rounded-xl px-4 py-3" type="number" placeholder="Existencias" value={stock} onChange={(e) => setStock(e.target.value)} />

            {editando ? (
              <>
                <button onClick={actualizarProducto} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl">
                  Actualizar producto
                </button>
                <button onClick={limpiarFormulario} className="w-full bg-slate-200 font-bold py-3 rounded-xl">
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={agregarProducto} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl">
                Guardar producto
              </button>
            )}
          </div>
        </aside>

        <section>
          <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6 flex justify-between">
            <div>
              <h3 className="text-2xl font-black">Catálogo de productos</h3>
              <p className="text-sm text-slate-500">
                Mostrando {productosFiltrados.length} productos
              </p>
            </div>

            <input
              className="border rounded-xl px-4 py-3 w-80"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => {
              const ganancia =
                Number(producto.precioVenta || 0) -
                Number(producto.precioCompra || 0);

              return (
                <div key={producto.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="h-44 bg-slate-200 flex items-center justify-center">
                    <span className="text-6xl">🛍️</span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs uppercase text-slate-400 font-bold">
                      {producto.categoria}
                    </p>
                    <h4 className="text-xl font-black">{producto.nombre}</h4>

                    <p>Compra: S/ {Number(producto.precioCompra).toFixed(2)}</p>
                    <p>Venta: S/ {Number(producto.precioVenta).toFixed(2)}</p>
                    <p>Existencias: {producto.stock}</p>
                    <p className="text-green-600 font-bold">
                      Ganancia unidad: S/ {ganancia.toFixed(2)}
                    </p>

                    <div className="flex gap-2 mt-5">
                      <button onClick={() => seleccionarProducto(producto)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl">
                        Editar
                      </button>
                      <button onClick={() => eliminarProducto(producto.id)} className="flex-1 bg-red-100 text-red-700 py-2 rounded-xl">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </>
  );
}

export default Productos;