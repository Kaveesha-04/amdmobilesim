import { SimulatorShell } from './components/shell/SimulatorShell'
import { ModeProvider } from './stores/ModeProvider'

export default function App() {
  return (
    <ModeProvider>
      <SimulatorShell />
    </ModeProvider>
  )
}
