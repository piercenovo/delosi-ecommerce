# language: es
Característica: Resiliencia ante fallas de la API
  Como persona que compra
  quiero entender qué pasa cuando la tienda no puede cargar datos
  para poder reintentar o seguir navegando

  Antecedentes:
    Dado que la API de productos no responde

  Escenario: El catálogo muestra un error recuperable
    Cuando abro el catálogo
    Entonces veo el mensaje "No pudimos cargar los productos"
    Y puedo "Intentar de nuevo"
    Y puedo ir a "Ir al catálogo"

  Escenario: Los productos ya publicados se siguen viendo
    Cuando abro la página "/products/5"
    Entonces el título de la página es "John Hardy Women's Legends Naga Gold & Silver Dragon Station Chain Bracelet"
