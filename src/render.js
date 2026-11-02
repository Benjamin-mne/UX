import { metadata, solicitud } from './estado.js'
import { icon } from './icons.js'
import { calcularCuota, formatearMoneda, formatearValorInput } from './cotizador.js'
import {
  camposDePaso,
  fechaMaximaNacimiento,
  hayErrores,
  soloDigitos,
  validarEquipo,
  validarPago,
  validarPaso,
  validarTitular,
} from './validaciones.js'

const PRODUCTOS = [
  { id: 'celular', nombre: 'Celular', detalle: 'Robo y rotura', icono: 'phone', habilitado: true, badge: 'Popular' },
  { id: 'hogar', nombre: 'Hogar', detalle: 'Tu casa protegida', icono: 'home', habilitado: false, badge: 'Próximamente' },
  { id: 'bicicleta', nombre: 'Bicicleta', detalle: 'Para tus recorridos', icono: 'bike', habilitado: false, badge: 'Próximamente' },
  { id: 'viaje', nombre: 'Viaje', detalle: 'Cobertura en el exterior', icono: 'plane', habilitado: false, badge: 'Próximamente' },
]

const TITULOS_PASO = {
  1: 'Contanos sobre tu celular',
  2: 'Elegí el plan ideal para vos',
  3: 'Tus datos personales',
  4: 'Completá el pago',
}

const TITULOS_MOBILE = {
  1: 'Cotizar seguro',
  2: 'Elegí tu plan',
  3: 'Tus datos',
  4: 'Pago',
}

const PASOS = [
  { numero: 1, etiqueta: 'Cotizar' },
  { numero: 2, etiqueta: 'Plan' },
  { numero: 3, etiqueta: 'Datos' },
  { numero: 4, etiqueta: 'Pago' },
]

/**
 * @param {unknown} valor
 * @returns {string}
 */
function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return mapa[caracter]
  })
}

/**
 * @returns {import('./estado.js').Solicitud['equipo']}
 */
function equipoActual() {
  return solicitud.equipo
}

/**
 * @returns {string}
 */
export function equipoTexto() {
  const { marca, modelo } = equipoActual()
  if (!marca && !modelo) return 'Completá tu equipo'
  return `${marca || 'Equipo'} ${modelo || ''}`.trim()
}

/**
 * @returns {string}
 */
export function titularTexto() {
  const { nombre, apellido } = solicitud.titular
  return [nombre, apellido].filter(Boolean).join(' ') || 'Completá tus datos'
}

/**
 * @returns {string}
 */
export function numeroTarjetaEnmascarado() {
  const digitos = soloDigitos(solicitud.pago.tarjeta)
  return digitos ? `•••• ${digitos.slice(-4)}` : 'Sin completar'
}

/**
 * Plan que se muestra en el resumen de la cotización (el más económico).
 * @returns {typeof metadata.planes[number] | null}
 */
export function planCotizacion() {
  return metadata.planes.find((plan) => plan.id === 'basico') ?? metadata.planes[0] ?? null
}

/**
 * @returns {typeof metadata.planes[number] | null}
 */
export function planActual() {
  return metadata.planes.find((plan) => plan.id === solicitud.plan) ?? null
}

/**
 * @returns {number}
 */
export function cuotaActual() {
  const plan = planActual()
  if (!plan) return 0
  return calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad)
}

/**
 * @param {typeof metadata.planes[number] | null} plan
 * @returns {number}
 */
export function cuotaDePlan(plan) {
  if (!plan) return 0
  return calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad)
}

/**
 * @returns {boolean}
 */
function equipoListoParaCotizar() {
  return (
    solicitud.equipo.valor >= 100000 &&
    solicitud.equipo.valor <= 2500000 &&
    Boolean(solicitud.equipo.antiguedad)
  )
}

/**
 * @param {string} etiqueta
 * @param {string} valor
 * @param {number|null} editarPaso
 * @returns {string}
 */
function filaResumen(etiqueta, valor, editarPaso = null) {
  return `
    <div class="summary-row">
      <span class="summary-label">${etiqueta}</span>
      <span class="flex min-w-0 items-center justify-end gap-2">
        <span class="summary-value">${valor}</span>
        ${
          editarPaso
            ? `<button type="button" class="link-edit shrink-0" data-action="editar-paso" data-paso-destino="${editarPaso}">Editar</button>`
            : ''
        }
      </span>
    </div>
  `
}

