import { useLayoutEffect } from 'react'
import { getState, update, useStore } from '@/shared/model/store.js'
import { forgetFocus, restoreFocus } from '@/shared/lib/focus.js'

export function useAfterRender() {
  const renderTick = useStore((s) => s.renderTick)
  useLayoutEffect(() => {
    const s = getState()
    const title = document.querySelector('#app .m-h1')
    if (title) title.removeAttribute('tabindex')
    const step = document.querySelector('#app .m-step[data-on="1"]')
    if (step && step.parentNode.scrollWidth > step.parentNode.clientWidth) step.parentNode.scrollLeft = step.offsetLeft - 16
    document.body.classList.toggle('m-on-card', s.screen === 'card')
    document.body.style.overflow = s.modal ? 'hidden' : ''
    const win = document.querySelector('#overlay .m-modal') || document.querySelector('#overlay .m-viewer')
    if (win && !win.contains(document.activeElement) && !(s.modal && s.modal.focusInput)) {
      const target = win.querySelector('#m-modal-title') || win
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }
    if (s.note && !s.modal) {
      const field = document.querySelector('#app [data-comment="' + s.note + '"]')
      if (field) { field.focus(); field.setSelectionRange(field.value.length, field.value.length) }
    }
    if (s.modal) return
    if (s.focusTitle && s.screen === 'card') {
      forgetFocus()
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }) }
    } else {
      restoreFocus()
    }
    if (s.focusTitle) update((d) => { d.focusTitle = false }, { render: false })
  }, [renderTick])
}
