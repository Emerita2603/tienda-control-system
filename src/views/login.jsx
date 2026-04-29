import { useState } from "react";
import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [modoRegistro, setModoRegistro] = useState(false);

    // 🔐 LOGIN
    const iniciarSesion = async () => {
        if (!email || !password) {
            alert("Completa todos los campos");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Correo o contraseña incorrectos");
            console.log(error);
        }
    };

    // 🆕 REGISTRO
    const registrarse = async () => {
        if (!email || !password) {
            alert("Completa todos los campos");
            return;
        }

        if (password.length < 6) {
            alert("La contraseña debe tener mínimo 6 caracteres");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Cuenta creada correctamente");
        } catch (error) {
            console.log(error.code);
            alert("Error: " + error.code);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow border p-8">

                <h1 className="text-3xl font-black mb-2">
                    {modoRegistro ? "🆕 Crear cuenta" : "🔐 Iniciar sesión"}
                </h1>

                <p className="text-slate-500 mb-6">
                    {modoRegistro
                        ? "Crea una cuenta para usar el sistema."
                        : "Accede al sistema de control de tienda."}
                </p>

                <div className="space-y-3">
                    <input
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {modoRegistro ? (
                        <button
                            onClick={registrarse}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
                        >
                            Crear cuenta
                        </button>
                    ) : (
                        <button
                            onClick={iniciarSesion}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl"
                        >
                            Ingresar
                        </button>
                    )}
                </div>

                <div className="mt-6 text-center text-sm">
                    {modoRegistro ? (
                        <p>
                            ¿Ya tienes cuenta?{" "}
                            <button
                                type="button"
                                onClick={() => setModoRegistro(false)}
                                className="text-orange-600 font-bold"
                            >
                                Iniciar sesión
                            </button>
                        </p>
                    ) : (
                        <p>
                            ¿No tienes cuenta?{" "}
                            <button
                                type="button"
                                onClick={() => setModoRegistro(true)}
                                className="text-green-600 font-bold"
                            >
                                Crear cuenta
                            </button>
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Login;