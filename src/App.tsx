import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ModeProvider } from './stores/ModeProvider'

export default function App() {
  return (
    <ModeProvider>
      <AppLayout>
        <DashboardPage />
      </AppLayout>
    </ModeProvider>
  )
}
