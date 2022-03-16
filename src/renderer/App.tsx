import { Route, MemoryRouter as Router, Routes } from 'react-router-dom'

import icon from '../../assets/icon.svg'
import { Channels } from '../constants/Channels'
import './App.css'

const Hello = () => {
  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>xrengine-control-center</h1>
      <button onClick={() => window.electronAPI.invoke(Channels.Utilities.CopyClipboard, 'Hello XREngine')}>
        Test
      </button>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  )
}
