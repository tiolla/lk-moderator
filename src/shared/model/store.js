import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const useStore = create(immer(() => ({ renderTick: 0 })))

export const getState = () => useStore.getState()

const hooks = { beforeRender: null, reconcile: null }

export function configureStore({ beforeRender, reconcile }) {
  hooks.beforeRender = beforeRender
  hooks.reconcile = reconcile
}

export function update(recipe, { render = true } = {}) {
  if (render && hooks.beforeRender) hooks.beforeRender()
  useStore.setState((draft) => {
    recipe(draft)
    if (render) {
      if (hooks.reconcile) hooks.reconcile(draft)
      draft.renderTick += 1
    }
  })
}
