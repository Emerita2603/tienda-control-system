# 🛍️ TiendaFácil Control

Sistema web para la gestión de una tienda pequeña, desarrollado con React y Firebase. Permite administrar productos, ventas, gastos y generar reportes en tiempo real.

---

## 🚀 Funcionalidades

### 🔐 Autenticación
- Registro de usuarios
- Inicio de sesión
- Manejo de sesión con Firebase Auth

### 📦 Productos
- Crear productos
- Editar productos
- Eliminar productos
- Control de stock
- Cálculo de ganancia por producto

### 💸 Ventas
- Registro de ventas
- Descuento automático de stock
- Cálculo de total y ganancia
- Eliminación de ventas (recupera stock)

### 🧾 Gastos
- Registro de gastos
- Clasificación por categoría
- Eliminación de gastos

### 📊 Reportes
- Total vendido
- Ganancia en ventas
- Total de gastos
- Ganancia neta
- Valor del inventario
- Productos con bajo stock

---

## 🧠 Tecnologías utilizadas

- React (Vite)
- Firebase Firestore (Base de datos)
- Firebase Authentication (Login)
- Tailwind CSS (Diseño)

---

## 📁 Estructura del proyecto

```
src/
├── views/
│   ├── Login.jsx
│   ├── Productos.jsx
│   ├── Ventas.jsx
│   ├── Gastos.jsx
│   └── Reportes.jsx
├── firebase.js
├── App.jsx
└── main.jsx
```

## 🔗 Estructura de base de datos (Firestore)

### 📦 productos

nombre
categoria
precioCompra
precioVenta
stock
userId
fecha


### 💸 ventas

productoId
productoNombre
cantidad
precioUnitario
precioCompra
total
ganancia
userId
fecha


### 🧾 gastos

descripcion
categoria
monto
userId
fecha


---

## 🔐 Autenticación

Se utiliza Firebase Authentication con:

- Email y contraseña
- Registro desde la aplicación
- Manejo de sesión con `onAuthStateChanged`

Cada usuario tiene sus propios datos gracias a:

```js
userId: auth.currentUser.uid