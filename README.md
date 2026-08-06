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

La URL base de la API sale de `src/environments/environment.ts` (dev) / `environment.prod.ts`
(producción, vía `fileReplacements` en `angular.json`). En Docker, `environment.prod.ts` se genera en
build time a partir del build arg `API_BASE_URL` (ver más abajo) — no hace falta tocar código para
apuntar a otra API.

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

Genera el build de producción en `dist/fiscus-web/browser`.

## Docker

```bash
docker build -t fiscus-web -f docker/Dockerfile --build-arg API_BASE_URL=http://localhost:8000/api/v1 .
docker run -p 4200:80 fiscus-web
```

Build multi-stage: Node compila el bundle de producción, Nginx sirve los archivos estáticos con
fallback a `index.html` para las rutas del router. Para el stack completo (API + SPA) ver
[`docker-compose.yml`](../docker-compose.yml) en la raíz de `fiscus/`.

## Tests

```bash
npm test
```

Vitest (test runner por defecto de Angular 21, reemplaza a Karma). Además de los tests de
componentes, `core/utils` tiene tests unitarios puros (`color.spec.ts`, `month-value.spec.ts`) que no
requieren TestBed.

---

## Estructura del proyecto

```text
src/app/
├── core/
│   ├── config/           (URL base de la API)
│   ├── constants/          (MONTH_NAMES, CATEGORY_COLOR_PRESETS — únicas fuentes de verdad)
│   ├── models/              (interfaces TS — reflejan el JSON del backend tal cual, sin capa de mapeo)
│   ├── services/             (un servicio HttpClient por recurso)
│   └── utils/                 (funciones puras: currency, month-value, color, css-theme)
├── features/
│   ├── dashboard/               (orquestación: pide datos, delega mes y gráficos)
│   │   └── chart-options.ts      (builders puros de opciones de echarts, testeables sin Angular)
│   ├── categories/              (lista + alta de categorías)
│   ├── transactions/            (listado, filtro por categoría, recategorización manual)
│   └── import/                    (subida de CSV/PDF y resumen de resultado)
└── shared/
    ├── components/
    │   ├── category-badge/        (punto de color + nombre — nav, tabla, selector)
    │   ├── select-field/            (desplegable propio, reemplaza <select> nativo)
    │   ├── month-picker/            (stepper + popover año/mes, usado en dashboard)
    │   └── color-picker-field/       (panel HSV + hex + presets, reemplaza <input type="color">)
    └── pipes/                        (formato de moneda COP)
```

## Patrones de arquitectura

- **Standalone components + rutas lazy-loaded** (`loadComponent` por feature) — sin `NgModule`.
- **Estado con Signals, no NgRx.** Cada feature maneja su propio estado local (`signal`/`computed`);
  no hay store global — el dominio de UI de Fiscus no lo justifica.
- **Componentes atómicos, con una sola responsabilidad.** `Dashboard` no sabe cómo dibujar un
  selector de mes ni cómo armar una opción de `echarts` — delega en `MonthPicker` y en las funciones
  puras de `chart-options.ts`. Mismo criterio para `SelectField` y `ColorPickerField`: cada uno se
  usa en más de un lugar (o está listo para reutilizarse) y no conoce nada del dominio de negocio
  que lo consume, solo `value`/`valueChange`.
- **Constantes y utilidades centralizadas.** Nada de arrays o `Intl.NumberFormat` repetidos dentro de
  componentes — todo vive en `core/constants` y `core/utils`, con tests unitarios propios donde hay
  lógica real (conversión de color, aritmética de meses).
- **Sin capa de mapeo DTO↔modelo.** Los interfaces en `core/models` reflejan el JSON del backend
  (`snake_case`) tal cual, en vez de convertirlo a `camelCase`. Es una API interna que controlamos
  nosotros mismos; la traducción no pagaba su complejidad.
- **Sin Angular Material.** Se probó inicialmente (`mat.theme()` + componentes M3), pero el look por
  defecto de Material (botones en píldora, `mat-form-field` con label flotante) competía con la
  identidad visual de Fiscus en vez de reforzarla. Tampoco un `<select>` o un `<input type="color">`
  nativos sirven del todo — el navegador/SO renderiza su propio popup, imposible de restilizar. Se
  retiró Material por completo y se reemplazaron ambos controles nativos por componentes propios
  (`SelectField`, `ColorPickerField`) 100% dibujados con nuestros tokens. `echarts`/`ngx-echarts` es
  la única dependencia de UI de terceros que queda.

---

## Identidad de marca

Los tokens de color (tinta, verde de marca, acento cálido, paleta categórica) y tipografía (Manrope +
JetBrains Mono para cifras) están centralizados en `src/styles.scss`, con soporte de tema claro/oscuro
vía `prefers-color-scheme` y `[data-theme]`.

### Sistema de componentes de formulario

Clases utilitarias globales en `styles.scss`, sin dependencia de ningún framework de UI:

| Clase | Uso |
| --- | --- |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` | Botones |
| `.field` (con `<input>`) | Campo de texto |
| `.field-file` + `.dropzone` | Selector de archivo (input nativo oculto sobre una zona estilizada) |
| `.picker-backdrop` | Fondo compartido por cualquier panel flotante (popover) |
| `.swatch-picker` + `.swatch` | Grilla de colores preestablecidos |

Los controles con popup propio (`SelectField`, `MonthPicker`, `ColorPickerField`) tienen su CSS
scoped al componente, pero comparten `.picker-backdrop` y los mismos tokens de color/radio que el
resto. Radio de esquina moderado (8px) en todos los controles — deliberadamente no-píldora, coherente
con los trazos rectos del isotipo.

---

## Tecnologías

Angular 21 (standalone, signals) · RxJS · echarts / ngx-echarts · Vitest · TypeScript (`strict`)

---

## Pendiente (roadmap)

- **S8**: estados vacíos/carga más pulidos, hardening general.

Detalle completo en [`SAD_Fiscus_Motor_Categorizacion.md`](../SAD_Fiscus_Motor_Categorizacion.md).
