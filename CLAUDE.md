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

App jugable de punta a punta **en modo demo** (sin backend real): sistema
de amigos, incubación cooperativa, eclosión, cuidado, crecimiento por
etapas, 2 minijuegos completos + 4 más listados como "próximamente", tienda,
racha/tareas diarias/cofre, álbum de especies, tarjeta compartible. El
backend real sobre Supabase (esquema SQL + `SupabaseRepository`) está
escrito pero **sin probar contra un proyecto real** — ver README.

## Stack

- **React 19 + TypeScript + Vite**, **Tailwind CSS v4** (`@tailwindcss/vite`,
  configuración CSS-first en `src/index.css` con `@theme`).
- **Framer Motion** para animaciones (respiración, parpadeo, rebote, huevo).
- **vite-plugin-pwa** para instalabilidad y caché offline del shell.
- **react-router-dom** para las rutas (con lazy-loading por ruta, ver `App.tsx`).
- **@tanstack/react-query** para el estado async (nidos, amigos, racha…),
  con `refetchInterval` para simular actualizaciones en tiempo real.
- **i18next / react-i18next** — textos en español por defecto
  (`src/i18n/locales/es.json`), inglés preparado (`en.json`).
- **@supabase/supabase-js** — cliente para el backend real (Auth, Postgres,
  Realtime, RLS, Edge Functions). Solo se incluye en el bundle si hay
  variables de entorno configuradas (tree-shaken si no).
- **Vitest** + Testing Library para tests.
- Despliegue previsto en **Cloudflare Pages**.

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
  visibles en JSX (excepción tolerada: textos largos de las pantallas
  legales/perfil, pendientes de pasar a i18n cuando se traduzcan de verdad).
- **Alias `@/`** apunta a `src/` (configurado en `vite.config.ts` y
  `tsconfig.app.json`).
- **El tiempo lo manda el servidor:** el estado de la mascota (necesidades,
  etapa de crecimiento) nunca se guarda como valor fijo; se recalcula en
  cada lectura a partir de marcas de tiempo (`needsUpdatedAt`, `bornAt`) y
  de funciones puras en `src/lib/game/logic.ts` (`decayNeeds`,
  `computeGrowthStage`, …). Así el progreso offline funciona sin trucos de
  reloj. Esas funciones están completamente testeadas y son las mismas que
  usarían un backend real o el modo demo.
- **Capa de datos backend-agnóstica (`src/lib/db/`):** toda la UI habla con
  la interfaz `GameRepository` (`repository.ts`), nunca directamente con
  Supabase ni con `localStorage`. Hay dos implementaciones:
  - `DemoRepository` — localStorage, con dos usuarios simulados ya amigos
    (ver seed en `demoRepository.ts`). Es el backend por defecto.
  - `SupabaseRepository` — sobre el esquema de `supabase/migrations/`.
    Se activa sola si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están
    definidas (`src/lib/db/index.ts` decide cuál usar).
  - La eclosión (aleatoriedad de especie + límite diario) se resuelve en
    servidor: en demo, dentro de `DemoRepository`; en producción, en la
    Edge Function `supabase/functions/warm-egg`, nunca en el cliente.
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
- **Rutas con lazy-loading:** todas las páginas salvo Hogar y Onboarding se
  cargan con `React.lazy` (ver `App.tsx`) para mantener el bundle inicial
  pequeño.
- **Commits por fase:** cada fase termina con un commit propio y un resumen
  corto de lo hecho en el mensaje.
- No añadir dependencias de pago ni servicios de terceros sin dejarlo
  explícito en `README.md` (el proyecto está optimizado para coste cero).

## Estructura

```
src/
  config/gameConfig.ts       # balance y feature flags (fuente única de verdad)
  i18n/                      # i18next + locales es/en
  lib/
    game/
      types.ts                # tipos de dominio (User, Nest, Egg, Pet, ...)
      logic.ts                 # lógica pura: decaimiento, crecimiento, eclosión, rachas
    db/
      repository.ts            # interfaz GameRepository (contrato backend-agnóstico)
      demoRepository.ts         # backend local (localStorage) con seed de 2 usuarios
      supabaseRepository.ts      # backend real sobre Supabase (sin probar)
      supabaseClient.ts           # cliente de supabase-js si hay credenciales
      index.ts                     # decide qué repositorio usar
  app/
    SessionContext.tsx          # usuario actual + selector de usuario demo
    hooks.ts                     # hooks de react-query sobre el repositorio
    AppShell.tsx                  # layout: nav inferior, racha, moneda
  game/pets/
    rig/                        # sistema de dibujo compartido (tipos, proporciones, piezas)
    species/                     # config visual de cada una de las 10 especies
    Egg.tsx                       # huevo + animación de eclosión
  components/                    # componentes de UI reutilizables
  pages/                          # una por pantalla (Hogar, Amigos, Minijuegos, Tienda, Perfil, ...)
docs/pet-bible.md                 # biblia de especies (referencia de diseño)
supabase/
  migrations/0001_initial_schema.sql   # esquema + RLS
  functions/warm-egg/                    # Edge Function: resuelve la eclosión en servidor
```

## Próximos pasos

Ver la sección "Qué falta por hacer" del `README.md`.
