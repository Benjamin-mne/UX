import './style.css'
import {
  cargarEstado,
  guardarEstado,
  limpiarEstadoGuardado,
  metadata,
  reiniciarSolicitud,
  setValor,
  solicitud,
} from './estado.js'
import {
  cuotaDePlan,
  equipoTexto,
  fillForms,
  formatearTarjeta,
  planActual,
  render,
  renderBotones,
  renderEnVivo,
  renderErrores,
  renderSeleccionPlan,
  titularTexto,
} from './render.js'
import {
  camposDePaso,
  hayErrores,
  soloDigitos,
  validarPaso,
} from './validaciones.js'
import { etiquetaAntiguedad, formatearMoneda, formatearValorInput } from './cotizador.js'
import { fechaVigencia, generarNumeroPoliza, simularPago } from './pago.js'

/** @type {Set<string>} */
let tocados = new Set()

const SELECTORES_CAMPO = {
  'equipo.marca': '#marca',
  'equipo.modelo': '#modelo',
  'equipo.valor': '#valor',
  'equipo.antiguedad': 'input[name="antiguedad"]',
  'titular.nombre': '#nombre',
  'titular.apellido': '#apellido',
  'titular.dni': '#dni',
  'titular.nacimiento': '#nacimiento',
  'titular.email': '#email',
  'titular.celular': '#celular',
  'titular.terminos': '#terminos',
  'pago.tarjeta': '#tarjeta',
  'pago.vencimiento': '#vencimiento',
  'pago.cvv': '#cvv',
  'pago.titular': '#titular-tarjeta',
}

/**
 * @param {number} paso
 */
function irAPaso(paso) {
  solicitud.paso = Math.min(Math.max(Number(paso) || 0, 0), 6)
  tocados = new Set()
  metadata.procesando = false
  if (solicitud.paso !== 6) metadata.motivoPago = ''
  guardarEstado()
  render()
}

/**
 * @param {string} campo
 */
