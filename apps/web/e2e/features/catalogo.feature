# language: es
Característica: Catálogo de productos
  Como persona que compra en Delosi Store
  quiero explorar, filtrar, buscar y ordenar el catálogo
  para encontrar rápido lo que busco

  @smoke
  Escenario: Ver el catálogo completo
    Cuando abro el catálogo
    Entonces veo 20 productos
    Y el título de la página es "Catálogo"

  Escenario: Filtrar por categoría
    Dado que abro el catálogo
    Cuando elijo la categoría "Joyería"
    Entonces veo 4 productos
    Y el título de la página es "Joyería"
    Y la categoría "Joyería" está marcada como actual
    Y la dirección incluye "category=jewelery"

  Escenario: Abrir un enlace compartido con filtros
    Cuando abro la página "/products?category=electronics&sort=price-asc"
    Entonces veo 6 productos
    Y el título de la página es "Electrónica"
    Y los precios están en orden ascendente

  Esquema del escenario: Buscar mientras escribo
    Dado que abro el catálogo
    Cuando busco "<texto>"
    Entonces veo el resultado "<resultado>"
    Y la dirección incluye "q=<texto>"

    Ejemplos:
      | texto    | resultado                      |
      | gold     | 4 productos para «gold»        |
      | backpack | 1 producto para «backpack»     |

  Esquema del escenario: Ordenar por precio
    Dado que abro el catálogo
    Cuando ordeno por "<orden>"
    Entonces los precios están en orden <sentido>

    Ejemplos:
      | orden                 | sentido     |
      | Precio: menor a mayor | ascendente  |
      | Precio: mayor a menor | descendente |

  Escenario: Una búsqueda sin resultados ofrece volver al catálogo
    Dado que abro el catálogo
    Cuando busco "zzzz"
    Entonces veo el mensaje "No encontramos productos"
    Cuando quito los filtros
    Entonces veo 20 productos

  Escenario: Volver atrás conserva el filtro
    Dado que abro el catálogo
    Y elijo la categoría "Joyería"
    Cuando abro el producto "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet"
    Y vuelvo atrás
    Entonces el título de la página es "Joyería"
    Y veo 4 productos
