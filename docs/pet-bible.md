# Pet Bible — Nidito

Biblia visual de las 10 especies del juego. Es la referencia para cualquiera
que dibuje, anime o revise una mascota: qué la hace reconocible, su paleta y
cómo debe leerse en cada una de las 4 etapas de crecimiento.

Todas las especies comparten el mismo **rig** (ver `src/game/pets/rig/`):
cabeza grande + cuerpo redondeado + orejas/cola/accesorios intercambiables.
Lo que hace única a cada especie es su combinación de silueta (tipo de
orejas, cola, accesorios de cabeza) y su paleta pastel propia de 3-4 tonos,
nunca contorno negro puro (siempre un tono más oscuro del mismo color).

Las 4 etapas siguen siempre la misma lógica de proporciones
(`src/game/pets/rig/proportions.ts`):

- **Bebé:** cabeza enorme (≈70 % del conjunto), sin accesorios, sin apéndices (alitas/aletas). Todo muy redondeado y simplificado.
- **Niño:** primeros rasgos propios visibles (orejas/cola a tamaño reducido), sigue sin accesorios de cabeza.
- **Adolescente:** proporciones ya definidas, accesorios y apéndices visibles.
- **Adulto:** versión completa y más esbelta, con todos los detalles, pero **siempre tierna**.

---

## 1. Gatito Mochi (Común)

Bola de arroz con orejas de gatito. Cuerpo crema muy suave, casi blanco, como
un mochi recién hecho.

- **Orejas:** triangulares, tono cuerpo con interior rosado.
- **Cola:** enroscada, tipo gato.
- **Paleta:** crema `#FFF3E9`, contorno `#D9B99A`, barriga `#FFFDF8`, acento `#FFC9D6`.
- **Bebé → Adulto:** el bebé es casi una bolita sin orejas marcadas; de niño en adelante las orejas triangulares y la colita enroscada quedan fijas.

## 2. Conejo Nube (Común)

Esponjoso, con orejas caídas y cuerpo tipo nube de algodón. Es el más
"blandito" del grupo.

- **Orejas:** caídas, largas, cayendo a los lados de la cara.
- **Cola:** bolita de algodón (tres círculos superpuestos).
- **Paleta:** lila `#F3E9FF`, contorno `#C6A9EA`, barriga blanco puro, acento `#E3C9FF`.

## 3. Pollito Pipo (Común)

Un pollito redondo con un plumón que se riza hacia arriba en la cabeza.

- **Rasgo único:** plumón (tuft) sobre la cabeza + piquito redondo naranja.
- **Cola:** muñón pequeño (apenas una colita de plumas).
- **Paleta:** amarillo `#FFEA9E`, contorno `#E0B94A`, barriga `#FFF6D2`, acento (pico/patas) `#FF9F45`.

## 4. Osito Miel (Común)

Osito clásico, cálido y redondeado, con un tono miel.

- **Orejas:** redondas, tipo Mickey, asomando arriba de la cabeza.
- **Cola:** muñón redondo.
- **Paleta:** miel `#F5C98B`, contorno `#C98C4A`, barriga `#FFEACB`, acento `#A9653A`.

## 5. Zorrito Kiko (Común)

Zorrito naranja con marquitas suaves en las mejillas y una cola grande y
esponjosa.

- **Orejas:** triangulares (como el gato, pero más anaranjadas y grandes).
- **Cola:** abultada/esponjosa, más grande que la del gato.
- **Marca facial:** rayitas suaves bajo los ojos.
- **Paleta:** naranja `#FFB37A`, contorno `#E08A45`, barriga `#FFF3E0`, acento `#E08A45`.

## 6. Panda Bao (Común)

Panda blanco con los característicos parches oscuros (nunca negro puro, un
gris-morado muy oscuro) en orejas y ojos.

- **Orejas:** redondas, coloreadas con el tono de acento oscuro (no el del cuerpo).
- **Marca facial:** parches ovalados detrás de cada ojo (la "máscara" del panda).
- **Paleta:** blanco `#FFFFFF`, contorno gris suave `#D8D3D8`, barriga `#F7F5F7`, acento `#4A4550`.

## 7. Axolotl Bubi (Raro)

Axolotl rosado con branquias en forma de flor a los lados de la cabeza — su
rasgo más icónico y el que lo hace inmediatamente reconocible.

- **Rasgo único:** 3 branquias a cada lado de la cabeza, en forma de pétalo.
- **Sin orejas.**
- **Cola:** aplanada, tipo aleta.
- **Paleta:** rosa `#FFC9DE`, contorno `#E092B3`, barriga `#FFE6F0`, acento (branquias) `#FF8FB8`.

## 8. Erizo Hoja (Raro)

Un erizo cuyas púas se han sustituido por hojitas verdes — más tierno que
puntiagudo.

- **Rasgo único:** hojitas alrededor de la parte trasera de la cabeza en vez de púas.
- **Orejas:** pequeñas, casi ocultas bajo las hojas.
- **Paleta:** tostado `#E3C9A8`, contorno `#B8916A`, barriga `#F5E6D0`, acento (hojas) `#8FC97A`.

## 9. Pingüino Copo (Raro)

Pingüino de espalda azul-marino y barriguita blanca redonda, con piquito y
patitas naranjas.

- **Rasgo único:** aletas laterales en vez de brazos (visibles desde adolescente).
- **Pico:** plano, naranja.
- **Sin orejas ni cola visible.**
- **Paleta:** azul marino `#3E4A6B`, contorno `#2B3450`, barriga blanca, acento (pico/aletas) `#FFB84D`.

## 10. Dragoncito Chispa (Legendario)

El más especial: un dragoncito violeta con cuernitos dorados y alitas
pequeñas — nunca amenazante, siempre con cara de bebé.

- **Rasgo único:** dos cuernitos dorados sobre la cabeza + alitas pequeñas a los lados del cuerpo (desde adolescente).
- **Cola:** con una puntita en forma de pala, dorada.
- **Paleta:** violeta `#C9B8FF`, contorno `#9B84E0`, barriga `#E6DBFF`, acento (cuernos/alas/cola) `#FFD86B`.

---

## Expresiones (aplican a las 10 especies por igual)

| Expresión | Ojos | Boca | Extra |
|---|---|---|---|
| Feliz | abiertos | sonrisa | — |
| Neutral | abiertos | línea recta | — |
| Hambrienta | entornados | ondulada | — |
| Cansada / durmiendo | cerrados (curva) | "o" pequeña | "Z" flotando |
| Triste | entornados | ceño | lagrimita |
| Comiendo | cerrados felices | boca abierta | — |
| Recibiendo cariño | corazones | sonrisa | corazoncitos flotando |
| Jugando | un ojo guiñado | sonrisa abierta | — |
| Celebrando | estrellas | sonrisa abierta | destellos |

## El huevo

Un huevo pastel (color configurable) con hasta 4 etapas de grietas antes de
eclosionar. Al eclosionar, la cáscara se abre en dos mitades que se separan
y desvanecen entre un estallido de chispitas doradas.
