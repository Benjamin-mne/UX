import { soloDigitos } from './validaciones.js'

const TARJETA_RECHAZADA = '4000000000000002'
const CONTADOR_KEY = 'cubri-poliza-contador'

/**
 * Simula la autorización de un pago.
 * @param {string} numeroTarjeta
 * @returns {Promise<{ok: boolean, motivo?: string}>}
 */
export function simularPago(numeroTarjeta) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const numero = soloDigitos(numeroTarjeta)
      if (numero === TARJETA_RECHAZADA) {
        resolve({ ok: false, motivo: 'El banco rechazó la tarjeta. Probá con otro medio de pago.' })
        return
      }
      resolve({ ok: true })
    }, 1500)
  })
}

/**
 * Genera un número de póliza con formato POL-AAAA-NNNNNN.
 * @returns {string}
 */
export function generarNumeroPoliza() {
  const anio = new Date().getFullYear()
  let contador = 0

  try {
    contador = Number(localStorage.getItem(CONTADOR_KEY)) || 0
  } catch {
    contador = 0
  }

  contador += 1

  try {
    localStorage.setItem(CONTADOR_KEY, String(contador))
  } catch {
    // Si localStorage no está disponible, el número sigue siendo válido para esta sesión.
  }

  return `POL-${anio}-${String(contador).padStart(6, '0')}`
}

/**
 * @returns {string}
 */
export function fechaVigencia() {
  const hoy = new Date()
  const dia = String(hoy.getDate()).padStart(2, '0')
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${hoy.getFullYear()}`
}
