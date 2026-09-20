-- Nidito · esquema inicial
--
-- Pensado para pegarse en el SQL Editor de Supabase (ver README.md para la
-- guía paso a paso). No se ha ejecutado contra ningún proyecto real: no hay
-- credenciales en este entorno. Revísalo antes de aplicarlo en producción.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 20),
  avatar_seed text not null default 'default',
  friend_code text not null unique,
  birth_year_consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "cualquiera autenticado puede ver perfiles básicos"
  on public.profiles for select
  to authenticated
  using (true);

create policy "cada cual gestiona su propio perfil"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

create policy "cada cual crea su propio perfil"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Amistades
-- ---------------------------------------------------------------------------

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  requested_by uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  constraint different_users check (user_a <> user_b),
  constraint ordered_pair check (user_a < user_b),
  unique (user_a, user_b)
);

alter table public.friendships enable row level security;

create policy "ver solo las amistades propias"
  on public.friendships for select
  to authenticated
  using (auth.uid() in (user_a, user_b));

create policy "crear solicitudes propias"
  on public.friendships for insert
  to authenticated
  with check (requested_by = auth.uid() and auth.uid() in (user_a, user_b));

create policy "responder o cancelar amistades propias"
  on public.friendships for update
  to authenticated
  using (auth.uid() in (user_a, user_b));

create policy "borrar amistades propias"
  on public.friendships for delete
  to authenticated
  using (auth.uid() in (user_a, user_b));

-- ---------------------------------------------------------------------------
-- Nidos
-- ---------------------------------------------------------------------------

create table if not exists public.nests (
  id uuid primary key default gen_random_uuid(),
  member_a uuid not null references public.profiles (id) on delete cascade,
  member_b uuid not null references public.profiles (id) on delete cascade,
  status text not null check (status in ('incubating', 'active', 'memorial')) default 'incubating',
  created_at timestamptz not null default now(),
  constraint different_members check (member_a <> member_b)
);

alter table public.nests enable row level security;

create policy "ver solo los nidos propios"
  on public.nests for select
  to authenticated
  using (auth.uid() in (member_a, member_b));

create policy "crear nidos donde participas"
  on public.nests for insert
  to authenticated
  with check (auth.uid() in (member_a, member_b));

create policy "actualizar solo tus nidos"
  on public.nests for update
  to authenticated
  using (auth.uid() in (member_a, member_b));

-- ---------------------------------------------------------------------------
-- Huevos y aportaciones de calor
-- ---------------------------------------------------------------------------

create table if not exists public.eggs (
  nest_id uuid primary key references public.nests (id) on delete cascade,
  created_at timestamptz not null default now(),
  hatched_at timestamptz,
  species_id text
);

alter table public.eggs enable row level security;

create policy "ver el huevo de tus nidos"
  on public.eggs for select
  to authenticated
  using (exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b)));

create table if not exists public.egg_contributions (
  id uuid primary key default gen_random_uuid(),
  nest_id uuid not null references public.nests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  points integer not null check (points > 0),
  created_at timestamptz not null default now()
);

alter table public.egg_contributions enable row level security;

create policy "ver aportaciones de tus nidos"
  on public.egg_contributions for select
  to authenticated
  using (exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b)));

create policy "aportar calor solo en tu nombre y en tus nidos"
  on public.egg_contributions for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b))
  );

-- El límite diario de aportaciones y la resolución de la eclosión (especie al
-- azar según las probabilidades de rareza) viven en una Edge Function
-- (`supabase/functions/warm-egg`), no en el cliente: así nadie puede forzar
-- una especie legendaria manipulando las peticiones. Ver ese directorio.

-- ---------------------------------------------------------------------------
-- Mascotas y registro de cuidados
-- ---------------------------------------------------------------------------

create table if not exists public.pets (
  nest_id uuid primary key references public.nests (id) on delete cascade,
  species_id text not null,
  name text not null default '',
  stage text not null check (stage in ('baby', 'child', 'teen', 'adult')) default 'baby',
  born_at timestamptz not null default now(),
  stage_entered_at timestamptz not null default now(),
  affection_points integer not null default 0,
  needs jsonb not null default '{"hunger":100,"fun":100,"hygiene":100,"energy":100,"affection":100}'::jsonb,
  needs_updated_at timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "ver la mascota de tus nidos"
  on public.pets for select
  to authenticated
  using (exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b)));

create policy "actualizar la mascota de tus nidos"
  on public.pets for update
  to authenticated
  using (exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b)));

create table if not exists public.care_logs (
  id uuid primary key default gen_random_uuid(),
  nest_id uuid not null references public.nests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  action text not null check (action in ('feed', 'clean', 'pet', 'play')),
  created_at timestamptz not null default now()
);

alter table public.care_logs enable row level security;

create policy "ver el registro de cuidados de tus nidos"
  on public.care_logs for select
  to authenticated
  using (exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b)));

create policy "registrar cuidados solo en tu nombre y en tus nidos"
  on public.care_logs for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.nests n where n.id = nest_id and auth.uid() in (n.member_a, n.member_b))
  );

-- ---------------------------------------------------------------------------
-- Rachas y economía
-- ---------------------------------------------------------------------------

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  count integer not null default 0,
  last_visit_date date,
  grace_used_this_week boolean not null default false,
  week_start_date date
);

alter table public.streaks enable row level security;

create policy "cada cual ve y actualiza su propia racha"
  on public.streaks for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists public.currency (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0)
);

alter table public.currency enable row level security;

create policy "cada cual ve su propia moneda"
  on public.currency for select
  to authenticated
  using (user_id = auth.uid());

-- Los cambios de saldo (recompensas, compras) pasan siempre por Edge
-- Functions con `service_role`, nunca por un UPDATE directo del cliente.
