# Fiscus Web

[![CI](https://github.com/lfkanselmo/fiscus-web/actions/workflows/ci.yml/badge.svg)](https://github.com/lfkanselmo/fiscus-web/actions/workflows/ci.yml)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)

SPA en Angular 21 para Fiscus, el motor de categorización inteligente de gastos. Consume la API
REST de [`fiscus-api`](../fiscus-api) para importar extractos bancarios, listar y recategorizar
transacciones, gestionar categorías y sus reglas de categorización, y ver métricas mensuales.
Requiere una cuenta (registro/login) — cada usuario ve únicamente sus propios datos.

## Capturas

_(pendiente — agregar screenshot o GIF del dashboard, import y flujo de reglas)_

---

## Requisitos

- Node.js 20+
- `fiscus-api` corriendo en `http://localhost:8000` (ver su README)

---

## Configuración

La URL base de la API sale de `src/environments/environment.ts` (dev) / `environment.prod.ts`
(producción, vía `fileReplacements` en `angular.json`). En Docker, `environment.prod.ts` se genera
en build time a partir del build arg `API_BASE_URL` (ver más abajo) — no hace falta tocar código
para apuntar a otra API.

---

## Ejecución

```bash
npm install
npm start
```

Queda disponible en `http://localhost:4200`.

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
componentes, `core/utils` tiene tests unitarios puros (`color.spec.ts`, `month-value.spec.ts`) que
no requieren TestBed.

### E2E

```bash
npm run e2e
```

Playwright, contra navegador Chromium. Requiere `fiscus-api` (puerto 8000) y `fiscus-web`
(`npm start`, puerto 4200) ya corriendo — el config no orquesta los servidores automáticamente,
solo dirige el navegador contra lo que ya esté levantado. Los specs (`e2e/*.spec.ts`) generan sus
propios datos únicos por corrida (nombres con timestamp) en vez de asumir una base de datos vacía,
así conviven con lo que ya haya en la base de datos de desarrollo.

Como todas las rutas salvo `/login`/`/register` exigen sesión, la mayoría de los specs importan
`test`/`expect` desde `./fixtures/auth` en vez de `@playwright/test` directamente — ese fixture
registra un usuario descartable por HTTP antes de cada test y precarga el token en `localStorage`,
sin pasar por la UI de login. `auth.spec.ts` es la excepción: prueba el flujo de login/registro
real, así que usa `@playwright/test` sin el fixture.

---

## Estructura del proyecto

```text
src/app/
├── core/
│   ├── config/           (URL base de la API)
│   ├── constants/          (MONTH_NAMES, CATEGORY_COLOR_PRESETS, RULE_LEAF_TYPE_OPTIONS, WEEKDAY_LABELS_SHORT — únicas fuentes de verdad)
│   ├── guards/              (authGuard — redirige a /login sin sesión)
│   ├── interceptors/         (authInterceptor — adjunta el Bearer token, cierra sesión ante un 401)
│   ├── models/                 (interfaces TS — reflejan el JSON del backend tal cual, sin capa de mapeo)
│   ├── services/                (un servicio HttpClient por recurso, incluye AuthService)
│   └── utils/                    (funciones puras: currency, month-value, color, css-theme, rule-tree)
├── features/
│   ├── auth/                     (login-page, register-page, forgot-password-page, reset-password-page)
│   ├── dashboard/               (orquestación: pide datos, delega mes, gráficos y presupuestos)
│   │   └── chart-options.ts      (builders puros de opciones de echarts, testeables sin Angular)
│   ├── categories/              (lista, alta, edición y borrado de categorías)
│   │   └── category-rules-panel/ (reglas de una categoría; rule-card/ edita una regla)
│   ├── transactions/            (listado, filtro por categoría, recategorización manual)
│   └── import/                    (subida de CSV/PDF y resumen de resultado)
└── shared/
    ├── components/
    │   ├── select-field/            (desplegable propio, reemplaza <select> nativo)
    │   ├── month-picker/            (stepper + popover año/mes, usado en dashboard)
    │   ├── color-picker-field/       (panel HSV + hex + presets, reemplaza <input type="color">)
    │   ├── rule-node-editor/          (editor recursivo de un nodo del árbol de reglas — Y/O/NO)
    │   ├── weekday-toggle/             (7 chips lun..dom, reemplaza <select multiple>)
    │   └── budget-bar/                  (barra gastado/presupuesto de una categoría, 100% presentacional)
    └── pipes/                        (formato de moneda COP)
```

## Patrones de arquitectura

- **Standalone components + rutas lazy-loaded** (`loadComponent` por feature) — nada de
  `NgModule`.
- **Estado con Signals, no NgRx.** Cada feature maneja su propio estado local
  (`signal`/`computed`); no hay store global, el dominio de UI de Fiscus no lo justifica.
- **Componentes atómicos, con una sola responsabilidad.** `Dashboard` no sabe cómo dibujar un
  selector de mes ni cómo armar una opción de `echarts` — delega en `MonthPicker` y en las
  funciones puras de `chart-options.ts`. Mismo criterio para `SelectField` y `ColorPickerField`:
  cada uno se usa en más de un lugar (o está listo para reutilizarse) y no conoce nada del dominio
  de negocio que lo consume, solo `value`/`valueChange`. `RuleNodeEditor` va un paso más allá: es
  un componente recursivo (se importa a sí mismo) que edita un nodo del árbol de reglas — cada
  instancia recibe el árbol completo (`root`) más su propia posición (`path`), calcula la "nueva
  raíz" con las funciones puras de `rule-tree.ts` y la emite hacia arriba sin que ningún ancestro
  necesite reconciliar nada.
- **Constantes y utilidades centralizadas.** Nada de arrays o `Intl.NumberFormat` repetidos dentro
  de componentes — todo vive en `core/constants` y `core/utils`, con tests unitarios propios donde
  hay lógica real (conversión de color, aritmética de meses).
- **Sin capa de mapeo DTO↔modelo.** Los interfaces en `core/models` reflejan el JSON del backend
  (`snake_case`) tal cual, en vez de convertirlo a `camelCase`. Es una API interna que controlo yo
  mismo; la traducción no pagaba su complejidad.
- **Autenticación vía guard + interceptor, no wrapper por componente.** `authGuard`
  (`canActivateChild`) protege las 4 rutas de features desde un solo lugar en `app.routes.ts`, en
  vez de repetir la comprobación en cada componente. `authInterceptor` adjunta el token a cada
  request saliente y centraliza el logout-en-401 — ningún servicio de `core/services` sabe nada de
  tokens.
- **Sin Angular Material.** Lo probé inicialmente (`mat.theme()` + componentes M3), pero el look
  por defecto de Material (botones en píldora, `mat-form-field` con label flotante) competía con
  la identidad visual de Fiscus en vez de reforzarla. Tampoco un `<select>` o un
  `<input type="color">` nativos sirven del todo — el navegador o el sistema operativo renderiza
  su propio popup, imposible de restilizar. Lo retiré por completo y reemplacé ambos controles
  nativos por componentes propios (`SelectField`, `ColorPickerField`) 100% dibujados con mis
  tokens. `echarts`/`ngx-echarts` es la única dependencia de UI de terceros que queda.

---

## Identidad de marca

Los tokens de color (tinta, verde de marca, acento cálido, paleta categórica) y tipografía
(Manrope + JetBrains Mono para cifras) están centralizados en `src/styles.scss`, con soporte de
tema claro/oscuro vía `prefers-color-scheme` y `[data-theme]`.

### Sistema de componentes de formulario

Clases utilitarias globales en `styles.scss`, sin dependencia de ningún framework de UI:

| Clase | Uso |
| --- | --- |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger` | Botones |
| `.field` (con `<input>`) | Campo de texto |
| `.field-file` + `.dropzone` | Selector de archivo (input nativo oculto sobre una zona estilizada) |
| `.picker-backdrop` | Fondo compartido por cualquier panel flotante (popover) |
| `.swatch-picker` + `.swatch` | Grilla de colores preestablecidos |
| `.weekday-toggle` + `.weekday-toggle-day` | Chips de día de la semana (reemplaza `<select multiple>`) |

Los controles con popup propio (`SelectField`, `MonthPicker`, `ColorPickerField`) tienen su CSS
scoped al componente, pero comparten `.picker-backdrop` y los mismos tokens de color/radio que el
resto. Radio de esquina moderado (8px) en todos los controles — deliberadamente no-píldora,
coherente con los trazos rectos del isotipo.

---

## Tecnologías

Angular 21 (standalone, signals) · RxJS · echarts / ngx-echarts · Vitest · TypeScript (`strict`)

---

## Roadmap

MVP completo (S0–S8).

**RF-03 (post-MVP)**: edición/borrado de categorías y un editor de reglas de categorización
compuestas (comercio/monto/día de la semana combinables con Y/O/NO), reemplazando las reglas que
antes vivían hardcodeadas en el backend. Confirmación de borrado en dos pasos ("Eliminar" →
"¿Confirmar?") en vez de `window.confirm()`, consistente con "cero controles nativos del
navegador".

**Autenticación (post-MVP)**: login/registro, guard de rutas e interceptor de token — la API pasó
a exigir sesión y aislar los datos por usuario, así que la SPA necesitaba la contraparte. Token en
`localStorage` (no hay `[innerHTML]`/`bypassSecurityTrustHtml` en toda la app, así que el riesgo de
robo por XSS es bajo; lo preferí sobre `sessionStorage` para no forzar un re-login en cada cierre
de pestaña, dado que no hay refresh token en esta versión).

**Recuperación de contraseña (post-MVP)**: `forgot-password-page` (solicita el correo, mensaje
genérico de éxito sin importar si el email existe) y `reset-password-page` (token leído del query
param, nueva contraseña con confirmación). Cobertura e2e limitada a comportamiento de UI — el
entorno de test no tiene SMTP real, así que el round-trip completo (token real, contraseña nueva
funcional) queda cubierto por el test de integración de `fiscus-api`, no por Playwright.

**Presupuestos por categoría (post-MVP)**: el form de `category-list` gana un campo opcional de
presupuesto mensual (pesos en la UI, convertido a centavos con `pesosToCents`/`centsToPesos` —
mismo patrón que ya usa `rule-node-editor` para el monto de una regla). El dashboard suma un panel
"Presupuestos" con una `budget-bar` por categoría presupuestada (gastado/presupuesto, en rojo si se
supera). El backend devuelve solo números crudos (`budget_cents`, `spent_cents`);
`core/utils/budget.ts` calcula porcentaje y estado de "sobre presupuesto" — mismo criterio que ya
usa `chart-options.ts` para las opciones de los gráficos.

Detalle completo en
[`SAD_Fiscus_Motor_Categorizacion.md`](../SAD_Fiscus_Motor_Categorizacion.md).
