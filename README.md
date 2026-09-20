# Nidito 🥚

Una PWA de mascota virtual para parejas y amigos: entre dos, incubáis un
huevo, cuidáis juntos a la criatura que sale de él y la veis crecer por
etapas. Pensado para sesiones cortas (~15 minutos por la mañana y por la
tarde), móvil primero.

> El nombre "Nidito" es provisional — puede cambiarse en un único sitio:
> `APP_NAME` en `src/config/gameConfig.ts`.

## Estado del proyecto

🚧 **Fase 0 completada: diseño de las mascotas.** El resto de fases
(autenticación, sistema de amigos, bucle de juego, minijuegos, retención,
despliegue) están pendientes de que se apruebe este diseño.

Visita `/design` para ver la hoja de personajes: las 10 especies en sus 4
etapas, expresiones, el huevo y su eclosión, la paleta de color y una
maqueta de la pantalla principal. El detalle de cada especie está en
[`docs/pet-bible.md`](./docs/pet-bible.md), y las decisiones de arquitectura
en [`CLAUDE.md`](./CLAUDE.md).

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y arranque

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/design` en el navegador (o en el móvil, apuntando
a la IP de tu ordenador en la misma red, con `npm run dev -- --host`).

## Variables de entorno

Por ahora **no hace falta configurar nada**: esta fase funciona enteramente
en el navegador, sin backend. Copia `.env.example` a `.env` si quieres
dejarlo preparado, pero puede quedarse vacío.

Cuando se añada el backend con Supabase, esta sección se ampliará con la
guía paso a paso (pensada para quien no ha usado Supabase nunca) para:

1. Crear una cuenta gratuita en [supabase.com](https://supabase.com).
2. Crear un proyecto nuevo y copiar su URL y su clave pública ("anon key").
3. Pegarlas en tu archivo `.env`.
4. Desplegar la app gratis en [Cloudflare Pages](https://pages.cloudflare.com).

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Comprueba los tipos y genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run test` | Ejecuta los tests (Vitest) |
| `npm run lint` | Linter (oxlint) |

## Estructura del proyecto

Ver la sección "Estructura" de [`CLAUDE.md`](./CLAUDE.md).

## Licencia

Sin decidir todavía.
