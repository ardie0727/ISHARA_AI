import ParticlesBackground from './components/ParticlesBackground'
import Navbar from './Navbar'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Learn from './Learn'
import Translate from './Translate'
import Profile from './Profile'
import AboutUs from './AboutUs'
import Home from './Home'
function App() {

  return (
    <>
    <Router> 
      <ParticlesBackground/>
      <Navbar/>
      <div className="content">
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/aboutus" element={<AboutUs/>}/>
        <Route path="/learn" element={<Learn/>}/>
        <Route path="/translate" element={<Translate/>}/>
        <Route path="/profile" element={<Profile/>}/> 
      </Routes>
      
     
      </div>
      </Router>
    </>
  )
}

export default App
