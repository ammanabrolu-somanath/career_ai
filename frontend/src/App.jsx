import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Recommendation from './pages/Recommendation'
import StudentLookup from './pages/StudentLookup'
import GraphAlgorithms from './pages/GraphAlgorithms'
import CareerExplorer from './pages/CareerExplorer'
import CareerComparison from './pages/CareerComparison'
import SystemTesting from './pages/SystemTesting'
import GapAnalysis from './pages/GapAnalysis'
import './App.css'

const PAGES = {
  home: Home,
  recommendation: Recommendation,
  lookup: StudentLookup,
  graph: GraphAlgorithms,
  careers: CareerExplorer,
  compare: CareerComparison,
  testing: SystemTesting,
  gapanalysis: GapAnalysis,
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const CurrentPageComponent = PAGES[currentPage] ?? Home

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="page-container">
        <CurrentPageComponent onNavigate={setCurrentPage} />
      </main>
    </div>
  )
}

export default App
