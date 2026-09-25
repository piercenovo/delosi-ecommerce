---
name: Delosi Store
description: Tienda demo con una vitrina morada donde el producto es el protagonista.
colors:
  chicha-morada: '#5b2a86'
  chicha-morada-hover: '#48206c'
  franja-de-marca: '#5b2a86'
  franja-de-marca-hover: '#6e3a9e'
  texto-sobre-marca: '#ffffff'
  texto-sobre-marca-suave: '#e4d8f0'
  maracuya: '#f5c84c'
  maracuya-hover: '#ebb82f'
  texto-sobre-maracuya: '#1d1b22'
  lavanda-de-vitrina: '#f1eaf8'
  fondo: '#ffffff'
  superficie: '#ffffff'
  superficie-suave: '#f4f2f7'
  borde: '#ddd9e3'
  borde-fuerte: '#8f889a'
  tinta: '#1d1b22'
  tinta-suave: '#5e5a66'
  peligro: '#b42318'
  exito: '#1f7a4d'
typography:
  display:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 1.25rem + 3vw, 3.25rem)'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 2rem)'
    fontWeight: 600
    lineHeight: 1.2
  price:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '2rem'
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 500
    lineHeight: 1.35
  body:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Schibsted Grotesk, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: '6px'
  md: '12px'
  pill: '999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
  '10': '40px'
  '12': '48px'
components:
  button-primary:
    backgroundColor: '{colors.chicha-morada}'
    textColor: '{colors.superficie}'
    rounded: '{rounded.sm}'
    padding: '0 20px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.chicha-morada-hover}'
  button-highlight:
    backgroundColor: '{colors.maracuya}'
    textColor: '{colors.texto-sobre-maracuya}'
    rounded: '{rounded.sm}'
    padding: '0 20px'
    height: '44px'
  button-highlight-hover:
    backgroundColor: '{colors.maracuya-hover}'
  button-secondary:
    backgroundColor: '{colors.superficie}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.sm}'
    padding: '0 20px'
    height: '44px'
  button-ghost:
    textColor: '{colors.chicha-morada}'
    rounded: '{rounded.sm}'
    padding: '0 20px'
    height: '44px'
  icon-button-floating:
    backgroundColor: '{colors.superficie}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.pill}'
    size: '44px'
  icon-button-floating-hover:
    backgroundColor: '{colors.chicha-morada}'
    textColor: '{colors.superficie}'
  chip:
    backgroundColor: '{colors.superficie}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.pill}'
    padding: '0 16px'
    height: '40px'
  chip-selected:
    backgroundColor: '{colors.chicha-morada}'
    textColor: '{colors.superficie}'
  input:
    backgroundColor: '{colors.superficie}'
    textColor: '{colors.tinta}'
    rounded: '{rounded.sm}'
    padding: '0 12px'
    height: '44px'
  card-media:
    backgroundColor: '{colors.lavanda-de-vitrina}'
    rounded: '{rounded.md}'
  badge-count:
    backgroundColor: '{colors.maracuya}'
    textColor: '{colors.texto-sobre-maracuya}'
    rounded: '{rounded.pill}'
  site-header:
    backgroundColor: '{colors.franja-de-marca}'
    textColor: '{colors.texto-sobre-marca}'
    height: '64px'
  site-footer:
    backgroundColor: '{colors.superficie-suave}'
    textColor: '{colors.tinta-suave}'
---

# Design System: Delosi Store

La fuente normativa de los valores es `packages/ui/src/tokens/tokens.css`. Este documento la resume y explica cómo aplicarla. Los colores del frontmatter son los del tema claro; el tema oscuro está descrito en la sección Colors y en los tokens.

## Overview

**Creative North Star: "La vitrina morada"**

La tienda funciona como una vitrina: la marca pone el marco y el producto se exhibe. El morado chicha morada es dueño de una sola región (la franja del header), el resto de la interfaz es neutra y cálida, y cada foto descansa sobre un fondo lavanda que la hace sentir parte de la misma tienda aunque venga de otro lugar. El amarillo maracuyá aparece solo en momentos de valor: el contador del carrito y la confirmación de "agregado".

El tono es **cálido, claro y sobrio**. Presente pero sin ruido: la marca se reconoce al primer vistazo y luego se retira para que el comprador compare fotos, precios y valoraciones. La densidad es la de una tienda en el celular: dos columnas de productos, controles al alcance del pulgar y ninguna decoración que no ayude a elegir.

**Key Characteristics:**

- Una franja de marca morada arriba, sticky, y un cierre neutro abajo con el mismo logo.
- Productos sin caja: la foto redondeada sobre lavanda da la forma de la tarjeta.
- El precio es el texto más fuerte de cada producto.
- Plano por defecto; la única sombra es la del botón que flota sobre una foto.
- Un solo tipo de letra, Schibsted Grotesk, en todo el sistema.

