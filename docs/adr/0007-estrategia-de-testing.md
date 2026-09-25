# ADR 0007: Estrategia de testing por riesgo, con BDD en español y un mock propio

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

El reto evalúa el testing. La app tiene lógica de negocio pura (filtros, orden, carrito), componentes con requisitos de accesibilidad, integración con una API externa poco confiable (FakeStore, bloqueada por Cloudflare desde datacenters) y requisitos que solo se ven con el build real: PPR, caché, status HTTP, metadata para crawlers y Core Web Vitals.

Probar todo con E2E sería lento y frágil; probar todo con unitarios dejaría sin cubrir justo lo que falla en producción.

## Decisión

Cada comportamiento se prueba en el nivel más barato que da confianza real sobre él. El detalle está en [`testing-strategy.md`](../testing-strategy.md).

1. **Unitarios (Vitest) para el dominio y los casos de uso,** con TDD y **95 % de cobertura mínima en `domain/`** (80 % global). Los casos de uso reciben el repositorio por parámetro y se prueban con un fake en memoria.
2. **Integración (Vitest + Testing Library + MSW) para componentes y adaptadores.** Se localiza por rol y nombre accesible. El HTTP se simula con MSW, nunca con un mock de `fetch`, así se prueba el cliente real.
3. **Las reglas de arquitectura también son tests:** `architecture.test.ts` ejecuta ESLint sobre fragmentos que violan cada regla.
4. **Design System: cada story es un test** en Chromium real (Vitest browser mode), con su `play` y axe (WCAG 2.2 AA) en tema claro y oscuro. Las APIs que previenen errores de accesibilidad tienen tests de tipos (`@ts-expect-error`).
5. **E2E con Playwright + playwright-bdd, escritos en Gherkin en español,** contra el build de producción, en Chromium, mobile (Pixel 7) y WebKit, con axe en cada página.
   - **En español** porque es el lenguaje del negocio y de la UI: un producto o QA puede leer los escenarios y validarlos.
   - **Pasos finos y Page Objects:** el escenario dice qué, el Page Object dice cómo.
6. **Un mock propio de FakeStore** (`e2e/mock-server.ts`) que sirve el snapshot versionado:
   - determinismo: los datos no cambian entre corridas;
   - CI sin red y sin depender de Cloudflare;
   - una segunda instancia de la app apunta a un mock "caído" para probar los errores sin estado compartido entre tests.
7. **Lighthouse con script propio (Lighthouse 13)** y presupuestos por página y dispositivo, con la mediana de 3 corridas. Lighthouse CI (LHCI) quedó descartado porque está desactualizado respecto a Lighthouse 13.

## Alternativas consideradas

- **Cypress:** buena experiencia de depuración, pero WebKit sigue siendo experimental, el paralelismo es de pago y corre dentro del navegador, lo que complica probar varias instancias y status HTTP. Playwright cubre los tres motores (Chromium, Firefox y WebKit) con un solo runner.
- **Cucumber.js puro:** es el runner BDD original, pero pierde los fixtures, el paralelismo, los proyectos por navegador y el informe de Playwright. playwright-bdd genera tests de Playwright desde los `.feature` y conserva todo eso.
- **E2E contra la API real:** más realista, pero FakeStore bloquea las IPs de CI y sus datos pueden cambiar, lo que da falsos negativos. El contrato con la API real se cubre con los tests del adaptador (MSW + Zod) y con el endpoint `/api/health` en producción.
- **Snapshots de componentes (`toMatchSnapshot`):** se actualizan sin mirarlos y no dicen qué comportamiento se rompió. Se prefieren aserciones explícitas por rol.
- **Solo E2E:** lento y difícil de diagnosticar; los bordes del dominio (cantidades, centavos, orden estable) se prueban mejor en unitarios.

## Consecuencias

- 398 tests unitarios y de integración (332 en la app, 66 en el Design System) corren en segundos; la app tiene ~98 % de cobertura de líneas.
- Los E2E cubren 26 escenarios (más los ejemplos de los esquemas) en tres navegadores, en unos 3 minutos en CI.
- Agregar un escenario E2E suele ser escribir Gherkin reutilizando pasos existentes.
- El mock debe mantenerse alineado con la API: si FakeStore cambia su contrato, falla primero el adaptador (Zod) y hay que regenerar el snapshot.
- Queda fuera un smoke test contra el preview de Vercel, que requiere un token de bypass de Deployment Protection. Se puede agregar con una etiqueta `@smoke`.
