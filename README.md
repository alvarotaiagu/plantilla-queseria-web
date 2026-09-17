# Queixería Bardanca — plantilla de web para quesería artesanal

> **Sitio de demostración. Queixería Bardanca es un obrador ficticio**: el
> nombre, la dirección, los teléfonos, los quesos, los precios, los mercados y
> las notas del cuaderno son de muestra y no corresponden a ninguna quesería
> real. **No se atribuye ninguna denominación de origen ni ningún premio**, y
> no se inventa ningún número de registro sanitario. La web lleva
> `noindex, nofollow` a propósito.

Demo: **https://alvarotaiagu.github.io/plantilla-queseria-web/**

Web estática de una sola página (más aviso legal, privacidad y 404). Sin
framework, sin build, sin backend y sin npm: se abre con doble clic. GSAP,
ScrollTrigger y Lenis entran por CDN; si el CDN cae, la página se lee entera.

---

## El concepto: «Corteza»

Una quesería no vende un producto: vende **tiempo**. Y el tiempo está escrito
en la corteza — el color, el moho, el grosor, los cristales de la pasta. La
página entera cuelga de ahí:

- La pieza central es un **selector de curación** (20, 90, 180 y 400 días). Al
  cambiarlo, **la rueda dibujada cambia de verdad**: corteza, pasta, moho,
  tamaño de los ojos y cristales son variables CSS que conmuta la clase
  `.cura--n`, y con ellas cambian también el nombre, la cata, el maridaje, el
  peso y el precio. El queso viejo pesa menos y cuesta más, y eso se explica.
- En el **hero** hay otra rueda, vista desde arriba, a la que se le separa la
  cuña al entrar: el gesto de cortar.
- La sección **«La leche»** cuenta por qué el queso de invierno solo se hace en
  invierno, con un gráfico de dos curvas (grasa y hierba) que se dibujan solas.
- La **tienda** dice si está abierta ahora y marca la fila de hoy en el horario.

---

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | Cabecera | Fija, se «posa» al bajar. Menú móvil a pantalla completa con `aria-expanded`. |
| 01 | Hero | Rueda SVG a la que se separa la cuña, titular char-reveal y tres cifras. |
| — | Cinta | Marquee infinito con la velocidad ligada a la del scroll. |
| 02 | La corteza | **Selector de cura** que transforma la rueda dibujada y toda su ficha. |
| 03 | Los quesos | Cuatro piezas con leche, cura, peso, cuajo, corteza y precio. |
| 04 | La leche | Estacionalidad, con el gráfico de grasa y hierba dibujándose. |
| 05 | La cava | Temperatura, humedad, piezas y volteos, con contadores. |
| 06 | Dónde comprar | Tienda con estado en vivo, tres mercados y condiciones de envío. |
| 07 | Visitas | Día, duración, precio, grupo y normas, más dos notas del cuaderno. |
| 08 | Contacto | Datos, aviso de registro sanitario y mapa **solo bajo clic**. |
| — | Pie | Sello de demostración, horario, legal y créditos. |

---

## Qué hay que tocar para reskinearlo a un cliente real

1. **Datos del obrador**: el bloque `application/ld+json` del `<head>`
   (schema.org `FoodEstablishment`), la sección `#contacto` y el `<footer>`.
   Quitar el sello de demostración y **quitar
   `<meta name="robots" content="noindex, nofollow">`**. El schema **no lleva
   `aggregateRating`** y no debe llevarlo sin valoraciones reales.
2. **Registro sanitario y denominaciones**: añadir el número de registro real
   en `aviso-legal.html` y en el pie. Si el cliente pertenece a una DOP o IGP,
   ponerlo **solo si es cierto y comprobable**.
3. **Los estados de cura**: el array `CURAS` de `js/main.js` (nombre, corteza,
   pasta, cata, maridaje, precio, peso y pie) y los colores de cada estado, que
   están en el bloque `.cura--0…3` de `css/estilo.css`. Para añadir un quinto
   estado basta con un `<button class="cura__paso">` más, un objeto en `CURAS`
   y su bloque de color (y cambiar el `width` del riel, que es `100 / n %`).
4. **Horario**: el array `HORARIO` de `js/main.js` (minutos desde medianoche,
   domingo = índice 0) y la tabla `#horarioCuerpo`. De ahí salen el «abierto
   ahora» y la fila resaltada.
