# Nidito 🥚

Una PWA de mascota virtual para parejas y amigos: entre dos, incubáis un
huevo, cuidáis juntos a la criatura que sale de él y la veis crecer por
etapas. Pensado para sesiones cortas (~15 minutos por la mañana y por la
tarde), móvil primero.

> El nombre "Nidito" es provisional — puede cambiarse en un único sitio:
> `APP_NAME` en `src/config/gameConfig.ts`.

## Estado del proyecto

La app funciona de principio a fin **en modo demo** (sin necesitar cuentas
ni Supabase): invitar, incubar, eclosionar, cuidar y evolucionar a la
mascota, minijuegos, tienda, racha y tareas diarias, álbum de especies y
tarjeta compartible. El backend real sobre Supabase está **preparado pero
sin probar contra un proyecto real** (no había credenciales en este
entorno) — ver "Qué falta por hacer" más abajo.

Visita `/design` para ver la hoja de personajes completa: las 10 especies
en sus 4 etapas, expresiones, el huevo y su eclosión, y la paleta. El
detalle de cada especie está en [`docs/pet-bible.md`](./docs/pet-bible.md),
y las decisiones de arquitectura en [`CLAUDE.md`](./CLAUDE.md).

## Requisitos

- Node.js 20 o superior
- npm

## Instalación y arranque

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/` — arranca directamente en **modo demo**, con
dos usuarios simulados ("Tú" y "Alex") ya conectados como amigos y un huevo
a medio incubar. Puedes alternar entre los dos desde la pastilla morada de
arriba para probar tú solo/a todo el flujo cooperativo (incubar entre los
dos, cuidar por turnos, etc.), sin necesitar otra persona.

Para verla desde el móvil, en la misma red que tu ordenador:

```bash
npm run dev -- --host
```

## Variables de entorno

**No hace falta configurar nada para probar la app**: sin un archivo `.env`,
arranca automáticamente en modo demo (ver arriba). Cuando quieras conectarla
a datos reales, sigue la guía de abajo.

## Desplegar con Supabase y Cloudflare Pages

Guía pensada para alguien sin experiencia técnica previa con estas
herramientas. Son dos servicios con plan gratuito suficiente para empezar.

### 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
   (puedes usar tu cuenta de GitHub o Google).
2. Pulsa **New project**. Elige un nombre (p. ej. "nidito"), una
   contraseña para la base de datos (guárdala en un gestor de contraseñas)
   y la región más cercana a vosotros. Pulsa **Create new project** y
   espera un par de minutos a que se cree.
3. En el menú de la izquierda, ve a **SQL Editor** → **New query**. Abre el
   archivo [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql)
   de este repositorio, copia todo su contenido, pégalo en el editor y
   pulsa **Run**. Esto crea todas las tablas y las reglas de seguridad
   (nadie puede ver datos de otras personas).
4. Ve a **Project Settings** (el icono de engranaje) → **API**. Ahí
   encontrarás dos valores que necesitas:
   - **Project URL** → es tu `VITE_SUPABASE_URL`.
   - **anon public** (en "Project API keys") → es tu `VITE_SUPABASE_ANON_KEY`.
     Esta clave es segura para usarse en el navegador: no da acceso a nada
     que las reglas de seguridad (RLS) no permitan explícitamente.
5. Activa el inicio de sesión: **Authentication** → **Providers**. Activa
   **Email** (para el enlace mágico) y, si quieres permitir entrar con
   Google, activa **Google** y sigue sus instrucciones para crear las
   credenciales OAuth en Google Cloud Console.
6. (Opcional, para la eclosión segura en producción) despliega la Edge
   Function incluida:
   ```bash
   npx supabase login
   npx supabase link --project-ref <tu-project-ref>
   npx supabase functions deploy warm-egg
   ```
   El `<tu-project-ref>` está en la URL del proyecto o en Project Settings.

### 2. Configurar la app con esas claves

1. En la raíz del proyecto, copia `.env.example` a `.env`.
2. Rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores
   del paso anterior.
3. Reinicia `npm run dev`: la app detecta las variables automáticamente y
   deja de usar el modo demo.

### 3. Desplegar en Cloudflare Pages (gratis)

1. Sube este repositorio a GitHub (o GitLab) si no lo está ya.
2. Ve a [pages.cloudflare.com](https://pages.cloudflare.com) y crea una
   cuenta gratuita.
3. **Create a project** → **Connect to Git** → elige este repositorio.
4. En la configuración de build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. En **Environment variables**, añade `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con los mismos valores que en tu `.env`.
6. Pulsa **Save and Deploy**. En un par de minutos tendrás una URL pública
   (`algo.pages.dev`) sirviendo la app. Cada vez que subas cambios a la
   rama principal, Cloudflare la volverá a desplegar sola.
7. (Opcional) en **Custom domains** puedes apuntar tu propio dominio.

El plan gratuito de Cloudflare Pages permite uso comercial sin coste.

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Comprueba los tipos y genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run test` | Ejecuta los tests (Vitest) |
| `npm run lint` | Linter (oxlint) |

## Qué falta por hacer

Ver el resumen completo al final de la conversación / historial de commits,
pero en corto:

- **Cobertura de i18n incompleta** — la Fase 0 (`/design`) usa `useTranslation()`
  para todo. Las pantallas posteriores (Hogar, Amigos, Tienda, Minijuegos,
  Perfil, Onboarding) están en español directamente en el JSX, sin pasar
  por `i18next`, para priorizar tiempo en la mecánica de juego. Antes de
  añadir inglés de verdad hay que extraer esos textos a `es.json`/`en.json`.
- **Probar `SupabaseRepository` contra un proyecto real** — está escrita
  contra el esquema de `supabase/migrations/`, pero nunca se ha ejecutado
  (no había credenciales en este entorno). Antes de usarla en producción,
  sigue la guía de arriba y ejercítala con el mismo flujo que el modo demo.
- **Notificaciones Web Push** — la configuración (máx. 2/día, horario
  silencioso) está en `gameConfig.ts`, pero falta el service worker que las
  dispare y el permiso al usuario.
- **4 minijuegos** (`rhythm-jump`, `star-fishing`, `async-record`,
  `scratch-card`) están definidos en `gameConfig.ts` y aparecen como
  "Próximamente" en la pantalla de minijuegos; solo "Atrapa la comida" y
  "Memoria de parejas" están implementados.
- **Eventos de temporada** — el feature flag existe (`seasonalEvents`) pero
  no hay contenido de temporada todavía.
- **Lighthouse** no se ha podido ejecutar en este entorno (sin navegador
  con acceso a métricas); antes de publicar, corre `npm run build && npm run preview`
  y audítalo con Chrome DevTools.

## Estructura del proyecto

Ver la sección "Estructura" de [`CLAUDE.md`](./CLAUDE.md).

## Licencia

Sin decidir todavía.