function enfocarCampo(campo) {
  const selector = SELECTORES_CAMPO[campo]
  if (!selector) return
  const elemento = document.querySelector(selector)
  if (!(elemento instanceof HTMLElement)) return
  elemento.focus({ preventScroll: true })
  elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/**
 * @param {number} paso
 * @returns {boolean}
 */
function validarYContinuar(paso) {
  const errores = validarPaso(paso, solicitud)
  camposDePaso(paso).forEach((campo) => tocados.add(campo))
  renderErrores(errores, tocados, true)
  renderBotones()

  if (hayErrores(errores)) {
    const primerCampo = camposDePaso(paso).find((campo) => errores[campo])
    if (primerCampo) enfocarCampo(primerCampo)
    return false
  }

  return true
}

/**
 * @param {SubmitEvent} event
 */
function enviarCotizacion(event) {
  event.preventDefault()
  if (!validarYContinuar(1)) return
  irAPaso(2)
}

/**
 * @param {SubmitEvent} event
 */
function enviarPlan(event) {
  event.preventDefault()
  if (metadata.cargando || metadata.error || !planActual()) return
  irAPaso(3)
}

/**
 * @param {SubmitEvent} event
 */
function enviarDatos(event) {
  event.preventDefault()
  if (!validarYContinuar(3)) return

  if (!solicitud.pago.titular) {
    solicitud.pago.titular = titularTexto() === 'Completá tus datos' ? '' : titularTexto()
    guardarEstado()
  }

  irAPaso(4)
}

/**
 * @param {SubmitEvent} event
 */
async function enviarPago(event) {
  event.preventDefault()
  if (metadata.procesando) return
  if (!validarYContinuar(4)) return

  metadata.procesando = true
  renderBotones()

  const resultado = await simularPago(solicitud.pago.tarjeta)
  metadata.procesando = false

  if (!resultado.ok) {
    metadata.motivoPago = resultado.motivo || 'El banco rechazó la tarjeta. Probá con otro medio de pago.'
    solicitud.paso = 6
    tocados = new Set()
    guardarEstado()
    render()
    return
  }

  solicitud.poliza = {
    numero: generarNumeroPoliza(),
    vigencia: fechaVigencia(),
  }
  solicitud.paso = 5
  metadata.motivoPago = ''
  tocados = new Set()
  limpiarEstadoGuardado()
  render()
}

/**
 * Vuelve al paso anterior dentro del checkout.
 */
function volver() {
  if (solicitud.paso >= 1 && solicitud.paso <= 4) {
    irAPaso(solicitud.paso - 1)
  }
}

/**
 * Descarga un comprobante de la póliza en texto plano.
 */
function descargarPoliza() {
  const plan = planActual()
  const cuota = cuotaDePlan(plan)
  const lineas = [
    'CUBRÍ · SEGURO DE CELULAR',
    '================================',
    '',
    `Póliza: ${solicitud.poliza?.numero ?? '—'}`,
    `Vigencia desde: ${solicitud.poliza?.vigencia ?? '—'}`,
    '',
    'TITULAR',
    `Nombre: ${titularTexto()}`,
    `DNI: ${solicitud.titular.dni || '—'}`,
    `Email: ${solicitud.titular.email || '—'}`,
    `Celular: ${solicitud.titular.celular || '—'}`,
    '',
    'EQUIPO',
    `Equipo: ${equipoTexto()}`,
    `Valor declarado: ${formatearMoneda(solicitud.equipo.valor)}`,
    `Antigüedad: ${etiquetaAntiguedad(solicitud.equipo.antiguedad)}`,
    '',
    'COBERTURA',
    `Plan: ${plan?.nombre ?? '—'}`,
    `Cuota mensual: ${formatearMoneda(cuota)}`,
    '',
    'Incluye:',
    ...(plan?.coberturas ?? plan?.incluye ?? []).map((item) => `  - ${item}`),
    '',
    'Documento generado desde la demo académica de Cubrí.',
  ]

  const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `poliza-${solicitud.poliza?.numero ?? 'cubri'}.txt`
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

/**
 * Aplica el formato de cada input y guarda el valor en el estado.
 * @param {HTMLInputElement|HTMLSelectElement} control
 */
function actualizarControl(control) {
  const bind = control.dataset.bind
  if (!bind) return

  let valor

  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    valor = control.checked
  } else if (control instanceof HTMLInputElement && control.type === 'radio') {
    if (!control.checked) return
    valor = control.value
  } else if (control.dataset.format === 'moneda') {
    const digitos = soloDigitos(control.value)
    valor = Number(digitos) || 0
    control.value = digitos
  } else if (control.dataset.format === 'tarjeta') {
    const digitos = soloDigitos(control.value).slice(0, 16)
    control.value = formatearTarjeta(digitos)
    valor = digitos
  } else if (control.dataset.format === 'vencimiento') {
    const digitos = soloDigitos(control.value).slice(0, 4)
    valor = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos
    control.value = valor
  } else if (control.dataset.format === 'cvv') {
    valor = soloDigitos(control.value).slice(0, 3)
    control.value = valor
  } else if (control.dataset.format === 'dni') {
    valor = soloDigitos(control.value).slice(0, 8)
    control.value = valor
  } else if (control.dataset.format === 'celular') {
    const digitos = soloDigitos(control.value).slice(0, 10)
    let formateado = digitos
    if (digitos.length > 2) formateado = `${digitos.slice(0, 2)} ${digitos.slice(2, 6)}`
    if (digitos.length > 6) {
      formateado = `${digitos.slice(0, 2)} ${digitos.slice(2, 6)}-${digitos.slice(6)}`
    }
    control.value = formateado
    valor = formateado
  } else {
    valor = control.value
  }

  setValor(bind, valor)

  if (bind === 'pago.metodo') {
    document.querySelectorAll('.pay-method').forEach((label) => {
      label.dataset.selected = String(label.dataset.metodo === solicitud.pago.metodo)
    })
  }

  guardarEstado()
  renderEnVivo()

  if (tocados.has(bind)) {
    renderErrores(validarPaso(solicitud.paso, solicitud), tocados, false)
    renderBotones()
  }
}

/**
 * @param {Event} event
 */
function manejarInput(event) {
  const control = event.target
  if (!(control instanceof HTMLInputElement)) return
  if (control.type === 'radio' || control.type === 'checkbox' || control.type === 'select-one') return
  if (control.dataset.planId) return
  if (!control.dataset.bind) return
  actualizarControl(control)
}

/**
 * @param {Event} event
 */
function manejarChange(event) {
  const control = event.target
  if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLSelectElement)) return

  if (control instanceof HTMLInputElement && control.dataset.planId) {
    solicitud.plan = control.value
    guardarEstado()
    renderSeleccionPlan()
    renderEnVivo()
    return
  }

  if (!control.dataset.bind) return
  if (control instanceof HTMLInputElement && control.type === 'radio' && !control.checked) return
  actualizarControl(control)
}

