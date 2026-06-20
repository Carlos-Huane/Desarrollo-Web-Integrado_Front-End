# Plan de Frontend — Intranet TelecoPerú

**Curso:** Desarrollo Web Integrado (100000ST61) · Ciclo 1 Marzo 2026
**Grupo:** 6 · **Docente:** Marcelino Estrada Aro
**Frontend:** Angular 18 + SCSS + Standalone Components
**Backend (consumido):** Spring Boot 3.3.5 + JWT en `http://localhost:8080`

---

## 1. Objetivo

Construir el frontend de la Intranet de Gestión de Incidencias consumiendo la
API REST ya existente del backend. Carlos cubre ~80 % del trabajo; el 20 %
restante se delega al Development Team (ver `HISTORIAS-USUARIO.txt`).

---

## 2. Mapeo al sílabo (Unidad 3 — semanas 11 a 18)

| Sem. | Tema del sílabo                                       | Cobertura en este plan                                                                  |
|------|--------------------------------------------------------|------------------------------------------------------------------------------------------|
| 11   | Fundamentos de Angular + SASS                         | Scaffold + variables SCSS (`src/styles/_variables.scss`) + paleta + tipografía.         |
| 12   | Rutas + comunicación entre componentes                | `app.routes.ts` con lazy loading + 3 layouts + input() en `AppShellComponent`.          |
| 13   | Formularios + validación                              | Reactive Forms en login, usuario-formulario, ticket-crear, sla.                          |
| 14   | Consumo de servicios + autorización (JWT en Angular)  | `core/services/*` + `JwtInterceptor` + `authGuard` + `roleGuard`.                       |
| 15   | Integración → APF3                                    | Entrega: login + flujo CLIENTE (crear/listar tickets) + flujo ADMIN (dashboard + CRUDs).|
| 16   | Comunicación back-front + resolución de problemas     | Manejo de 401/403, errores HTTP centralizados, alineación de DTOs.                       |
| 17   | Despliegue                                             | Build prod + deploy en Vercel + README.                                                 |
| 18   | Proyecto Final                                         | Demo completa: 3 roles funcionando contra back desplegado.                              |

---

## 3. Stack y dependencias

| Capa            | Tecnología                                  |
|-----------------|---------------------------------------------|
| Framework       | Angular 18 (standalone components)          |
| Estilos         | SCSS con variables centralizadas            |
| Routing         | Lazy loading + guards funcionales           |
| HTTP            | HttpClient + interceptor functional         |
| Estado          | Angular signals (no NgRx por simplicidad)   |
| Formularios     | Reactive Forms                              |
| Build           | esbuild (default en Angular 18)             |

Por agregar más adelante (HUs específicas):
- `chart.js` + `ng2-charts` (HU-DASH-02 / DASH-03)

---

## 4. Estructura de carpetas

```
src/
├── environments/                       Variables por entorno (API_BASE_URL)
├── styles/                             Variables SCSS globales (paleta + tipo)
├── styles.scss                         Imports globales y utilidades (.badge)
└── app/
    ├── app.config.ts                   Providers (HttpClient + interceptor)
    ├── app.routes.ts                   Rutas lazy con guards por rol
    ├── app.component.ts                Shell mínimo (<router-outlet/>)
    ├── core/
    │   ├── auth/                       AuthService, jwt.interceptor, guards
    │   ├── models/                     Enums + interfaces (usuario, ticket…)
    │   └── services/                   UsuarioService, CategoriaService, etc.
    ├── shared/
    │   └── components/app-shell/       Layout reutilizable sidebar + topbar
    ├── layouts/
    │   ├── admin-layout/               Usa <app-shell> con nav de admin
    │   ├── tecnico-layout/             Usa <app-shell> con nav de técnico
    │   └── cliente-layout/             Usa <app-shell> con nav de cliente
    └── features/
        ├── auth/login/                 Login funcional
        ├── dashboard/                  KPIs (admin)
        ├── usuarios/                   Listar + formulario
        ├── categorias/                 Listar + subcategorías
        ├── tickets/                    listar, detalle, crear, bandeja, mis
        └── sla/                        Configuración por prioridad
```

---

## 5. Fases de ejecución

### Fase 0 — Setup (HECHO)
- Scaffold Angular 18 con SCSS + routing + standalone.
- Estructura modular completa.
- AuthService, interceptor, guards.
- Servicios HTTP de los 5 módulos del back.
- Login funcional contra `/api/auth/login`.
- 3 layouts por rol con sidebar dinámico.
- 12 componentes feature creados (8 implementados por Carlos, 3 stubs para el
  equipo, 1 reusado entre roles).
- Build pasa: `ng build` genera 14 lazy chunks correctamente.

### Fase 1 — Validación end-to-end (1 sesión)
- Levantar back: `mvn spring-boot:run` en el repo del backend.
- Levantar front: `ng serve` en `http://localhost:4200`.
- Probar: login con cada credencial del README del back.
- Probar: crear ticket como cliente, asignar como admin, cambiar estado como
  técnico.
- Capturar issues en `docs/ISSUES-INTEGRACION.md` si aparecen.

### Fase 2 — Refinamiento del flujo crítico (Carlos, 2 sesiones)
Cerrar HU-CLI-04 (restricción visual cliente) + HU-USR-04 (búsqueda/filtros)
+ HU-DEP-03 (README de uso). Ese trío cierra el "happy path" del demo final.

### Fase 3 — Entrega APF3 (semana 15)
- Demo: login con los 3 roles, dashboard con KPIs, crear ticket como cliente,
  asignar y resolver como admin/técnico.
- Documentación: este plan + HUs + README + capturas en `docs/`.

### Fase 4 — Tareas del equipo (semana 15–17)
- Cada miembro toma sus HUs marcadas `[DEV-N]` y crea ramas desde develop.
- Carlos revisa PRs y resuelve conflictos.

### Fase 5 — Despliegue (semana 17)
- Build prod: `ng build`.
- Deploy en Vercel apuntando `environment.prod.ts` al backend desplegado.
- `vercel.json` con rewrite `/* -> /index.html` para SPA.

### Fase 6 — Proyecto Final (semana 18)
- Demo completa contra back + front desplegados.
- Cierre y entrega.

---

## 6. Convenciones de Git

- Rama `main`: solo recibe merges de `develop` para hitos (APF3, PROY).
- Rama `develop`: rama de trabajo. Carlos pushea directo aquí.
- Compañeros: crean `feature/<modulo>-<descripcion-corta>` desde `develop`
  y abren PR a `develop`.
- Mensajes de commit en imperativo y en español, ej.:
    - `feat(tickets): listar tickets del admin con filtros`
    - `fix(auth): redirigir a /login en 401`

---

## 7. Comandos de uso diario

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:4200)
ng serve

# Build de producción
ng build

# Tests unitarios
ng test

# Lint
ng lint
```

---

## 8. Pendientes inmediatos del Scrum Master (Carlos)

1. Validar integración end-to-end levantando back + front juntos.
2. Cerrar HU-CLI-04 + HU-USR-04 + HU-DEP-03.
3. Asignar HUs en formato Trello / Jira / tablero del curso.
4. Coordinar primer PR de cada compañero antes de la semana 16.
5. Hacer build prod y deploy en semana 17.