/**
 * Renderiza las tarjetas de productos de la pantalla de inicio.
 */
export function renderProductos() {
  const contenedor = document.querySelector('#productos')
  if (!contenedor) return

  contenedor.innerHTML = PRODUCTOS.map((producto) => {
    const atributos = producto.habilitado
      ? 'data-producto="celular"'
      : 'disabled aria-disabled="true"'

    return `
      <button
        type="button"
        class="product-card"
        data-enabled="${producto.habilitado}"
        ${atributos}
        aria-label="${producto.habilitado ? 'Cotizar seguro de Celular' : `${producto.nombre} próximamente`}"
      >
        <span class="product-icon">${icon(producto.icono, 'size-5 lg:size-6')}</span>
        <span class="block w-full">
          <span class="flex flex-wrap items-center gap-1.5">
            <span class="text-sm font-bold text-ink lg:text-base">${producto.nombre}</span>
            <span class="badge border-0 ${
              producto.habilitado
                ? 'bg-brand-soft text-brand-dark'
                : 'bg-slate-100 text-slate-500'
            } px-1.5 py-0 text-[9px] font-bold uppercase tracking-wide">${producto.badge}</span>
          </span>
          <span class="mt-1 block text-[11px] leading-4 text-muted-ink lg:text-xs">${producto.detalle}</span>
        </span>
        ${
          producto.habilitado
            ? `<span class="absolute right-4 top-4 text-brand/70">${icon('arrowRight', 'size-4')}</span>`
            : ''
        }
      </button>
    `
  }).join('')
}

/**
 * Renderiza las tarjetas de planes.
 */
export function renderPlanes() {
  const contenedor = document.querySelector('#planes')
  if (!contenedor) return

  if (metadata.cargando) {
    contenedor.innerHTML = Array.from({ length: 3 })
      .map(
        () => `
        <div class="animate-pulse rounded-2xl border border-line bg-white p-5">
          <div class="h-4 w-20 rounded bg-slate-100"></div>
          <div class="mt-3 h-3 w-full rounded bg-slate-100"></div>
          <div class="mt-6 h-8 w-24 rounded bg-slate-100"></div>
          <div class="mt-5 h-16 rounded bg-slate-100"></div>
        </div>
      `,
      )
      .join('')
    return
  }

  if (metadata.error) {
    contenedor.innerHTML = `
      <div class="col-span-full">
        <div class="alert border-[#fecaca] bg-red-50/60 text-danger" role="alert">
          ${icon('alert', 'size-5')}
          <div>
            <p class="text-sm font-semibold">No pudimos cargar los planes</p>
            <p class="mt-1 text-xs text-red-700">${esc(metadata.error)}</p>
          </div>
        </div>
      </div>
    `
    return
  }

  contenedor.innerHTML = metadata.planes
    .map((plan) => {
      const seleccionado = plan.id === solicitud.plan
      const cuota = cuotaDePlan(plan)
      const incluye = (plan.coberturas ?? plan.incluye ?? [])
        .map(
          (item) => `
          <span class="flex items-start gap-2 text-xs leading-5 text-slate-600">
            <span class="mt-0.5 text-success">${icon('check', 'size-3.5')}</span>
            ${esc(item)}
          </span>
        `,
        )
        .join('')
      const noIncluye = plan.noIncluye
        .map(
          (item) => `
          <span class="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <span class="mt-0.5">${icon('x', 'size-3.5')}</span>
            ${esc(item)}
          </span>
        `,
        )
        .join('')

      return `
        <label class="card plan-card" data-plan-card="${esc(plan.id)}" data-selected="${seleccionado}">
          <input
            type="radio"
            name="plan"
            value="${esc(plan.id)}"
            data-plan-id="${esc(plan.id)}"
            class="sr-only"
            ${seleccionado ? 'checked' : ''}
          />
          <span class="flex items-start justify-between gap-2">
            <span class="min-w-0">
              <span class="flex flex-wrap items-center gap-1.5">
                <span class="text-base font-bold text-ink">${esc(plan.nombre)}</span>
                ${
                  plan.recomendado
                    ? '<span class="badge border-0 bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Recomendado</span>'
                    : ''
                }
              </span>
              <span class="mt-1 block text-xs leading-5 text-muted-ink">${esc(plan.descripcion)}</span>
            </span>
            <span class="radio-dot mt-0.5"></span>
          </span>

          <span class="mt-4 block">
            <span data-plan-precio class="text-[26px] font-extrabold tracking-tight text-ink">${formatearMoneda(cuota)}</span>
            <span class="text-xs font-medium text-muted-ink">/ mes</span>
          </span>

          <span class="mt-4 flex flex-1 flex-col gap-2 border-t border-line pt-4">
            ${incluye}
            ${noIncluye}
          </span>
        </label>
      `
    })
    .join('')
}

