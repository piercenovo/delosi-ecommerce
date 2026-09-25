# ADR 0008: Observabilidad con puertos y un adaptador de consola

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

La oferta valora la observabilidad y el reto pide métricas de rendimiento. Un proveedor como Sentry o Datadog agrega una cuenta, un DSN secreto, un SDK en el bundle del cliente y costos. Para una tienda de demostración eso es más configuración que valor. Lo que sí importa es que los errores y las métricas **salgan de la app en un formato consultable** y que cambiar de destino sea barato.

## Decisión

**Dos puertos** en `shared/observability/`, sin dependencias de terceros:

- `ErrorReporter.capture(error, context)`, donde el contexto incluye `source` (`server`/`client`), `digest` y `route`.
- `MetricsReporter.report(metric)` para Web Vitals (LCP, CLS, INP, FCP y TTFB).

**Un adaptador**, `createConsoleReporter`, que escribe **un objeto JSON por línea** (`level`, `event`, `timestamp` y los campos del evento). En Vercel, esos logs se filtran en el panel del proyecto por `event`, `digest` o `route`. `reporters.ts` es el único lugar donde se elige el adaptador.

**De dónde salen los datos:**

| Origen                                                        | Mecanismo                                                          | Puerto            |
| ------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- |
| Errores del servidor (render, route handlers, actions, proxy) | `instrumentation.ts` → `onRequestError`                            | `ErrorReporter`   |
| Errores que llegan a un error boundary                        | `error.tsx` / `global-error.tsx` → `ErrorView`                     | `ErrorReporter`   |
| Web Vitals                                                    | `useReportWebVitals` → `navigator.sendBeacon('/api/vitals')` → Zod | `MetricsReporter` |

- **Correlación:** en producción, un error de Server Components llega al cliente sin detalles, solo con un mensaje genérico y un `digest`. El reporte del cliente incluye ese `digest`, que es el mismo del log del servidor (verificado), así que desde lo que vio el usuario se llega a la causa.
- **Privacidad:** las métricas llevan la ruta **sin query string**, para que los términos de búsqueda no terminen en los logs. `onRequestError` tampoco registra el path con query.
- **Validación de `/api/vitals`:** es un endpoint público, así que valida el esquema con Zod (métrica conocida, valor finito y no negativo, ruta sin `?`) y rechaza cuerpos de más de 2 KB (413), primero por `content-length` y luego por el tamaño real.

**Errores visibles para el usuario:**

- `error.tsx` por segmento, con "Intentar de nuevo" (`retry`, estable desde Next 16.3: vuelve a pedir los datos, a diferencia de `reset`) y un link al catálogo;
- `global-error.tsx`, con su propio documento;
- `not-found.tsx`.

`CATALOG_SNAPSHOT_FALLBACK=off` desactiva el respaldo (ADR 0010) solo para probar estos estados.

## Alternativas consideradas

- **Sentry/Datadog ahora:** es la opción para producción real. Aquí agrega un SDK al cliente, secretos y una cuenta sin cambiar el diseño. Se integra escribiendo otro adaptador de los mismos puertos y cambiando `reporters.ts`; ni la app ni los tests cambian.
- **Vercel Speed Insights / Analytics:** mide Web Vitals sin código propio, pero ata las métricas a la plataforma y no muestra el diseño por puertos. Es compatible con esta decisión.
- **OpenTelemetry (`@vercel/otel`):** útil para trazas distribuidas entre servicios. Esta app tiene un solo upstream, así que las trazas no aportan frente a los logs estructurados.

## Consecuencias

- Cero dependencias nuevas; los reportes son JSON consultable en cualquier plataforma de logs.
- Los logs de consola no agrupan errores, no alertan y tienen retención limitada. Con tráfico real, el siguiente paso es un adaptador hacia un proveedor.
- `/api/vitals` puede recibir tráfico abusivo. La validación limita el daño, pero no hay rate limiting en la app; en producción se delegaría al firewall de la plataforma.
- La métrica se envía con la ruta en la que se reporta, que en navegaciones del lado del cliente puede no ser la ruta en la que ocurrió (por ejemplo, el CLS acumulado).
