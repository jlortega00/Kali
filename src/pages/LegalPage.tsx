import { useParams } from 'react-router-dom'
import { APP_NAME, MIN_AGE_YEARS } from '@/config/gameConfig'

const PRIVACY = `
Última actualización: [pendiente de fecha de publicación]

**Esto es una plantilla de partida, no un documento legal revisado.** Antes
de publicarla, que la revise alguien con conocimientos legales (protección
de datos / RGPD).

## Qué datos tratamos

- Datos de cuenta: nombre de usuario, correo electrónico (si usas enlace
  mágico), avatar.
- Datos de juego: tu mascota, tus nidos y amistades, tus acciones de
  cuidado y tu progreso.
- No mostramos publicidad personalizada ni compartimos tus datos con
  terceros con fines publicitarios.

## Tus derechos

Puedes exportar o borrar tus datos en cualquier momento desde
Perfil → Privacidad. Para cualquier otra solicitud relacionada con el RGPD
(acceso, rectificación, portabilidad, oposición), escribe a
[correo de contacto pendiente].

## Edad mínima

${APP_NAME} requiere tener al menos ${MIN_AGE_YEARS} años (edad de
consentimiento digital en España) para crear una cuenta.

## Menores

No solicitamos deliberadamente datos de menores por debajo de la edad
mínima. Si detectamos una cuenta de alguien por debajo de esa edad, la
eliminaremos.
`

const TERMS = `
Última actualización: [pendiente de fecha de publicación]

**Esto es una plantilla de partida, no un documento legal revisado.**

## Qué es ${APP_NAME}

Una aplicación de mascota virtual cooperativa. Cada nido lo forman
exactamente dos personas que se han añadido mutuamente como amigas.

## Normas de convivencia

- No se permite contenido subido libremente por personas usuarias en esta
  versión (solo emotes y frases predefinidas).
- Nos reservamos el derecho de suspender cuentas que incumplan estas
  normas o intenten manipular el juego (por ejemplo, automatizar acciones).

## Moneda del juego

Las "Semillitas" son una moneda blanda sin valor monetario real, que no se
puede comprar con dinero en esta versión.

## Cambios

Podemos actualizar estos términos; avisaremos dentro de la aplicación
cuando lo hagamos.
`

export default function LegalPage() {
  const { type } = useParams<{ type: string }>()
  const content = type === 'terms' ? TERMS : PRIVACY
  const title = type === 'terms' ? 'Términos de uso' : 'Política de privacidad'

  return (
    <div className="px-4 py-4">
      <h1 className="text-lg font-bold text-ink">{title}</h1>
      <div className="mt-3 whitespace-pre-line rounded-blob bg-white/70 p-4 text-xs leading-relaxed text-ink-soft shadow-sm">{content.trim()}</div>
    </div>
  )
}
