const STORAGE_KEY = 'cubri-solicitud-v1'

export const PLAN_POR_DEFECTO = 'plus'

/**
 * @typedef {Object} Solicitud
 * @property {number} paso
 * @property {{marca: string, modelo: string, valor: number, antiguedad: string}} equipo
 * @property {string} plan
 * @property {{nombre: string, apellido: string, dni: string, nacimiento: string, email: string, celular: string, terminos: boolean}} titular
 * @property {{metodo: string, tarjeta: string, vencimiento: string, cvv: string, titular: string}} pago
 * @property {{numero: string, vigencia: string}|null} poliza
 */

/** @type {Solicitud} */
export const solicitud = {
  paso: 0,
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: PLAN_POR_DEFECTO,
  titular: {
    nombre: '',
    apellido: '',
    dni: '',
    nacimiento: '',
    email: '',
    celular: '',
    terminos: false,
  },
  pago: {
    metodo: 'credito',
    tarjeta: '',
    vencimiento: '',
    cvv: '',
    titular: '',
  },
  poliza: null,
}

export const metadata = {
  /** @type {Array<{id: string, nombre: string, descripcion: string, tasaAnual: number, recomendado: boolean, coberturas: string[], noIncluye: string[]}>} */
  planes: [],
  cargando: true,
  error: '',
  procesando: false,
  motivoPago: '',
}

/**
 * Vuelve a los valores iniciales.
 */
export function reiniciarSolicitud() {
  solicitud.paso = 0
  solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' }
  solicitud.plan = PLAN_POR_DEFECTO
  solicitud.titular = {
    nombre: '',
    apellido: '',
    dni: '',
    nacimiento: '',
    email: '',
    celular: '',
    terminos: false,
  }
  solicitud.pago = { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' }
  solicitud.poliza = null
}

/**
 * Persiste el estado actual para que sobreviva a un refresh.
 */
export function guardarEstado() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitud))
  } catch {
    // El navegador puede bloquear localStorage; la app sigue funcionando en memoria.
  }
}

/**
 * Restaura el estado guardado. Si no existe o está corrupto, mantiene los valores iniciales.
 */
export function limpiarEstadoGuardado() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // El navegador puede bloquear localStorage; no hay nada que limpiar.
  }
}

/**
 * Restaura el estado guardado. Si no existe o está corrupto, mantiene los valores iniciales.
 */
export function cargarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    const guardado = JSON.parse(raw)
    if (!guardado || typeof guardado !== 'object') return false

    solicitud.paso = Number.isInteger(guardado.paso) ? Math.min(Math.max(guardado.paso, 0), 6) : 0
    solicitud.equipo = {
      marca: String(guardado.equipo?.marca ?? ''),
      modelo: String(guardado.equipo?.modelo ?? ''),
      valor: Number(guardado.equipo?.valor) || 0,
      antiguedad: String(guardado.equipo?.antiguedad ?? ''),
    }
    solicitud.plan = String(guardado.plan ?? PLAN_POR_DEFECTO)
    solicitud.titular = {
      nombre: String(guardado.titular?.nombre ?? ''),
      apellido: String(guardado.titular?.apellido ?? ''),
      dni: String(guardado.titular?.dni ?? ''),
      nacimiento: String(guardado.titular?.nacimiento ?? ''),
      email: String(guardado.titular?.email ?? ''),
      celular: String(guardado.titular?.celular ?? ''),
      terminos: Boolean(guardado.titular?.terminos),
    }
    solicitud.pago = {
      metodo: String(guardado.pago?.metodo ?? 'credito'),
      tarjeta: String(guardado.pago?.tarjeta ?? ''),
      vencimiento: String(guardado.pago?.vencimiento ?? ''),
      cvv: String(guardado.pago?.cvv ?? ''),
      titular: String(guardado.pago?.titular ?? ''),
    }
    solicitud.poliza =
      guardado.poliza && typeof guardado.poliza === 'object'
        ? { numero: String(guardado.poliza.numero ?? ''), vigencia: String(guardado.poliza.vigencia ?? '') }
        : null

    return true
  } catch {
    return false
  }
}

/**
 * Asigna un valor a una ruta con puntos, por ejemplo "equipo.modelo".
 * @param {string} path
 * @param {unknown} value
 */
export function setValor(path, value) {
  const partes = path.split('.')
  let actual = solicitud
  for (let i = 0; i < partes.length - 1; i++) {
    actual = actual[partes[i]]
  }
  actual[partes.at(-1)] = value
}

/**
 * @param {string} path
 * @returns {unknown}
 */
export function getValor(path) {
  return path.split('.').reduce((actual, parte) => actual?.[parte], solicitud)
}
