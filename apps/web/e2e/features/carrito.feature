# language: es
Característica: Carrito de compras
  Como persona que compra
  quiero agregar productos y revisar mi carrito
  para saber qué voy a comprar y cuánto cuesta

  @smoke
  Escenario: Agregar desde el detalle actualiza el contador
    Dado que abro la página "/products/3"
    Cuando agrego el producto al carrito
    Entonces el carrito tiene 1 producto

  Escenario: Agregar dos veces suma la cantidad
    Dado que abro la página "/products/3"
    Cuando agrego el producto al carrito
    Y agrego el producto al carrito
    Entonces el carrito tiene 2 productos
    Y veo "Ya tienes 2 en tu carrito"

  Escenario: El carrito se conserva al recargar
    Dado que abro la página "/products/3"
    Y agrego el producto al carrito
    Cuando recargo la página
    Entonces el carrito tiene 1 producto

  Escenario: Agregar desde el catálogo sin salir de él
    Dado que abro el catálogo
    Cuando agrego "Mens Cotton Jacket" desde su tarjeta
    Entonces el carrito tiene 1 producto
    Y la dirección incluye "/products"
    Y el título de la página es "Catálogo"

  Escenario: Cambiar la cantidad actualiza el subtotal
    Dado que tengo "Mens Cotton Jacket" en el carrito
    Cuando abro el carrito
    Y aumento la cantidad de "Mens Cotton Jacket"
    Entonces el subtotal es "USD 111.98"
    Y el carrito tiene 2 productos

  Escenario: Eliminar productos y vaciar el carrito
    Dado que tengo "Mens Cotton Jacket" en el carrito
    Y que tengo "Mens Casual Slim Fit" en el carrito
    Cuando abro el carrito
    Y elimino "Mens Cotton Jacket"
    Entonces el carrito tiene 1 producto
    Cuando vacío el carrito
    Entonces veo el mensaje "Tu carrito está vacío"
