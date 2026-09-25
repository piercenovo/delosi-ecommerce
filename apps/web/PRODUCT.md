# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Principal:** una persona en Perú que compra desde el celular, a veces con poca atención y con una sola mano. Explora el catálogo, filtra por categoría, busca, compara precio y valoración, y agrega productos al carrito para revisarlos después.
- **Audiencia del reto:** el equipo técnico de Delosi evalúa esa experiencia (rendimiento, SEO, UX, arquitectura). No es un usuario aparte: juzga lo bien que la tienda sirve al comprador.

## Product Purpose

Delosi Store es una tienda de demostración construida para el reto técnico Frontend Senior de Delosi. Su propósito es mostrar un flujo de catálogo, detalle de producto y carrito con criterio de producción: HTML inmediato desde el servidor, filtros compartibles en la URL, metadata para buscadores y redes, y un carrito global predecible.

El éxito se mide en que el comprador encuentre un producto y lo agregue al carrito sin fricción, en cualquier dispositivo, con Core Web Vitals en verde y sin barreras de accesibilidad.

## Positioning

Es una tienda demo con marca propia del reto ("Delosi Store"), no una tienda oficial del grupo Delosi. No debe sugerir una relación comercial, un catálogo real ni un proceso de pago que no existe.

## Operating Context

- Catálogo de 20 productos de la FakeStore API en 4 categorías: Electrónica, Joyería, Ropa de hombre y Ropa de mujer.
- Los títulos y descripciones de los productos vienen en inglés desde la API; la interfaz está en español (es-PE).
- Precios en dólares, con formato es-PE (`USD 64.00`).
- Fotos de producto sobre fondo blanco o transparente, en proporciones variadas.
- Sin checkout ni pago: el carrito termina en un resumen con subtotal.
- Rutas: `/products` (catálogo con `?category`, `?q` y `?sort`), `/products/[id]` (detalle, 404 real si no existe) y `/cart`.

## Capabilities and Constraints

- **Se mantienen los textos y flujos actuales:** copy en español, rutas, filtros en la URL, comportamiento del carrito (cantidades 1–99, persistencia, sincronización entre pestañas) y el 404 real. El rediseño es visual y de UX, no de funcionalidad.
- **Requisitos no negociables:** WCAG 2.2 AA en tema claro y oscuro (verificado con axe en stories y E2E), CLS 0 y los presupuestos de Lighthouse de CI.
- El tema oscuro es automático (`prefers-color-scheme`) y existe hoy en todas las pantallas.
- Stack: Next.js 16 (Server Components), Design System propio `@delosi/ui` con CSS Modules y tokens CSS, sin librerías de UI externas.

## Brand Commitments

- Nombre: **Delosi Store**.
- Colores de identidad: **morado chicha morada** y **amarillo maracuyá** (definidos en los tokens de `@delosi/ui`).
- Tipografía: **Schibsted Grotesk**, autoalojada con `next/font`.
- El footer aclara que es un proyecto de reto técnico y que los productos provienen de la FakeStore API.

## Evidence on Hand

- Fotos de los 20 productos en `apps/web/public/images/products/` y en `fakestoreapi.com/img/`.
- Valoraciones (promedio y cantidad) que provee la API.
- Wordmark de texto e ícono `app/icon.svg`; imagen Open Graph generada en `app/opengraph-image.tsx`.
- No hay testimonios, reseñas escritas, logos de clientes, promociones ni stock: no se deben inventar.

## Product Principles

1. **El producto es protagonista:** la marca acompaña y da contexto, pero no compite con las fotos.
2. **Móvil primero:** las acciones clave se alcanzan con el pulgar y funcionan con conexiones lentas.
3. **Rápido y estable:** nada que agregue saltos de layout o retrase el contenido principal.
4. **Accesible por defecto:** teclado, lector de pantalla, contraste y movimiento reducido en cada cambio.
5. **Honesto:** es una demo; nada sugiere pago, stock o relación oficial que no existen.

## Accessibility & Inclusion

WCAG 2.2 AA en los dos temas. Navegación completa con teclado (skip link, foco visible y gestionado), anuncios con `aria-live`, objetivos táctiles de 44 px y respeto de `prefers-reduced-motion`.