/**
 * Actualiza los precios de los planes sin volver a crear las tarjetas.
 */
export function renderPreciosPlanes() {
  document.querySelectorAll('[data-plan-card]').forEach((card) => {
    const plan = metadata.planes.find((item) => item.id === card.dataset.planCard)
    const precio = card.querySelector('[data-plan-precio]')
    if (plan && precio) precio.textContent = formatearMoneda(cuotaDePlan(plan))
  })
}

/**
 * Actualiza la selección visual de los planes sin volver a crear el DOM.
 */
export function renderSeleccionPlan() {
  document.querySelectorAll('[data-plan-card]').forEach((card) => {
    const seleccionado = card.dataset.planCard === solicitud.plan
    card.dataset.selected = String(seleccionado)
    const input = card.querySelector('input[type="radio"]')
    if (input) input.checked = seleccionado
  })
}

/**
 * Arma el resumen lateral según el contexto.
 * @param {string} contexto
 * @returns {string}
 */
function htmlResumen(contexto) {
  const esCotizar = contexto === 'cotizar'
  const plan = esCotizar ? planCotizacion() : planActual()

  if (!equipoListoParaCotizar() || !plan) {
    return `
      <div class="card panel p-5 lg:p-6">
        <h2 class="text-base font-bold text-ink">${esCotizar ? 'Tu cotización' : 'Resumen de tu solicitud'}</h2>
        <p class="mt-2 text-sm leading-6 text-muted-ink">
          Completá el valor y la antigüedad de tu equipo para ver la cuota mensual.
        </p>
        <div class="mt-5 rounded-xl border border-dashed border-line bg-canvas p-5 text-center">
          <span class="mx-auto flex size-10 items-center justify-center rounded-full bg-white text-slate-400">${icon('clock', 'size-5')}</span>
          <p class="mt-2 text-xs font-medium text-muted-ink">La cuota se calcula al instante.</p>
        </div>
      </div>
    `
  }

  const cuota = cuotaDePlan(plan)
  const editarEquipo = !esCotizar && solicitud.paso >= 2 ? 1 : null
  const editarPlan = !esCotizar && solicitud.paso >= 3 ? 2 : null
  const editarTitular = !esCotizar && solicitud.paso >= 4 ? 3 : null

  const filas = [
    filaResumen('Seguro', 'Celular'),
    filaResumen('Equipo', esc(equipoTexto()), editarEquipo),
    filaResumen(
      esCotizar ? 'Cobertura' : 'Plan',
      esCotizar ? 'Desde Básico' : esc(plan.nombre),
      editarPlan,
    ),
  ]

  if (!esCotizar && solicitud.paso >= 3 && solicitud.titular.nombre) {
    filas.push(filaResumen('Titular', esc(titularTexto()), editarTitular))
  }

  if (!esCotizar && solicitud.paso >= 4 && solicitud.pago.tarjeta) {
    filas.push(filaResumen('Tarjeta', numeroTarjetaEnmascarado()))
  }

  return `
    <div class="card panel p-5 lg:p-6">
      <div class="flex items-start justify-between gap-3">
        <h2 class="text-base font-bold text-ink">${esCotizar ? 'Tu cotización' : 'Resumen de tu solicitud'}</h2>
        <span class="badge border-0 bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand-dark">Celular</span>
      </div>

      <div class="mt-5">${filas.join('')}</div>

      <div class="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
        <span class="text-sm font-semibold text-ink">${esCotizar ? 'Desde' : 'Total mensual'}</span>
        <span class="text-right">
          <span class="text-2xl font-extrabold tracking-tight text-ink">${formatearMoneda(cuota)}</span>
          <span class="text-xs font-medium text-muted-ink">/ mes</span>
        </span>
      </div>

      <p class="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-ink">
        <span class="mt-0.5 text-success">${icon('lock', 'size-3.5')}</span>
        ${esCotizar ? 'El precio final depende del plan que elijas.' : 'IVA incluido. Podés cancelar cuando quieras.'}
      </p>
    </div>
  `
}

