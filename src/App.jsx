import './App.css'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

export default function App() {
  
  const navigate = useNavigate()

  const continueClick = () => {
    navigate('/loyalty')
  }
  
  return (
    <div className={styles.Container}>
      <h1>Welcome to The Interactive Modern Portfolio Theory Simulator</h1>
      <button className={styles.Button} onClick={continueClick}>Begin</button>
    </div>
  );
}
