# CLAUDE.md

Guía para trabajar en este repo (Nidito). Se mantiene al día en cada fase.

## Qué es esto

**Nidito** (nombre provisional, ver `src/config/gameConfig.ts` → `APP_NAME`)
es una PWA de mascota virtual cooperativa: dos personas (pareja o amigos)
cuidan juntas una misma mascota que nace de un huevo compartido, crece por
etapas y se cuida con minijuegos y acciones diarias.

Prioridades del proyecto, en este orden: (1) sistema de amigos y cuidado
compartido, (2) calidad visual y ternura de las mascotas, (3) ganchos de
retención.

## Estado actual

- ✅ **Fase 0 — Diseño de mascotas.** Sistema de rig SVG compartido, 10
  especies × 4 etapas, expresiones, huevo/eclosión, hoja de personajes en
  `/design`. Ver `docs/pet-bible.md`.
- ⏳ Resto de fases (backend Supabase, sistema de amigos, bucle de juego,
  minijuegos, retención, PWA final) — pendientes.

## Stack

- **React 19 + TypeScript + Vite**, **Tailwind CSS v4** (`@tailwindcss/vite`,
  configuración CSS-first en `src/index.css` con `@theme`).
- **Framer Motion** para animaciones (respiración, parpadeo, rebote, huevo).
- **vite-plugin-pwa** para instalabilidad y caché offline del shell.
- **react-router-dom** para las rutas.
- **i18next / react-i18next** — textos en español por defecto
  (`src/i18n/locales/es.json`), inglés preparado (`en.json`).
- **Vitest** + Testing Library para tests.
- Pendiente de fases futuras: **Supabase** (Auth, Postgres, Realtime, RLS,
  Edge Functions) y despliegue en **Cloudflare Pages**.

## Comandos

```bash
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build       # typecheck (tsc -b) + build de producción
npm run preview     # sirve el build de producción localmente
npm run lint         # oxlint
npm run test         # vitest
```

## Convenciones

- **Todo el balance del juego vive en `src/config/gameConfig.ts`**: tiempos,
  probabilidades, costes, feature flags. Nunca se hardcodean estos valores
  en componentes o lógica — si hay que ajustar el juego, se ajusta ahí.
- **Textos del juego en español** vía `useTranslation()` / `t('clave')`,
  con las claves reflejadas en `es.json` y `en.json`. No hardcodear strings
  visibles en JSX.
- **Alias `@/`** apunta a `src/` (configurado en `vite.config.ts` y
  `tsconfig.app.json`).
- **Sistema de mascotas (`src/game/pets/`):**
  - `rig/` — el "esqueleto" compartido: tipos, proporciones por etapa,
    expresiones y las piezas SVG reutilizables (`rig/parts/`). Esto es lo
    que hace escalable tener 10 especies × 4 etapas sin dibujar 40 assets
    a mano.
  - `species/` — la config visual (silueta + paleta) de cada especie.
    Añadir una especie nueva = añadir una entrada en `SPECIES_VISUALS` +
    su metadata en `gameConfig.ts` (`SPECIES_LIST`), no tocar el rig.
  - `PetRenderer` compone las piezas; está pensado para poder sustituirse
    en el futuro por imágenes PNG/WebP o animaciones Lottie/Rive sin tocar
    la lógica de juego que lo consume (solo cambiaría este componente).
- **Commits por fase:** cada fase termina con un commit propio y un resumen
  corto de lo hecho en el mensaje.
- No añadir dependencias de pago ni servicios de terceros sin dejarlo
  explícito en `README.md` (el proyecto está optimizado para coste cero).

## Estructura

```
src/
  config/gameConfig.ts     # balance y feature flags (fuente única de verdad)
  i18n/                    # i18next + locales es/en
  game/pets/
    rig/                   # sistema de dibujo compartido (tipos, proporciones, piezas)
    species/                # config visual de cada una de las 10 especies
    Egg.tsx                 # huevo + animación de eclosión
  components/               # componentes de UI reutilizables
  pages/DesignPage.tsx       # hoja de personajes (/design)
docs/pet-bible.md            # biblia de especies (referencia de diseño)
```

## Próximos pasos (tras aprobar la Fase 0)

1. Autenticación y perfiles (Supabase Auth, magic link + Google).
2. Sistema de amigos, nidos y huevo compartido (incubación cooperativa).
3. Bucle de juego (necesidades, crecimiento, cuidado compartido en tiempo real).
