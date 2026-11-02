import { ANTIGUEDADES } from './cotizador.js'

export const MARCAS = ['Samsung', 'Apple', 'Motorola', 'Xiaomi', 'Otro']

export const VALOR_MINIMO = 100000
export const VALOR_MAXIMO = 2500000

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VENCIMIENTO_REGEX = /^(0[1-9]|1[0-2])\/(\d{2})$/

/**
 * @param {unknown} valor
 * @returns {string}
 */
export function soloDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

/**
 * @param {string} fechaISO
 * @returns {number|null}
 */
export function calcularEdad(fechaISO) {
  if (!fechaISO) return null
  const fecha = new Date(`${fechaISO}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return null

  const hoy = new Date()
  let edad = hoy.getFullYear() - fecha.getFullYear()
  const mes = hoy.getMonth() - fecha.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) edad--
  return edad
}

/**
 * @returns {string} Fecha máxima para ser mayor de edad (hoy menos 18 años).
 */
export function fechaMaximaNacimiento() {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() - 18)
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

/**
 * @param {string} fechaISO
 * @returns {string}
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const [anio, mes, dia] = fechaISO.split('-')
  return `${dia}/${mes}/${anio}`
}

/**
 * @param {string} vencimiento MM/AA
 * @returns {boolean}
 */
export function vencimientoVigente(vencimiento) {
  const match = VENCIMIENTO_REGEX.exec(vencimiento)
  if (!match) return false

  const mes = Number(match[1])
  const anio = 2000 + Number(match[2])
  const hoy = new Date()
  const finDeMes = new Date(anio, mes, 0, 23, 59, 59)

  return finDeMes >= hoy
}

/**
 * Valida un campo individual.
 * @param {string} campo
 * @param {import('./estado.js').Solicitud} s
 * @returns {string|null}
 */
export function validarCampo(campo, s) {
  switch (campo) {
    case 'equipo.marca':
      return s.equipo.marca ? null : 'Elegí una marca'

    case 'equipo.modelo': {
      const modelo = s.equipo.modelo.trim()
      if (!modelo) return 'Ingresá el modelo del equipo'
      if (modelo.length < 2 || modelo.length > 40) return 'Ingresá el modelo del equipo'
      return null
    }

    case 'equipo.valor': {
      const valor = Number(s.equipo.valor)
      if (!Number.isFinite(valor) || valor < VALOR_MINIMO || valor > VALOR_MAXIMO) {
        return 'El valor debe estar entre $100.000 y $2.500.000'
      }
      return null
    }

    case 'equipo.antiguedad':
      return ANTIGUEDADES.some((a) => a.valor === s.equipo.antiguedad) ? null : 'Indicá la antigüedad'

    case 'titular.nombre':
      return s.titular.nombre.trim().length >= 2 ? null : 'Ingresá tu nombre'

    case 'titular.apellido':
      return s.titular.apellido.trim().length >= 2 ? null : 'Ingresá tu apellido'

    case 'titular.dni': {
      const dni = soloDigitos(s.titular.dni)
      return /^\d{7,8}$/.test(dni) ? null : 'El DNI debe tener 7 u 8 números'
    }

    case 'titular.nacimiento': {
      if (!s.titular.nacimiento) return 'Ingresá tu fecha de nacimiento'
      const edad = calcularEdad(s.titular.nacimiento)
      if (edad === null) return 'Ingresá una fecha válida'
      if (edad < 18) return 'Tenés que ser mayor de edad'
      if (edad > 120) return 'Ingresá una fecha válida'
      return null
    }

    case 'titular.email':
      return EMAIL_REGEX.test(s.titular.email.trim()) ? null : 'Ingresá un email válido'

    case 'titular.celular': {
      const celular = soloDigitos(s.titular.celular)
      if (celular.length !== 10 || celular.startsWith('0') || celular.startsWith('15')) {
        return 'Ingresá un celular válido'
      }
      return null
    }

    case 'titular.terminos':
      return s.titular.terminos ? null : 'Tenés que aceptar los términos'

    case 'pago.tarjeta': {
      const tarjeta = soloDigitos(s.pago.tarjeta)
      return /^\d{16}$/.test(tarjeta) ? null : 'Número de tarjeta inválido'
    }

    case 'pago.vencimiento':
      return vencimientoVigente(s.pago.vencimiento) ? null : 'Vencimiento inválido'

    case 'pago.cvv':
      return /^\d{3}$/.test(soloDigitos(s.pago.cvv)) ? null : 'CVV inválido'

    case 'pago.titular':
      return s.pago.titular.trim().length >= 2 ? null : 'Ingresá el nombre del titular'

    default:
      return null
  }
}

/**
 * @param {import('./estado.js').Solicitud} s
 * @returns {Record<string, string|null>}
 */
export function validarEquipo(s) {
  return {
    'equipo.marca': validarCampo('equipo.marca', s),
    'equipo.modelo': validarCampo('equipo.modelo', s),
    'equipo.valor': validarCampo('equipo.valor', s),
    'equipo.antiguedad': validarCampo('equipo.antiguedad', s),
  }
}

/**
 * @param {import('./estado.js').Solicitud} s
 * @returns {Record<string, string|null>}
 */
export function validarTitular(s) {
  return {
    'titular.nombre': validarCampo('titular.nombre', s),
    'titular.apellido': validarCampo('titular.apellido', s),
    'titular.dni': validarCampo('titular.dni', s),
    'titular.nacimiento': validarCampo('titular.nacimiento', s),
    'titular.email': validarCampo('titular.email', s),
    'titular.celular': validarCampo('titular.celular', s),
    'titular.terminos': validarCampo('titular.terminos', s),
  }
}

/**
 * @param {import('./estado.js').Solicitud} s
 * @returns {Record<string, string|null>}
 */
export function validarPago(s) {
  return {
    'pago.tarjeta': validarCampo('pago.tarjeta', s),
    'pago.vencimiento': validarCampo('pago.vencimiento', s),
    'pago.cvv': validarCampo('pago.cvv', s),
    'pago.titular': validarCampo('pago.titular', s),
  }
}

/**
 * @param {number} paso
 * @param {import('./estado.js').Solicitud} s
 * @returns {Record<string, string|null>}
 */
export function validarPaso(paso, s) {
  if (paso === 1) return validarEquipo(s)
  if (paso === 3) return validarTitular(s)
  if (paso === 4) return validarPago(s)
  return {}
}

/**
 * @param {Record<string, string|null>} errores
 * @returns {boolean}
 */
export function hayErrores(errores) {
  return Object.values(errores).some(Boolean)
}

/**
 * @param {number} paso
 * @returns {string[]}
 */
export function camposDePaso(paso) {
  if (paso === 1) return ['equipo.marca', 'equipo.modelo', 'equipo.valor', 'equipo.antiguedad']
  if (paso === 3) {
    return [
      'titular.nombre',
      'titular.apellido',
      'titular.dni',
      'titular.nacimiento',
      'titular.email',
      'titular.celular',
      'titular.terminos',
    ]
  }
  if (paso === 4) return ['pago.tarjeta', 'pago.vencimiento', 'pago.cvv', 'pago.titular']
  return []
}
