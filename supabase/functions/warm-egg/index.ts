// Edge Function: warm-egg
//
// Registra una acción de "calor" sobre el huevo de un nido y resuelve la
// eclosión si corresponde. Vive en el servidor a propósito: la especie que
// sale del huevo depende de un número aleatorio (`Math.random` del lado del
// servidor) que el cliente nunca debe poder influir ni predecir, y el
// límite diario de acciones se valida aquí para que no se pueda saltar
// llamando directamente a la tabla.
//
// No desplegada (no hay proyecto de Supabase en este entorno). Pensada para
// `supabase functions deploy warm-egg` una vez exista un proyecto real.
//
// Requiere las variables de entorno estándar de Supabase Edge Functions
// (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) más las mismas constantes de
// gameConfig.ts (duplicadas aquí a propósito: este runtime es Deno, no
// comparte el bundle de la app).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const EGG_CONFIG = {
  hatchPointsTarget: 100,
  minContributionShare: 0.3,
  pointsPerWarmthAction: 4,
  maxWarmthActionsPerDay: 6,
}

const HATCH_RARITY_WEIGHTS: Record<string, number> = { common: 0.7, rare: 0.25, legendary: 0.05 }
const SPECIES_BY_RARITY: Record<string, string[]> = {
  common: ['gatito-mochi', 'conejo-nube', 'pollito-pipo', 'osito-miel', 'zorrito-kiko', 'panda-bao'],
  rare: ['axolotl-bubi', 'erizo-hoja', 'pinguino-copo'],
  legendary: ['dragoncito-chispa'],
}

function resolveHatchSpecies(): string {
  const roll = Math.random()
  let acc = 0
  for (const rarity of Object.keys(HATCH_RARITY_WEIGHTS)) {
    acc += HATCH_RARITY_WEIGHTS[rarity]
    if (roll <= acc) {
      const options = SPECIES_BY_RARITY[rarity]
      return options[Math.floor(Math.random() * options.length)]
    }
  }
  return SPECIES_BY_RARITY.common[0]
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Falta autenticación', { status: 401 })

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await anon.auth.getUser()
  if (!user) return new Response('No autenticado', { status: 401 })

  const { nestId } = await req.json()

  const { data: nest } = await supabase.from('nests').select('*').eq('id', nestId).single()
  if (!nest || ![nest.member_a, nest.member_b].includes(user.id)) {
    return new Response('Sin acceso a este nido', { status: 403 })
  }
  if (nest.status !== 'incubating') return new Response('Este nido no tiene huevo', { status: 409 })

  const today = new Date().toISOString().slice(0, 10)
  const { count } = await supabase
    .from('egg_contributions')
    .select('id', { count: 'exact', head: true })
    .eq('nest_id', nestId)
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00Z`)

  if ((count ?? 0) >= EGG_CONFIG.maxWarmthActionsPerDay) {
    return new Response('Límite diario de calor alcanzado', { status: 429 })
  }

  await supabase
    .from('egg_contributions')
    .insert({ nest_id: nestId, user_id: user.id, points: EGG_CONFIG.pointsPerWarmthAction })

  const { data: contributions } = await supabase.from('egg_contributions').select('user_id, points').eq('nest_id', nestId)

  const totals = new Map<string, number>()
  for (const row of contributions ?? []) {
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + row.points)
  }
  const total = [...totals.values()].reduce((sum, v) => sum + v, 0)
  const members = [nest.member_a, nest.member_b]
  const ready =
    total >= EGG_CONFIG.hatchPointsTarget &&
    members.every((id) => (totals.get(id) ?? 0) / total >= EGG_CONFIG.minContributionShare)

  if (ready) {
    const speciesId = resolveHatchSpecies()
    await supabase.from('pets').insert({ nest_id: nestId, species_id: speciesId })
    await supabase.from('nests').update({ status: 'active' }).eq('id', nestId)
    await supabase.from('eggs').update({ hatched_at: new Date().toISOString(), species_id: speciesId }).eq('nest_id', nestId)
    return Response.json({ hatched: true, speciesId })
  }

  return Response.json({ hatched: false, total })
})
