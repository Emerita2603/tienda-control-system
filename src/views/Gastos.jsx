import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";

function Gastos() {
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [gastos, setGastos] = useState([]);

  const gastosCollection = collection(db, "gastos");

  useEffect(() => {
    const escucharGastos = onSnapshot(gastosCollection, (snapshot) => {
      const gastosData = snapshot.docs
        .map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
        .filter((gasto) => gasto.userId === auth.currentUser.uid);

      setGastos(gastosData);
    });

    return () => escucharGastos();
  }, []);

  const registrarGasto = async () => {
    if (!descripcion || !categoria || !monto) {
      alert("Completa todos los campos");
      return;
    }

    if (Number(monto) <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    await addDoc(gastosCollection, {
      descripcion,
      categoria,
      monto: Number(monto),
      fecha: new Date(),
      userId: auth.currentUser.uid,
    });

    setDescripcion("");
    setCategoria("");
    setMonto("");

    alert("Gasto registrado correctamente");
  };

  const eliminarGasto = async (id) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este gasto?");
    if (!confirmar) return;

    await deleteDoc(doc(db, "gastos", id));

    alert("Gasto eliminado correctamente");
  };

  const totalGastos = gastos.reduce(
    (total, gasto) => total + Number(gasto.monto || 0),
    0
  );

  return (
    <div>
      <section className="mb-8">
        <h2 className="text-4xl font-black mb-2">Módulo de Gastos</h2>
        <p className="text-slate-500 max-w-2xl">
          Registra gastos de la tienda como compras, servicios, transporte y
          otros pagos.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Gastos registrados</p>
          <h3 className="text-3xl font-black">{gastos.length}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border">
          <p className="text-sm text-slate-500">Total gastado</p>
          <h3 className="text-3xl font-black text-red-600">
            S/ {totalGastos.toFixed(2)}
          </h3>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        <aside className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
          <h3 className="text-xl font-black mb-4">🧾 Registrar gasto</h3>

          <div className="space-y-3">
            <input
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              type="text"
              placeholder="Descripción del gasto"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            <select
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Selecciona categoría</option>
              <option value="Mercadería">Mercadería</option>
              <option value="Servicios">Servicios</option>
              <option value="Transporte">Transporte</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Otros">Otros</option>
            </select>

            <input
              className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
              type="number"
              placeholder="Monto del gasto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <button
              onClick={registrarGasto}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl"
            >
              Registrar gasto
            </button>
          </div>
        </aside>

        <section>
          <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
            <h3 className="text-2xl font-black">Historial de gastos</h3>
            <p className="text-sm text-slate-500">
              Últimos gastos registrados en la tienda.
            </p>
          </div>

          {gastos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border">
              <p className="text-slate-500">
                Todavía no hay gastos registrados.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-4">Descripción</th>
                    <th className="text-left p-4">Categoría</th>
                    <th className="text-left p-4">Monto</th>
                    <th className="text-left p-4">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {gastos.map((gasto) => (
                    <tr key={gasto.id} className="border-t">
                      <td className="p-4 font-semibold">
                        {gasto.descripcion}
                      </td>
                      <td className="p-4">{gasto.categoria}</td>
                      <td className="p-4 text-red-600 font-bold">
                        S/ {Number(gasto.monto || 0).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => eliminarGasto(gasto.id)}
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

export default Gastos;