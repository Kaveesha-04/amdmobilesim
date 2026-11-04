import { ActiveModeContent } from '../components/dashboard/ActiveModeContent'
import { ModeSelector } from '../components/dashboard/ModeSelector'

export function DashboardPage() {
  return (
    <>
      <ModeSelector />
      <ActiveModeContent />
    </>
  )
}
