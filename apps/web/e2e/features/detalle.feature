# language: es
Característica: Detalle de producto
  Como persona que compra
  quiero ver toda la información de un producto
  y que se vea bien al compartirlo o en buscadores

  @smoke
  Escenario: Ver el detalle desde el catálogo
    Dado que abro el catálogo
    Cuando abro el producto "Mens Cotton Jacket"
    Entonces el título de la página es "Mens Cotton Jacket"
    Y la ruta de navegación muestra "Catálogo" y "Ropa de hombre"

  @transiciones
  Escenario: La foto del producto viaja de la tarjeta al detalle
    Dado que abro el catálogo
    Cuando abro el producto "Mens Cotton Jacket"
    Entonces la foto del producto viaja de la tarjeta al detalle

  @transiciones
  Escenario: Sin animación para quien prefiere reducir el movimiento
    Dado que prefiero reducir el movimiento
    Y que abro el catálogo
    Cuando abro el producto "Mens Cotton Jacket"
    Entonces la página cambia sin animar la foto

  Escenario: Metadatos para buscadores y redes sociales
    Cuando abro la página "/products/5"
    Entonces el título del documento empieza con "John Hardy Women's Legends Naga"
    Y la URL canónica termina en "/products/5"
    Y la imagen para compartir es "/images/products/5.png"

  Escenario: Datos estructurados del producto
    Cuando abro la página "/products/5"
    Entonces los datos estructurados describen un "Product" con precio "695.00" en "USD"
    Y los datos estructurados incluyen la ruta de navegación

  Escenario: Productos relacionados de la misma categoría
    Cuando abro la página "/products/5"
    Entonces veo 3 productos relacionados

  Esquema del escenario: Un enlace mal escrito responde 404
    Cuando abro la página "/products/<id>"
    Entonces la respuesta tiene el estado 404
    Y veo el mensaje "No encontramos esta página"

    Ejemplos:
      | id  |
      | abc |
      | 0   |
      | 05  |

  Escenario: Un producto que no existe responde 404 y no se indexa
    Cuando abro la página "/products/999"
    Entonces la respuesta tiene el estado 404
    Y veo el mensaje "No encontramos esta página"
    Y la página pide no ser indexada
