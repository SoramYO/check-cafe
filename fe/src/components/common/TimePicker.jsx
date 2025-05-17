import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TimePicker = ({ 
  onChange, 
  className, 
  label, 
  valid, 
  icon, 
  value,
  placeholder = "Select time",
  minTime,
  maxTime,
  timeIntervals = 15,
  showTimeSelectOnly = true,
  timeCaption = "Time"
}) => {
  const [selectedTime, setSelectedTime] = useState(value || null);

  useEffect(() => {
    if (value !== undefined && value !== selectedTime) {
      setSelectedTime(value);
    }
  }, [value]);

  const handleTimeChange = (time) => {
    setSelectedTime(time);
    if (onChange) {
      onChange(time);
    }
  };

  return (
    <div className={`input_field calendar ${className || ""}`}>
      {label && <label htmlFor={label}>{label}</label>}
      {icon && <label htmlFor={label} className="input_icon">{icon}</label>}
      <ReactDatePicker
        className="calendar_input"
        selected={selectedTime}
        onChange={handleTimeChange}
        showTimeSelect
        showTimeSelectOnly={showTimeSelectOnly}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        dateFormat="h:mm aa"
        minTime={minTime || null}
        maxTime={maxTime || null}
        isClearable
        placeholderText={placeholder}
      />
      {valid && <small>{valid}</small>}
    </div>
  );
};

export default TimePicker; 