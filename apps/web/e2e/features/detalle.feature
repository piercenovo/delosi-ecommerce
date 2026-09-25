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

  Escenario: Un enlace mal escrito responde 404
    Cuando abro la página "/products/abc"
    Entonces la respuesta tiene el estado 404
    Y veo el mensaje "No encontramos esta página"

  Escenario: Un producto que no existe no se indexa
    Cuando abro la página "/products/999"
    Entonces veo el mensaje "No encontramos esta página"
    Y la página pide no ser indexada