/**
 * Pinta todos los resúmenes laterales.
 */
export function renderResumen() {
  document.querySelectorAll('[data-resumen]').forEach((contenedor) => {
    contenedor.innerHTML = htmlResumen(contenedor.dataset.resumen ?? '')
  })
  renderResumenMobile()
}

/**
 * Pinta la barra de resumen fija que acompaña al CTA en mobile.
 */
export function renderResumenMobile() {
  const cotizar = document.querySelector('#cotizar-resumen-mobile')
  if (cotizar) {
    const plan = planCotizacion()
    cotizar.textContent =
      equipoListoParaCotizar() && plan
        ? `Desde ${formatearMoneda(cuotaDePlan(plan))}/mes`
        : 'Completá tu equipo'
  }

  const datos = document.querySelector('#datos-resumen-mobile')
  if (datos) {
    const plan = planActual()
    datos.textContent = plan ? `${plan.nombre} · ${formatearMoneda(cuotaDePlan(plan))}/mes` : '—'
  }
}

/**
 * Resumen compacto del pie de la pantalla de planes.
 */
export function renderPlanMobile() {
  const plan = planActual()
  const nombre = document.querySelector('#plan-mobile-nombre')
  const precio = document.querySelector('#plan-mobile-precio')
  if (!nombre || !precio) return

  if (!plan) {
    nombre.textContent = 'Elegí un plan'
    precio.textContent = '—'
    return
  }

  nombre.textContent = `Plan ${plan.nombre}`
  precio.innerHTML = `${formatearMoneda(cuotaDePlan(plan))} <span class="text-xs font-medium text-muted-ink">/ mes</span>`
}

/**
 * Resumen compacto que aparece arriba del formulario de pago en mobile.
 */
