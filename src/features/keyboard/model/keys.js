import { APP_KEY, safeStorage } from '@/shared/lib/storage.js'

export const KEYS = [
  ['↑ ↓', 'по списку очереди'], ['Enter', 'открыть заявку'], ['← →', 'предыдущая и следующая'],
  ['A', 'главное действие экрана: одобрить, передать врачу; когда всё сходится — сразу, без окна'], ['R', 'вернуть с замечаниями'], ['O', 'отложить'],
  ['Z', 'отменить последнее решение (10 секунд)'], ['Esc', 'закрыть окно'], ['?', 'этот список'],
]

const KEYS_KEY = APP_KEY + '-keys'
export const readKeysSetting = () => safeStorage.read(KEYS_KEY) !== '0'
export const saveKeysSetting = (on) => safeStorage.write(KEYS_KEY, on ? '1' : '0')
