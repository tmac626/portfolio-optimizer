import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'
import MultiSelectDropdown from './DropdownSelector'
import { useNavigate } from 'react-router-dom'
import styles from './Loyalty.module.css'

function Loyalty() {

  const [data, setData] = useState()
  const [selectedBrands, setSelectedBrands] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      d3.csv('./sp_500_loyalty.csv')
    ]).then(function (files) {
      const csvData = files[0]
      setData(csvData)
    })

  }, [])

  // console.log(data)

  const setDataset = (data) => {
    setSelectedBrands(data);
  };

  if (data == null) {
    return <div>Loading...</div>
  }

  // console.log(selectedBrands)

  const continueClick = () => {
    var userBrands = []
    for (const [, value] of Object.entries(selectedBrands)) {
      value.forEach((brand) => {
        userBrands.push(brand.value)
      })
    }
    if (userBrands.length === 0) {
      userBrands = null
    }
    navigate('/visualization', { state: userBrands})
  }

  const skipClick = () => {
    navigate('/visualization')
  }

  return (
    <div>
      <div className={styles.Container}>
        <h1>Select Favorite Brands by Category</h1>
        <p>Pick any brand favorites from the S&P 500. This is optional and may be skipped below.</p>
        <MultiSelectDropdown data={data} setDataset={setDataset}></MultiSelectDropdown>
        <div className={styles.ButtonContainer}>
          <button className={styles.Button} onClick={continueClick}>Continue</button>
          <button className={styles.Button} onClick={skipClick}>Skip</button>
        </div>
      </div>
    </div>
  );
}

export default Loyalty;
