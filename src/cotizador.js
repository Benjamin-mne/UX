export const ANTIGUEDADES = [
  { valor: 'menos1', etiqueta: 'Menos de 1 año', factor: 1 },
  { valor: '1a2', etiqueta: '1 a 2 años', factor: 1.1 },
  { valor: 'mas2', etiqueta: '+2 años', factor: 1.25 },
]

const FACTORES = Object.fromEntries(ANTIGUEDADES.map((a) => [a.valor, a.factor]))

const moneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const numeroEntero = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
})

/**
 * @param {number} valor
 * @returns {string}
 */
export function formatearMoneda(valor) {
  return moneda.format(Number(valor) || 0)
}

/**
 * Calcula la cuota mensual con la fórmula del trabajo práctico.
 * @param {number} valor Valor declarado del equipo.
 * @param {number} tasaAnual Tasa anual del plan (por ejemplo 0,06).
 * @param {string} antiguedad Clave de antigüedad.
 * @returns {number}
 */
export function calcularCuota(valor, tasaAnual, antiguedad) {
  const factor = FACTORES[antiguedad] ?? 1
  return Math.round((Number(valor) * Number(tasaAnual) * factor) / 12)
}

/**
 * @param {string} antiguedad
 * @returns {string}
 */
export function etiquetaAntiguedad(antiguedad) {
  return ANTIGUEDADES.find((a) => a.valor === antiguedad)?.etiqueta ?? 'Sin definir'
}

/**
 * @param {number} valor
 * @returns {string}
 */
export function formatearValorInput(valor) {
  const numero = Number(valor) || 0
  return numero ? numeroEntero.format(numero) : ''
}
