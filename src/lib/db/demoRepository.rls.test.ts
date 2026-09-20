import { beforeEach, describe, expect, it } from 'vitest'
import { DemoRepository } from './demoRepository'

/**
 * Nuestro backend real es Supabase con RLS (ver supabase/migrations); en
 * este repositorio local no hay una base de datos con políticas que probar
 * directamente, así que este test verifica el mismo contrato de seguridad
 * a nivel de aplicación: nadie que no sea miembro de un nido puede verlo
 * ni actuar sobre él. Las políticas SQL replican exactamente esta misma
 * condición (`auth.uid() in (member_a, member_b)`).
 */
describe('aislamiento de datos entre usuarios (equivalente a RLS)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('un intruso no puede leer un nido ajeno', async () => {
    const repo = new DemoRepository()
    const nest = await repo.getNest('nest-1', 'intruder')
    expect(nest).toBeNull()
  })

  it('un miembro real sí puede leer su nido', async () => {
    const repo = new DemoRepository()
    const nest = await repo.getNest('nest-1', 'demo-a')
    expect(nest).not.toBeNull()
  })

  it('un intruso no puede aportar calor al huevo de otros', async () => {
    const repo = new DemoRepository()
    await expect(repo.warmEgg('nest-1', 'intruder', new Date().toISOString())).rejects.toThrow()
  })

  it('un intruso no puede cuidar la mascota de otros', async () => {
    const repo = new DemoRepository()
    // Forzamos la eclosión primero para tener una mascota.
    for (let i = 0; i < 10; i++) {
      try {
        await repo.warmEgg('nest-1', 'demo-a', new Date(Date.now() + i * 86_400_000).toISOString())
        await repo.warmEgg('nest-1', 'demo-b', new Date(Date.now() + i * 86_400_000).toISOString())
      } catch {
        break
      }
    }
    await expect(repo.careAction('nest-1', 'intruder', 'feed', new Date().toISOString())).rejects.toThrow()
  })

  it('listMyNests nunca devuelve nidos de los que no eres miembro', async () => {
    const repo = new DemoRepository()
    const nests = await repo.listMyNests('demo-a')
    expect(nests.every((n) => n.memberIds.includes('demo-a'))).toBe(true)

    const strangerNests = await repo.listMyNests('intruder')
    expect(strangerNests).toHaveLength(0)
  })
})
