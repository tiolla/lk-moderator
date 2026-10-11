let focusKey = null

function keyOf(el) {
  if (!el || el === document.body || !el.getAttribute) return null
  const overlay = document.getElementById('overlay')
  if (overlay && overlay.contains(el)) return null
  if (el.id) return '#' + el.id
  const attr = [...el.attributes].find((x) => /^data-/.test(x.name) && !['data-on', 'data-st', 'data-state'].includes(x.name))
  return attr ? el.tagName.toLowerCase() + '[' + attr.name + '="' + String(attr.value).replace(/"/g, '\\"') + '"]' : null
}

export function rememberFocus() {
  try {
    const key = keyOf(document.activeElement)
    if (key) focusKey = key
  } catch {}
}

export function forgetFocus() {
  focusKey = null
}

export function restoreFocus() {
  try {
    const el = focusKey && document.querySelector(focusKey)
    if (el && el !== document.activeElement && !el.disabled) el.focus({ preventScroll: true })
  } catch {}
}
