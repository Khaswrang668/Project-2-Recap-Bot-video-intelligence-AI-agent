import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <nav className="nav-bar">
     <div className='brand'>
      <img className='brandLogo' src="./src/assets/logo.png" alt="website logo" width="40" height="40" />
      <span className='brandName'>Recapbot.ai</span>
     </div>
     <div className="navBtns">
      <div className="Login">
      Login
      </div>
      <div className="Sign Up">
      Sign Up
      </div>
     </div>
    </nav>

     <div className='chatField'>
      <span className='chats'>chat messagess</span>
      <form action="submit" className='inputField'>
      <textarea type="text" className='messageBox' placeholder='Type your message here'/>
      <button className='messageBtn' >
      <span className='arrowHead' width='30' height='30'>🡩</span>
      </button>
      </form>

     </div>
    </>
  )
}

export default App