export function renderPagoMobile() {
  const contenedor = document.querySelector('#pago-resumen-mobile')
  const total = document.querySelector('#pago-total-mobile')
  if (!contenedor || !total) return

  const plan = planActual()
  const cuota = cuotaDePlan(plan)

  contenedor.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <span class="text-xs font-medium text-muted-ink">Seguro</span>
      <span class="text-xs font-semibold text-ink">Celular</span>
    </div>
    <div class="mt-2 flex items-center justify-between gap-3">
      <span class="text-xs font-medium text-muted-ink">Equipo</span>
      <span class="text-xs font-semibold text-ink">${esc(equipoTexto())}</span>
    </div>
    <div class="mt-2 flex items-center justify-between gap-3">
      <span class="text-xs font-medium text-muted-ink">Plan</span>
      <span class="text-xs font-semibold text-ink">${plan ? esc(plan.nombre) : '—'}</span>
    </div>
    <div class="mt-2 flex items-center justify-between gap-3">
      <span class="text-xs font-medium text-muted-ink">Titular</span>
      <span class="text-xs font-semibold text-ink">${esc(titularTexto())}</span>
    </div>
  `
  total.textContent = formatearMoneda(cuota)
}

/**
 * Pinta la pantalla de éxito.
 */
export function renderExito() {
  const nombre = document.querySelector('#exito-nombre')
  const email = document.querySelector('#exito-email')
  const poliza = document.querySelector('#exito-poliza')
  const detalle = document.querySelector('#exito-detalle')
  if (!nombre || !email || !poliza || !detalle) return

  const plan = planActual()
  const cuota = cuotaDePlan(plan)

  nombre.textContent = solicitud.titular.nombre || '—'
  email.textContent = solicitud.titular.email || '—'
  poliza.textContent = solicitud.poliza?.numero || '—'

  const filas = [
    ['Equipo', esc(equipoTexto())],
    ['Plan', plan ? esc(plan.nombre) : '—'],
    ['Cuota mensual', `${formatearMoneda(cuota)}`],
    ['Vigencia desde', esc(solicitud.poliza?.vigencia || '—')],
  ]

  detalle.innerHTML = filas
    .map(
      ([etiqueta, valor]) => `
        <div class="summary-row">
          <span class="summary-label">${etiqueta}</span>
          <span class="summary-value">${valor}</span>
        </div>
      `,
    )
    .join('')
}

/**
 * Pinta la pantalla de error de pago.
 */
export function renderError() {
  const motivo = document.querySelector('#error-motivo')
  if (motivo) {
    motivo.textContent =
      metadata.motivoPago || 'El banco rechazó la tarjeta. Probá con otro medio de pago o reintentá.'
  }
}

/**
 * Muestra u oculta las secciones según el paso actual.
 */
export function renderSecciones() {
  document.querySelectorAll('[data-paso]').forEach((seccion) => {
    seccion.hidden = Number(seccion.dataset.paso) !== solicitud.paso
  })
}

/**
 * Barra superior de mobile.
 */
export function renderTopbar() {
  const topbar = document.querySelector('#mobile-topbar')
  if (!topbar) return

  if (solicitud.paso >= 5) {
    topbar.hidden = true
    topbar.innerHTML = ''
    return
  }

  topbar.hidden = false

  if (solicitud.paso === 0) {
    topbar.innerHTML = `
      <div class="flex h-14 items-center justify-between bg-white px-5">
        <a href="#" data-action="inicio" class="flex items-center gap-2" aria-label="Cubrí, inicio">
          <span class="inline-flex size-7 items-center justify-center rounded-lg bg-brand text-white shadow-sm shadow-brand/30">
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span class="text-lg font-extrabold tracking-tight text-ink">cubrí</span>
        </a>
        <a href="#" data-variant="ghost" class="btn btn-ghost" aria-label="Mi cuenta">${icon('user', 'size-5')}</a>
      </div>
    `
    return
  }

  topbar.innerHTML = `
    <div class="flex h-14 items-center gap-2 bg-white px-5">
      <button type="button" data-action="volver" data-variant="ghost" class="btn btn-ghost -ml-2" aria-label="Volver">${icon('arrowLeft', 'size-5')}</button>
      <h2 class="text-[15px] font-bold text-ink">${TITULOS_MOBILE[solicitud.paso] ?? ''}</h2>
    </div>
  `
}

/**
 * Cabecera de checkout con título y stepper.
 */
export function renderCheckoutHeader() {
  const header = document.querySelector('#checkout-header')
  const titulo = document.querySelector('#checkout-title')
  if (!header || !titulo) return

  const dentroCheckout = solicitud.paso >= 1 && solicitud.paso <= 4
  header.hidden = !dentroCheckout
  if (!dentroCheckout) return

  titulo.textContent = TITULOS_PASO[solicitud.paso] ?? ''
}

/**
 * Stepper de 4 pasos.
 */
export function renderStepper() {
  const contenedor = document.querySelector('#stepper')
  if (!contenedor) return

  contenedor.innerHTML = PASOS.map((paso, indice) => {
    const estado =
      solicitud.paso > paso.numero ? 'completado' : solicitud.paso === paso.numero ? 'activo' : 'pendiente'

    const dotClass =
      estado === 'completado'
        ? 'bg-success text-white'
        : estado === 'activo'
          ? 'bg-brand text-white'
          : 'border border-line bg-white text-slate-400'

    const labelClass =
      estado === 'completado'
        ? 'text-success'
        : estado === 'activo'
          ? 'text-brand'
          : 'text-muted-ink'

    const barra =
      indice < PASOS.length - 1
        ? `<span class="mx-2 h-0.5 flex-1 rounded-full ${solicitud.paso > paso.numero ? 'bg-success' : 'bg-line'}"></span>`
        : ''

    return `
      <div class="flex shrink-0 items-center gap-1.5">
        <span class="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${dotClass}">
          ${estado === 'completado' ? icon('check', 'size-3') : paso.numero}
        </span>
        <span class="whitespace-nowrap text-[11px] font-semibold lg:text-xs ${labelClass}">${paso.etiqueta}</span>
      </div>
      ${barra}
    `
  }).join('')
}

/**
 * Completa los formularios con el estado actual.
 */
export function fillForms() {
  const marca = document.querySelector('#marca')
  const modelo = document.querySelector('#modelo')
  const valor = document.querySelector('#valor')
  const nacimiento = document.querySelector('#nacimiento')

  if (marca) marca.value = solicitud.equipo.marca
  if (modelo) modelo.value = solicitud.equipo.modelo
  if (valor) valor.value = formatearValorInput(solicitud.equipo.valor)

  document.querySelectorAll('input[name="antiguedad"]').forEach((input) => {
    input.checked = input.value === solicitud.equipo.antiguedad
  })

  const camposTitular = {
    '#nombre': solicitud.titular.nombre,
    '#apellido': solicitud.titular.apellido,
    '#dni': solicitud.titular.dni,
    '#nacimiento': solicitud.titular.nacimiento,
    '#email': solicitud.titular.email,
    '#celular': solicitud.titular.celular,
  }

  Object.entries(camposTitular).forEach(([selector, value]) => {
    const input = document.querySelector(selector)
    if (input) input.value = value
  })

  const terminos = document.querySelector('#terminos')
  if (terminos) terminos.checked = solicitud.titular.terminos

  if (nacimiento) {
    nacimiento.max = fechaMaximaNacimiento()
    nacimiento.min = '1900-01-01'
  }

  document.querySelectorAll('input[name="metodo"]').forEach((input) => {
    input.checked = input.value === solicitud.pago.metodo
  })
  document.querySelectorAll('.pay-method').forEach((label) => {
    label.dataset.selected = String(label.dataset.metodo === solicitud.pago.metodo)
  })

  const tarjeta = document.querySelector('#tarjeta')
  const vencimiento = document.querySelector('#vencimiento')
  const cvv = document.querySelector('#cvv')
  const titularTarjeta = document.querySelector('#titular-tarjeta')

  if (tarjeta) tarjeta.value = formatearTarjeta(solicitud.pago.tarjeta)
  if (vencimiento) vencimiento.value = solicitud.pago.vencimiento
  if (cvv) cvv.value = solicitud.pago.cvv
  if (titularTarjeta) titularTarjeta.value = solicitud.pago.titular

  renderSeleccionPlan()
}

/**
 * @param {string} digitos
 * @returns {string}
 */
export function formatearTarjeta(digitos) {
  return soloDigitos(digitos).slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Habilita o deshabilita los botones de cada paso.
 */
export function renderBotones() {
  const erroresCotizar = validarEquipo(solicitud)
  const erroresDatos = validarTitular(solicitud)
  const erroresPago = validarPago(solicitud)

  document.querySelectorAll('[data-submit="cotizar"]').forEach((boton) => {
    boton.disabled = hayErrores(erroresCotizar)
  })

  document.querySelectorAll('[data-submit="datos"]').forEach((boton) => {
    boton.disabled = hayErrores(erroresDatos)
  })

  document.querySelectorAll('[data-submit="pago"]').forEach((boton) => {
    boton.disabled = hayErrores(erroresPago) || metadata.procesando
    boton.textContent = metadata.procesando ? 'Procesando...' : 'Pagar y contratar'
  })

  document.querySelectorAll('[data-submit="plan"]').forEach((boton) => {
    boton.disabled = metadata.cargando || Boolean(metadata.error) || !planActual()
  })
}

/**
 * Pinta los errores de validación de un paso.
 * @param {Record<string, string|null>} errores
 * @param {Set<string>} tocados
 * @param {boolean} mostrarTodos
 */
export function renderErrores(errores, tocados, mostrarTodos = false) {
  document.querySelectorAll('[data-error-for]').forEach((parrafo) => {
    const campo = parrafo.dataset.errorFor ?? ''
    const mensaje = errores[campo]
    const visible = Boolean(mensaje) && (mostrarTodos || tocados.has(campo))
    const errorId = `error-${campo.replace(/\./g, '-')}`

    parrafo.id = errorId
    parrafo.setAttribute('role', 'alert')
    parrafo.textContent = visible ? mensaje : ''
    parrafo.hidden = !visible

    const wrapper = document.querySelector(`[data-field="${campo}"]`)
    if (!wrapper) return

    if (visible) wrapper.dataset.invalid = 'true'
    else delete wrapper.dataset.invalid

    wrapper.querySelectorAll('input, select').forEach((control) => {
      control.setAttribute('aria-invalid', String(visible))
      if (visible) control.setAttribute('aria-describedby', errorId)
      else control.removeAttribute('aria-describedby')
    })
  })
}

/**
 * Renderiza todo lo que depende del estado.
 */
export function render() {
  renderSecciones()
  renderTopbar()
  renderCheckoutHeader()
  renderStepper()
  renderProductos()
  renderPlanes()
  renderResumen()
  renderPlanMobile()
  renderPagoMobile()
  renderExito()
  renderError()
  renderBotones()
  fillForms()

  const errores = validarPaso(solicitud.paso, solicitud)
  renderErrores(errores, new Set(), false)

  window.scrollTo({ top: 0, behavior: 'auto' })
}

/**
 * Vuelve a pintar solo las partes que dependen de los inputs.
 */
export function renderEnVivo() {
  renderResumen()
  renderPreciosPlanes()
  renderPlanMobile()
  renderPagoMobile()
  renderBotones()
}

export { camposDePaso }