## Colors

Una paleta de un acento y un destello: morado para identidad y acción, maracuyá para celebrar, y neutros fríos con un toque lavanda.

### Primary

- **Chicha morada** (`chicha-morada`): el color de acción e identidad. Botones primarios, chip de categoría activa, enlaces, estrellas de valoración y el anillo de foco. En tema oscuro se aclara a lila (#c9a2ea) para mantener contraste AA sobre fondo oscuro.
- **Franja de marca** (`franja-de-marca`): el mismo morado aplicado como superficie, solo en el header. En tema oscuro baja a un morado profundo (#3a1f57) para no deslumbrar. Dentro de la franja, los tokens semánticos se remapean (texto blanco, hover `franja-de-marca-hover`, foco maracuyá).

### Secondary

- **Maracuyá** (`maracuya`): el destello de valor. Contador del carrito, estado "Agregado" del botón de compra y del agregado rápido, y la baldosa del logo. Siempre con texto `texto-sobre-maracuya` (casi negro), nunca con blanco.

### Tertiary

- **Lavanda de vitrina** (`lavanda-de-vitrina`): fondo detrás de cada foto de producto (catálogo, detalle, relacionados, carrito). Unifica fotos de proporciones y fondos distintos. En tema oscuro es #2b2338.

### Neutral

- **Fondo y superficie** (`fondo`, `superficie`): blanco en claro, #17141c y #211d28 en oscuro.
- **Superficie suave** (`superficie-suave`): hover de controles fantasma y la franja del footer.
- **Tinta** (`tinta`) y **tinta suave** (`tinta-suave`): texto principal y secundario (conteos, valoraciones, notas).
- **Borde** (`borde`) y **borde fuerte** (`borde-fuerte`): separadores discretos y el contorno de campos, chips y botones secundarios (3:1 sobre el fondo).
- **Peligro** y **éxito**: solo para estados de error y confirmación.

### Named Rules

**The Una Región Rule.** El morado como superficie existe solo en el header. En el resto de la página el morado es tinta de acción (botones, chip activo, foco), nunca fondo de secciones.

**The Maracuyá Es Celebración Rule.** El amarillo marca valor o confirmación (contador, "Agregado"). Nunca se usa como decoración ni como color de texto.

## Typography

**Display Font:** Schibsted Grotesk (con system-ui)
**Body Font:** Schibsted Grotesk (con system-ui)

**Character:** una grotesca de periódico con carácter en los pesos altos y muy legible en los bajos. Un solo tipo de letra: la jerarquía sale del tamaño, el peso y el espaciado, no de mezclar familias.

### Hierarchy

- **Display** (700, `clamp(2rem, 1.25rem + 3vw, 3.25rem)`, 1.05, tracking -0.035em): el título del catálogo, que cambia con la categoría activa. Es el único momento tipográfico audaz.
- **Headline** (600, `clamp(1.25rem, 1rem + 1.2vw, 2rem)`, 1.2): el título del producto en el detalle. Menos peso que el precio a propósito.
- **Price** (700, 2rem en el detalle, 1.125rem en tarjetas): el precio, siempre con `tabular-nums`.
- **Title** (500, 1rem, 1.35): nombres de producto en tarjetas, recortados a dos líneas.
- **Body** (400, 1rem, 1.5): descripciones y textos; máximo unos 65ch.
- **Label** (500–600, 0.875rem): chips, botones pequeños, breadcrumbs, footer.

### Named Rules

**The El Precio Manda Rule.** En el detalle, el precio (2rem, 700) pesa más que el título del producto (máx. 2rem, 600). El comprador decide con el precio.

**The Sin Mayúsculas Rule.** Todo el texto va en tipo oración. No hay etiquetas en mayúsculas ni tracking abierto en labels.

## Layout

- **Contenedor:** ancho máximo 80rem centrado; margen lateral de 16px en mobile y 32px desde 768px.
- **Grilla de productos:** 2 columnas en mobile, 3 desde 768px y 4 desde 1024px, con celdas de ancho mínimo 0 para que los títulos largos no la rompan.
- **Ritmo:** escala de espaciado de 4px. Los grupos relacionados van juntos (8–12px) y los bloques distintos se separan (24–48px).
- **Catálogo:** título con conteo a la derecha; luego búsqueda y orden, y debajo las categorías, justo encima de la grilla que filtran. En mobile, búsqueda y orden van en dos filas, porque en una sola se cortaría "Precio: menor a mayor". Desde 640px van lado a lado, con la búsqueda limitada a 28rem para que no se estire en pantallas anchas.
- **Detalle:** foto y datos en dos columnas desde 768px. En mobile, el botón de compra ocupa todo el ancho y se fija abajo si al cargar quedaría fuera de la pantalla; al hacer scroll vuelve a su lugar. Respeta la zona segura de los iPhone.
- **Header y footer:** header sticky de 64px; footer al pie aun en páginas cortas.

## Elevation & Depth

El sistema es **plano por defecto**. La profundidad se construye con capas tonales: la lavanda detrás de las fotos, la superficie suave del footer y el morado de la franja. No hay tarjetas con sombra ni paneles elevados.

### Shadow Vocabulary

- **Flotante** (`box-shadow: 0 1px 2px rgb(29 27 34 / 0.06)`, token `--shadow-sm`): solo para un control que flota sobre una foto (el agregado rápido de la tarjeta), para separarlo de fotos claras.

### Named Rules

**The Plano Por Defecto Rule.** Una superficie nueva no lleva sombra. Si algo necesita separarse, primero se prueba con tono (lavanda, superficie suave) o con un borde.

## Shapes

Esquinas suaves que crecen con el tamaño del elemento: 6px (`sm`) en controles (botones, campos) y en las miniaturas del carrito, 12px (`md`) en las fotos del catálogo y del detalle, y píldora en chips, contadores y botones circulares. Los bordes son de 1px y aparecen solo donde marcan un control (campos, chips, botón secundario) o separan filas (líneas del carrito); las tarjetas de producto no tienen borde.

## Components

### Buttons

Firmes y amables: color sólido, esquinas suaves y un objetivo táctil de 44px como mínimo.

- **Shape:** esquinas suaves (6px).
- **Primary:** fondo chicha morada, texto blanco, semibold. Es la acción principal de cada pantalla ("Agregar al carrito", "Seguir comprando").
- **Highlight:** maracuyá con texto casi negro. Solo para confirmar que algo pasó ("Agregado").
- **Secondary / Ghost:** secundario con borde fuerte que se tiñe de morado en hover; fantasma sin fondo, para acciones de menor peso ("Vaciar carrito").
- **Hover / Focus:** transición de color de 120ms. El foco es un anillo de 2px con separación del fondo; en el header, anillo maracuyá.

### Icon Buttons

- **Floating:** círculo blanco con sombra flotante sobre la foto de la tarjeta; en hover pasa a morado. Al agregar, cambia a highlight (maracuyá) por un momento.
- El ícono puede ser más pequeño (18px) sin reducir el objetivo táctil de 44px.

### Chips

- **Style:** píldora de 40px de alto, borde fuerte, texto medium de 14px.
- **State:** la categoría activa es un chip relleno de chicha morada. En mobile la fila se desplaza en horizontal.

### Cards / Containers

- **Corner Style:** la foto lleva 12px; la tarjeta no tiene caja propia.
- **Background:** lavanda de vitrina detrás de la foto, con la imagen centrada y sin recorte (`contain`) dentro de un margen interno de 16px.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** ninguno.
- **Interacción:** todo el cuadro es el enlace (enlace estirado). En hover la foto hace un zoom leve (1.04) que se desactiva con movimiento reducido. El agregado rápido va en la esquina superior derecha de la foto.

### Inputs / Fields

- **Style:** fondo superficie, borde fuerte de 1px, esquinas de 6px, 44px de alto.
- **Focus:** el borde se vuelve del color de foco y aparece el anillo de foco.
- **Error / Disabled:** borde de peligro con mensaje debajo; deshabilitado con opacidad reducida.

### Navigation

- **Header:** franja de marca con el logo (baldosa maracuyá con la D morada) y el wordmark "Delosi Store", con "Store" en peso regular y tono suave. A la derecha, el carrito con su contador maracuyá sobre el ícono, que nunca mueve el layout.
- **Footer:** franja de superficie suave con el mismo logo y la nota de proyecto demo. Sin enlaces inventados.
- **Breadcrumbs:** texto de 14px; en mobile se oculta visualmente la página actual (ya es el h1).

## Do's and Don'ts

### Do:

- **Do** crear toda variante visual nueva en `@delosi/ui`, con su story, antes de usarla en la app.
- **Do** usar solo tokens: ningún color, espacio o sombra escrito a mano.
- **Do** poner cada foto de producto sobre lavanda de vitrina, con la esquina que corresponde a su tamaño (12px en tarjetas y detalle, 6px en miniaturas).
- **Do** reservar el maracuyá para el contador del carrito y las confirmaciones.
- **Do** mantener objetivos táctiles de 44px y el anillo de foco visible en los dos temas.
- **Do** verificar CLS 0: los contadores y estados cambian encima del layout, nunca lo empujan.

### Don't:

- **Don't** usar el morado como fondo fuera del header.
- **Don't** agregar sombras a tarjetas o paneles.
- **Don't** poner bordes o cajas alrededor de las tarjetas de producto.
- **Don't** usar etiquetas en mayúsculas, un segundo tipo de letra ni texto sobre maracuyá en blanco.
- **Don't** inventar contenido de confianza (reseñas, promociones, stock, logos de clientes).
- **Don't** sobreescribir estilos del Design System desde la app.
