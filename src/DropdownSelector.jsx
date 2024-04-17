import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './DropdownSelector.module.css'

const MultiSelectDropdown = ({ data, setDataset }) => {
  const categories = [...new Set(data.map(item => item.Category))];

  const [selectedOptions, setSelectedOptions] = useState({});

  const handleSelectChange = (category, selectedOptions) => {
    setSelectedOptions(prevSelectedOptions => ({
      ...prevSelectedOptions,
      [category]: selectedOptions
    }));
  };

  useEffect(() => {
    setDataset(selectedOptions);
  }, [selectedOptions, setDataset]);

  return (
    <div>
      {categories.map(category => (
        <div key={category} className={styles.DropdownContainer}>
          <h3>{category}</h3>
          <Select
            isMulti
            value={selectedOptions[category] || []}
            onChange={selectedOptions => handleSelectChange(category, selectedOptions)}
            options={data
              .filter(item => item.Category === category)
              .map(item => ({
                value: item.Symbol,
                label: item.Combined,
              }))
            }
          />
        </div>
      ))}
    </div>
  );
};

export default MultiSelectDropdown;