5. **Los quesos y los mercados**: `<article class="queso">` y los `<li>` de
   `.mercados__lista`. Se añaden o quitan sin tocar el JS.
6. **El gráfico de la leche**: las dos `<path class="grafico__linea">` del SVG.
   Doce puntos cada una, de enero a diciembre; el eje ya está dibujado.
7. **Paleta y tipografía**: todo en `:root` de `css/estilo.css` (`--fondo`,
   `--crema`, `--panel`, `--tinta`, `--paja`, `--musgo`, `--cera`) y el
   `<link>` de Google Fonts.
8. **Fotos**: `assets/fotos/`, dos anchos por foto (`-800` y `-1600`) y nombres
   semánticos. Se sustituye el archivo manteniendo el nombre y se actualiza el
   `alt`.
9. **Mapa**: en `js/main.js`, la consulta del `iframe`. **No quitar el botón**:
   el mapa solo debe cargarse bajo clic.

---

## Comportamiento degradado y rendimiento

- **Sin GSAP** (CDN caído o JS bloqueado) la página se ve entera. Comprobado
  abortando el CDN: `has-motion:false`, titular a opacidad 1, la cuña del hero
  separada igual, el selector de cura **funcionando**, el gráfico dibujado y
  los contadores con su cifra final.
- **`prefers-reduced-motion: reduce`**: se apaga el movimiento, no el
  contenido. Comprobado pulsando «180 días» en esa pasada: el nombre, la ficha
  y el precio cambian igual.
- La cuña del hero y las curvas del gráfico se mueven con **una clase y una
  transición CSS**, nunca con un tween de GSAP: en un `<g>` de SVG, GSAP
  escribe el `transform` en el atributo y cualquier `transform` del CSS se lo
  come.
- Apariciones y máscaras: **transición CSS + clase** que pone un
  `IntersectionObserver` (un `ScrollTrigger` con `once:true` puede no disparar
  si el elemento ya está en pantalla al crearse).
- **Tareas largas medidas** con `PerformanceObserver` (`longtask`): en la
  verificación local, **una sola tarea larga de 79 ms** durante la carga
  (GSAP + webfonts), ninguna después. Queda en `window.__tareasLargas` y se
  imprime en consola a los 10 s.
- Accesibilidad: contraste AA, foco visible, saltar al contenido, el selector
  de cura es un `role="tablist"` manejable con flechas, tablas con
  `<th scope>`, `alt` con sentido y los titulares partidos conservan su
  `aria-label`.
- **Capturas**: `screenshots/` trae el recorrido completo en escritorio y en
  móvil, más las pasadas sin GSAP y con movimiento reducido, en JPEG para que
  el repositorio no engorde.

---

## Créditos

- Fotografías: Pexels, licencia libre, acreditadas en
  [`CREDITOS.md`](CREDITOS.md). Ninguna es del obrador descrito.
- Ruedas de queso, gráfico, logotipo, dibujo del mapa y `og:image`: hechos para
  esta plantilla.
- Tipografías: [Petrona](https://fonts.google.com/specimen/Petrona) y
  [Figtree](https://fonts.google.com/specimen/Figtree) (OFL).
- Movimiento: [GSAP](https://gsap.com) + ScrollTrigger y
  [Lenis](https://github.com/darkroomengineering/lenis), por CDN.

## Decisiones tomadas

- **Nombre comprobado antes de fijarlo**: no aparece ninguna quesería llamada
  «Bardanca». Se evitó cualquier nombre parecido a los obradores reales de la
  zona.
- **Ni DOP ni premios ni registro sanitario inventados.** Son datos que
  concede un organismo y que se pueden comprobar; falsearlos en una demo que se
  enseña a clientes sería enseñar a mentir.
- **Sin tienda en línea.** Un obrador que hace cuarenta piezas al día no puede
  sostener un carrito; el texto lo dice con esas palabras. Los envíos se
  explican y se encargan por teléfono.
- **La estacionalidad como argumento, no como adorno**: el queso de invierno
  solo existe en invierno, y el gráfico está para explicarlo, con una nota que
  avisa de que las curvas son de muestra y no datos medidos.
- **El precio sube cuando el peso baja**, y se explica en la propia ficha: es
  la duda que tiene cualquiera delante de un mostrador.
