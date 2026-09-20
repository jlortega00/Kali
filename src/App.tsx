import { Navigate, Route, Routes } from 'react-router-dom'
import DesignPage from './pages/DesignPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/design" replace />} />
      <Route path="/design" element={<DesignPage />} />
    </Routes>
  )
}

export default App
