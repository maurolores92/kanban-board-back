# AI Kanban Backend

Backend de una plataforma Kanban inteligente y multi-tenant desarrollada con NestJS y PostgreSQL.

La API proporciona autenticación JWT, sistema avanzado de roles y permisos (RBAC), gestión de tableros Kanban, automatización mediante IA y arquitectura escalable orientada a aplicaciones SaaS.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- JWT Authentication
- Sistema RBAC dinámico
- Roles y permisos por usuario
- Guards y Middleware personalizados
- Protección de rutas

### 📋 Gestión Kanban
- CRUD de tableros
- Gestión de columnas y tareas
- Reordenamiento dinámico
- Arquitectura multi-tenant

### 🧠 Integración con IA
- Generación automática de tableros
- Creación inteligente de tareas
- Automatización de workflows
- Integración con Groq API

### ⚡ Tiempo Real
- WebSockets con Socket.IO
- Eventos en tiempo real
- Actualización colaborativa

### 🗄️ Base de Datos
- PostgreSQL
- Relaciones complejas
- Arquitectura escalable
- Persistencia multi-tenant

---

## 🛠️ Stack Tecnológico

### Backend
- NestJS
- TypeScript
- Node.js

### Base de Datos
- PostgreSQL
- TypeORM

### Seguridad
- JWT
- Passport.js
- RBAC

### Tiempo Real
- Socket.IO

### Integraciones
- Groq API

---

## 🚀 Instalación

### Clonar el repositorio

```bash
git clone https://github.com/maurolores92/kanban-board-back.git
```

### Instalar dependencias

```bash
npm install
```

---

## ⚙️ Variables de entorno

Crear un archivo `.env`:

```env
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=kanban_db

JWT_SECRET=your_jwt_secret

GROQ_API_KEY=your_groq_api_key
```

---

## ▶️ Ejecutar el proyecto

```bash
npm run start:dev
```

---

## 🧠 Arquitectura Backend

El backend sigue una arquitectura modular basada en NestJS:

- Módulos desacoplados
- Guards y decorators personalizados
- Sistema RBAC dinámico
- Arquitectura multi-tenant
- WebSockets integrados
- Servicios reutilizables
- API REST escalable

---

## 📌 Funcionalidades Futuras

- Auditoría de acciones
- Logs avanzados
- Automatizaciones configurables
- Integraciones externas
- Sistema de notificaciones
- API pública

---

## 👨‍💻 Autor

Desarrollado por Mauricio Lores

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.