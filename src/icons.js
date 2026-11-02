const stroke = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'

/**
 * Devuelve un SVG inline para los iconos de la interfaz.
 * @param {string} name
 * @param {string} [className]
 * @returns {string}
 */
export function icon(name, className = 'size-5') {
  const icons = {
    phone: `<rect x="7" y="2.5" width="10" height="19" rx="2.5" ${stroke}/><path d="M10.5 5.5h3" ${stroke}/>`,
    home: `<path d="m3 10.5 9-7 9 7" ${stroke}/><path d="M5 9.5V21h14V9.5" ${stroke}/><path d="M9.5 21v-6h5v6" ${stroke}/>`,
    bike: `<circle cx="5.5" cy="17.5" r="3.5" ${stroke}/><circle cx="18.5" cy="17.5" r="3.5" ${stroke}/><path d="m6 17.5 4-8h5l3.5 8M10 9.5h5M13.5 5.5h3l2 4" ${stroke}/>`,
    plane: `<path d="M21 16.5 3 21l4.5-9L3 3l18 4.5-6 4.5 6 4.5Z" ${stroke}/><path d="m7.5 12 6.5 1" ${stroke}/>`,
    arrowLeft: `<path d="m15 18-6-6 6-6" ${stroke}/>`,
    arrowRight: `<path d="m9 18 6-6-6-6" ${stroke}/>`,
    check: `<path d="m5 12 4 4L19 6" ${stroke}/>`,
    checkCircle: `<circle cx="12" cy="12" r="9" ${stroke}/><path d="m8 12 2.5 2.5L16 9" ${stroke}/>`,
    x: `<path d="M6 6l12 12M18 6 6 18" ${stroke}/>`,
    alert: `<circle cx="12" cy="12" r="9" ${stroke}/><path d="M12 7.5v5M12 16.5h.01" ${stroke}/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" ${stroke}/><path d="m9 12 2 2 4-4" ${stroke}/>`,
    card: `<rect x="2.5" y="5" width="19" height="14" rx="2.5" ${stroke}/><path d="M2.5 10h19M6 15h4" ${stroke}/>`,
    lock: `<rect x="4.5" y="10" width="15" height="10.5" rx="2" ${stroke}/><path d="M8 10V7a4 4 0 0 1 8 0v3" ${stroke}/>`,
    download: `<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19.5h16" ${stroke}/>`,
    user: `<circle cx="12" cy="8" r="4" ${stroke}/><path d="M4.5 21a7.5 7.5 0 0 1 15 0" ${stroke}/>`,
    clock: `<circle cx="12" cy="12" r="9" ${stroke}/><path d="M12 7v5l3 2" ${stroke}/>`,
    spark: `<path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z" ${stroke}/>`,
    edit: `<path d="M4 20h4l10-10-4-4L4 16v4Z" ${stroke}/><path d="m13.5 6.5 4 4" ${stroke}/>`,
  }

  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] ?? icons.phone}</svg>`
}

export const logoMark = `
  <span class="inline-flex size-7 items-center justify-center rounded-lg bg-brand text-white shadow-sm shadow-brand/30">
    <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  </span>
`
