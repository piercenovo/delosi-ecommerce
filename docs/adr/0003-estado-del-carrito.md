# ADR 0003: Estado del carrito con Zustand, un reducer puro y persistencia

- **Estado:** Aceptado
- **Fecha:** 2026-09-25

## Contexto

El reto pide un botón "Agregar al carrito" en la PDP cuyo efecto se refleje en un contador del Header, y evalúa la **estrategia de estado: justificación, predictibilidad y memoria**.

El carrito es estado de cliente puro: no hay backend de carrito, debe sobrevivir a recargas y se lee en componentes separados (el Header, la PDP y `/cart`). Además, la app renderiza en servidor (Server Components, SSR y PPR), así que el HTML inicial no puede conocer el carrito del usuario.

## Decisión

**Zustand 5**, en un módulo `modules/cart/` con tres capas:

| Capa      | Contenido                                                                       | Depende de          |
| --------- | ------------------------------------------------------------------------------- | ------------------- |
| `domain/` | Tipos, `cartReducer` y selectores. Sin React, Zustand ni Next (regla de ESLint) | nada                |
| `store/`  | `createCartStore` (Zustand + `persist`), `CartStoreProvider` y los hooks        | `domain/`           |
| `ui/`     | Componentes cliente (Plan 5, F2 y F3)                                           | `store/`, `domain/` |

El carrito no importa el módulo `products` (regla de ESLint): la página le pasa los datos del producto como `CartProduct { id, title, price, image }`.

1. **Predictibilidad: toda la lógica está en un reducer puro.**
   - Hay cuatro acciones: `add`, `remove`, `setQuantity` y `clear`.
   - La cantidad va acotada a 1–99; las cantidades no enteras se ignoran, y `setQuantity(0)` elimina la línea.
   - El reducer nunca muta su entrada (test con `Object.freeze`) y **devuelve el mismo objeto si nada cambia**, así Zustand no notifica a nadie.
   - El subtotal se suma en centavos, para que 0.1 + 0.2 dé 0.3.
   - Zustand solo guarda el resultado: cada acción del store es `set((state) => cartReducer(state, action))`.
2. **Rendimiento y memoria:**
   - Cada componente se suscribe a un selector. El contador del Header solo se re-renderiza cuando cambia el total, y una línea del carrito solo cuando cambia su cantidad.
   - El store guarda datos mínimos (5 campos por línea), no el producto completo.
   - Zustand pesa alrededor de 1 KB.
3. **Un store por Provider, no un singleton de módulo.**
   - Un módulo `'use client'` también se evalúa en el servidor durante el SSR, así que un store global quedaría **compartido entre requests** de distintos usuarios. Aunque el carrito nunca se muta en el servidor, el Provider elimina esa clase de bug por diseño, que es lo que recomienda Zustand para Next.js.
   - `CartStoreProvider` (cliente) envuelve el contenido del layout raíz, y sus `children` siguen siendo Server Components.
   - Además, cada test recibe un store limpio.
4. **Hidratación sin diferencias ni CLS.**
   - `persist` usa `skipHydration: true`, y el Provider llama a `rehydrate()` en un efecto, después del primer render.
   - `useCartHydrated()` (`useSyncExternalStore`, con `false` como snapshot del servidor) permite mostrar, hasta leer el carrito guardado, un placeholder del mismo tamaño que el contenido final.
   - Un test verifica que `renderToString` muestra el placeholder aunque haya un carrito guardado.
5. **Persistencia robusta.**
   - Clave `delosi-cart`, con `version: 1` + `migrate`; una versión desconocida se descarta en vez de adivinarse. `partialize` guarda solo `items`.
   - Si leer el storage falla, `persist` nunca marca el store como hidratado y la UI quedaría esperando para siempre (lo verificamos en el código de Zustand 5.0.15). Por eso el storage propio **nunca lanza**: un JSON corrupto, `localStorage` bloqueado (modo privado) o la cuota excedida se tratan como "sin carrito guardado", y el carrito sigue funcionando en memoria.
   - **`localStorage` es entrada del usuario:** `merge` la valida con Zod (ids, precios, cantidades 1–99 e imágenes locales o de FakeStore, con la misma regla que `remotePatterns`, porque `next/image` rechazaría un host desconocido; ver el [ADR 0012](0012-imagenes-de-producto.md)). Si no valida, se descarta.
6. **Sincronización entre pestañas:** el evento `storage` de la clave `delosi-cart` dispara `rehydrate()`, así que el contador se actualiza en todas las pestañas abiertas.
7. **Dos puntos de entrada, una sola lógica:** "Agregar al carrito" en la PDP y el botón rápido de cada tarjeta del catálogo usan el mismo hook `useAddToCart` (agregar, anunciar y feedback breve).
   - `products` no importa `cart`: la tarjeta expone un slot `action` y la página compone el botón. `toCartProduct` es el único punto donde un `Product` se convierte en `CartProduct`.
   - **Un solo anuncio accesible** para toda la tienda: una región `aria-live` en `CartProvider`, no una por tarjeta (serían 20 en el catálogo).
   - El botón rápido flota sobre la esquina de la imagen: cabe en tarjetas de 320 px y no cambia la altura de la tarjeta (se verificó que en la fila del precio no entraba en mobile).
8. **El precio es el del momento de agregar.** Alcanza para una demo. En un checkout real, el servidor recalcularía los precios antes de cobrar.

## Alternativas consideradas

- **React Context + `useReducer`:** sin dependencias, pero cualquier cambio re-renderiza a todos los consumidores del contexto (el Header, la PDP y cada línea). Separarlo en varios contextos o memoizar resuelve parte del problema, a costa de un código que Zustand ya ofrece. El reducer puro permite migrar a esta opción sin tocar la lógica.
- **Redux Toolkit:** predecible y con devtools, pero es boilerplate desproporcionado (store, slice, Provider y tipos) para cuatro acciones.
- **Jotai / Valtio:** buenos para estado atómico o mutable. Un carrito es una sola entidad con reglas que se expresan mejor como un reducer.
- **Carrito en servidor** (cookie o sesión + Server Actions): permitiría leerlo en el SSR y recalcular precios, pero no hay backend de carrito. Es la evolución natural si lo hubiera: el reducer se reutilizaría en el servidor.
- **Singleton de módulo** (`create()` de Zustand, lo más común en los ejemplos): descartado por el riesgo de compartir estado entre requests durante el SSR (punto 3).

## Consecuencias

- El HTML del servidor nunca incluye el carrito. El contador y `/cart` muestran un placeholder hasta la hidratación, que dura un render.
- **Sin variantes:** FakeStore no tiene tallas ni colores, así que agregar desde el catálogo es válido. Con variantes, el botón rápido abriría un selector en lugar de agregar directamente.
- Cambiar el esquema persistido requiere subir `CART_STORAGE_VERSION` y manejar la versión anterior en `migrate`.
- `domain/` concentra la lógica con cobertura mínima del 95 %. `store/` se prueba con el `localStorage` real de jsdom (persistencia, rehidratación, pestañas) y con un storage en memoria (fallos).
