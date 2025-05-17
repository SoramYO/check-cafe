import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePicker = ({ 
  onChange, 
  className, 
  label, 
  valid, 
  icon, 
  value, 
  placeholder = "Select a date",
  minDate,
  maxDate,
  showYearDropdown = false,
  showMonthDropdown = false
}) => {
  const [selectedDate, setSelectedDate] = useState(value || null);

  useEffect(() => {
    if (value !== undefined && value !== selectedDate) {
      setSelectedDate(value);
    }
  }, [value]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className={`input_field calendar ${className || ""}`}>
      {label && <label htmlFor={label}>{label}</label>}
      {icon && <label htmlFor={label} className="input_icon">{icon}</label>}
      <ReactDatePicker
        className="calendar_input"
        selected={selectedDate}
        onChange={handleDateChange}
        minDate={minDate || null}
        maxDate={maxDate || null}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        dropdownMode="select"
        isClearable
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
      />
      {valid && <small>{valid}</small>}
    </div>
  );
};

export default DatePicker; 