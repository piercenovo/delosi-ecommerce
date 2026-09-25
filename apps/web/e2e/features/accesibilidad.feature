# language: es
Característica: Accesibilidad
  Como persona que navega con teclado o lector de pantalla
  quiero poder usar toda la tienda
  para comprar sin barreras

  Esquema del escenario: La página "<página>" cumple WCAG 2.2 AA
    Cuando abro la página "<ruta>"
    Entonces no hay violaciones de accesibilidad

    Ejemplos:
      | página             | ruta                      |
      | catálogo           | /products                 |
      | catálogo filtrado  | /products?category=jewelery |
      | detalle            | /products/5               |
      | carrito vacío      | /cart                     |
      | no encontrada      | /products/abc             |

  Escenario: El carrito con productos cumple WCAG 2.2 AA
    Dado que tengo "Mens Cotton Jacket" en el carrito
    Cuando abro el carrito
    Entonces no hay violaciones de accesibilidad

  @teclado
  Escenario: Saltar al contenido es lo primero al usar Tab
    Dado que abro el catálogo
    Cuando presiono Tab
    Entonces el foco está en "Saltar al contenido"

  @teclado
  Escenario: Agregar al carrito solo con el teclado
    Dado que abro la página "/products/3"
    Cuando llego con Tab a "Agregar al carrito" y presiono Enter
    Entonces el carrito tiene 1 producto
