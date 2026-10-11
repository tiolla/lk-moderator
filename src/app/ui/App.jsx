import { useStore } from '@/shared/model/store.js'
import { QueuePage } from '@/pages/queue'
import { CardPage } from '@/pages/card'
import { PeoplePage } from '@/pages/people'
import { StudiesPage } from '@/pages/studies'
import { SummaryPage } from '@/pages/summary'
import { Header } from '@/widgets/header'
import { Toasts } from '@/widgets/toasts'
import { DemoFab, DemoPanel } from '@/widgets/demo-panel'
import { useAfterRender } from '../model/after-render.js'
import { useKeyboardShortcuts } from '../model/keyboard.js'
import { ModalHost } from './ModalHost.jsx'

const DEMO = import.meta.env.VITE_DEMO !== 'off'

function Screen() {
  const screen = useStore((s) => s.screen)
  const soon = useStore((s) => s.soon)
  if (screen === 'queue') return <QueuePage />
  if (screen === 'people') return <PeoplePage />
  if (screen === 'soon') return soon === 'studies' ? <StudiesPage /> : <SummaryPage />
  return <CardPage />
}

export function App() {
  useAfterRender()
  useKeyboardShortcuts()
  return (
    <>
      <Header />
      <main className="m-wrap" id="app"><Screen /></main>
      <Toasts />
      <ModalHost />
      {DEMO && <><DemoFab /><DemoPanel /></>}
    </>
  )
}