/**
 * @param {Event} event
 */
function manejarFocusIn(event) {
  const control = event.target
  if (control instanceof HTMLInputElement && control.dataset.format === 'moneda') {
    control.value = solicitud.equipo.valor ? String(solicitud.equipo.valor) : ''
  }
}

/**
 * @param {Event} event
 */
function manejarFocusOut(event) {
  const control = event.target
  if (!(control instanceof HTMLInputElement) && !(control instanceof HTMLSelectElement)) return

  if (control instanceof HTMLInputElement && control.dataset.format === 'moneda') {
    control.value = formatearValorInput(solicitud.equipo.valor)
  }

  if (control instanceof HTMLInputElement && control.type === 'radio') return
  const bind = control.dataset.bind
  if (!bind) return

  tocados.add(bind)
  renderErrores(validarPaso(solicitud.paso, solicitud), tocados, false)
  renderBotones()
}

/**
 * @param {MouseEvent} event
 */
function manejarClick(event) {
  const objetivo = event.target
  if (!(objetivo instanceof Element)) return

  const producto = objetivo.closest('[data-producto]')
  if (producto) {
    event.preventDefault()
    irAPaso(1)
    return
  }

  const accion = objetivo.closest('[data-action]')
  if (!(accion instanceof HTMLElement)) return

  switch (accion.dataset.action) {
    case 'inicio':
      event.preventDefault()
      irAPaso(0)
      break
    case 'cotizar-celular':
      event.preventDefault()
      irAPaso(1)
      break
    case 'volver':
      event.preventDefault()
      volver()
      break
    case 'editar-paso':
      event.preventDefault()
      irAPaso(Number(accion.dataset.pasoDestino) || 0)
      break
    case 'reintentar':
      event.preventDefault()
      irAPaso(4)
      break
    case 'cambiar-medio':
      event.preventDefault()
      irAPaso(4)
      window.setTimeout(() => {
        document.querySelector('input[name="metodo"]')?.focus()
      }, 80)
      break
    case 'descargar-poliza':
      event.preventDefault()
      descargarPoliza()
      break
    case 'reiniciar':
      event.preventDefault()
      reiniciarSolicitud()
      metadata.procesando = false
      metadata.motivoPago = ''
      tocados = new Set()
      limpiarEstadoGuardado()
      render()
      break
    default:
      break
  }
}

/**
 * Carga los planes desde el JSON público.
 */
async function cargarPlanes() {
  metadata.cargando = true
  metadata.error = ''

  try {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`
    const respuesta = await fetch(`${base}data/planes.json`)
    if (!respuesta.ok) throw new Error(`No se pudieron cargar los planes (${respuesta.status}).`)

    const datos = await respuesta.json()
    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('El archivo de planes está vacío.')
    }

    metadata.planes = datos
    metadata.cargando = false
    render()
  } catch (error) {
    metadata.cargando = false
    metadata.error = 'Revisá tu conexión e intentá recargar la página.'
    console.error(error)
    render()
  }
}

function configurarEventos() {
  document.addEventListener('click', manejarClick)
  document.addEventListener('input', manejarInput)
  document.addEventListener('change', manejarChange)
  document.addEventListener('focusin', manejarFocusIn)
  document.addEventListener('focusout', manejarFocusOut)

  document.querySelector('#form-cotizar')?.addEventListener('submit', enviarCotizacion)
  document.querySelector('#form-plan')?.addEventListener('submit', enviarPlan)
  document.querySelector('#form-datos')?.addEventListener('submit', enviarDatos)
  document.querySelector('#form-pago')?.addEventListener('submit', enviarPago)
}

function iniciar() {
  cargarEstado()
  configurarEventos()
  render()
  cargarPlanes()
}

iniciar()
