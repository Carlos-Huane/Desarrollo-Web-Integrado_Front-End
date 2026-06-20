# Intranet TelecoPerú — Frontend

**Curso:** Desarrollo Web Integrado · **Grupo 6** · **Docente:** Marcelino Estrada Aro
**Stack:** Angular 18 + SCSS + Standalone Components + JWT

> Backend (Spring Boot) en repo separado: `Desarrollo-Web-Integrado_Back-End`.

---

## 1. Prerequisitos

| Herramienta | Versión |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Angular CLI | 18.x (`npm i -g @angular/cli@18`) |

---

## 2. Instalación

```bash
git clone <url-de-este-repo>
cd Desarrollo-Web-Integrado_Front-End
npm install
```

---

## 3. Configuración

Editar `src/environments/environment.ts` y verificar que `apiBaseUrl` apunte
al backend en local:

```ts
export const environment = {
  apiBaseUrl: 'http://localhost:8080/api',
  ...
};
```

El backend debe estar corriendo en `http://localhost:8080` antes de levantar
el front. Ver README del repo del backend.

---

## 4. Levantar en desarrollo

```bash
ng serve
```

Abrir `http://localhost:4200`. Login con credenciales del backend:

| Email | Password | Rol |
|---|---|---|
| admin@telecoperu.com | admin123 | ADMIN |
| tecnico1@telecoperu.com | tecnico123 | TECNICO |
| pedro.sanchez@telecoperu.com | cliente123 | CLIENTE |

---

## 5. Build de producción

```bash
ng build
```

Salida en `dist/desarrollo-web-integrado-front-end/`.

---

## 6. Estructura

```
src/app/
├── core/           Auth, modelos, servicios HTTP
├── shared/         Componentes y utilidades reutilizables
├── layouts/        Layouts por rol (admin / tecnico / cliente)
└── features/       Vistas funcionales (auth, dashboard, usuarios, ...)
```

Detalle del plan en `docs/PLAN-FRONTEND.md`.
Historias de usuario en `docs/HISTORIAS-USUARIO.txt`.
**Plan de pruebas QA en `docs/PLAN-DE-PRUEBAS.txt`** (62 casos para Matias y Angelo).

---

## 7. Convenciones de Git

- `main`: hitos (APF3, Proyecto Final). Solo recibe merges desde `develop`.
- `develop`: rama de trabajo. Carlos pushea directo.
- Equipo: ramas `feature/<modulo>-<descripcion>` desde `develop` → PR a `develop`.

---

## 8. Integrantes

| Nombre | Rol Scrum |
|---|---|
| Rodriguez Pozo, Matias Ariel | Product Owner |
| Huane Sarmiento, Carlos Jesus | Scrum Master |
| Gonzales Alvis, Claudia Leonor | Development Team |
| Prado Misaico, Bartolome Angelo | Development Team |
| Rodriguez Chacaliaza, Airton Clides | Development Team |
