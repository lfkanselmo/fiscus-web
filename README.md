# Fiscus Web

SPA en Angular 21 para [Fiscus](../SAD_Fiscus_Motor_Categorizacion.md), el motor de categorización
inteligente de gastos. Consume la API REST de [`fiscus-api`](../fiscus-api) para importar extractos
bancarios, listar y recategorizar transacciones, gestionar categorías y ver métricas mensuales.

---

## Requisitos

- Node.js 20+
- `fiscus-api` corriendo en `http://localhost:8000` (ver su README)

---

## Configuración

La URL base de la API está en `src/app/core/config/api.config.ts`. Sin variables de entorno ni
`fileReplacements` — es un único valor de configuración, no justifica esa infraestructura todavía.

---

## Ejecución

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:4200`.

## Build

```bash
npm run build
```

Genera el build de producción en `dist/fiscus-web`.

## Tests

```bash
npm test
```

Vitest (test runner por defecto de Angular 21, reemplaza a Karma).

---

## Estructura del proyecto

```text
src/app/
├── core/
│   ├── config/       (URL base de la API)
│   ├── models/        (interfaces TS — reflejan el JSON del backend tal cual, sin capa de mapeo)
│   └── services/       (un servicio HttpClient por recurso: categories, transactions, imports, metrics)
├── features/
│   ├── categories/     (lista + alta de categorías)
│   ├── transactions/    (listado, filtro por categoría, recategorización manual)
│   └── import/           (subida de CSV/PDF y resumen de resultado)
└── shared/
    ├── components/      (category-badge — reutilizado en nav, tabla y selector)
    └── pipes/            (formato de moneda COP)
```

## Patrones de arquitectura

- **Standalone components + rutas lazy-loaded** (`loadComponent` por feature) — sin `NgModule`.
- **Estado con Signals, no NgRx.** Cada feature maneja su propio estado local (`signal`/`computed`);
  no hay store global — el dominio de UI de Fiscus no lo justifica.
- **Sin capa de mapeo DTO↔modelo.** Los interfaces en `core/models` reflejan el JSON del backend
  (`snake_case`) tal cual, en vez de convertirlo a `camelCase`. Es una API interna que controlamos
  nosotros mismos; la traducción no pagaba su complejidad.

---

## Identidad de marca

Los tokens de color (tinta, verde de marca, acento cálido, paleta categórica) y tipografía (Manrope +
JetBrains Mono para cifras) están centralizados en `src/styles.scss`, con soporte de tema claro/oscuro
vía `prefers-color-scheme` y `[data-theme]`. Angular Material (`mat.theme()`) provee el comportamiento
estructural (estados, elevación); el color visible sale siempre de estos tokens, no de la paleta M3
generada.

---

## Tecnologías

Angular 21 (standalone, signals) · Angular Material · RxJS · Vitest · TypeScript (`strict`)

---

## Pendiente (roadmap)

- **S6**: feature `dashboard` con `ngx-echarts` (gasto por categoría, tendencia mensual).
- **S7**: `Dockerfile` (Nginx sobre el build de producción).
- **S8**: estados vacíos/carga más pulidos, hardening general.

Detalle completo en [`SAD_Fiscus_Motor_Categorizacion.md`](../SAD_Fiscus_Motor_Categorizacion.md).
