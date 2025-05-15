import * as Icons from "react-icons/tb";
import React, { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Textarea from "../../components/common/Textarea.jsx";

const AddTimeSlot = () => {
  const [timeSlot, setTimeSlot] = useState({
    startTime: "",
    endTime: "",
    day: "",
    capacity: "",
    isActive: true,
    isReservable: true,
    isPeakHour: false,
    isRecurring: true,
    notes: ""
  });

  const [selectedValue, setSelectedValue] = useState({
    day: ""
  });

  const dayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  const handleInputChange = (key, value) => {
    setTimeSlot({
      ...timeSlot,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setTimeSlot({
      ...timeSlot,
      [key]: checked
    });
  };

  const handleDaySelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      day: selectedOption.label
    });
    setTimeSlot({
      ...timeSlot,
      day: selectedOption.value
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Time Slot Information</h2>
              <div className="column_2">
                <Input
                  type="time"
                  placeholder="Select start time"
                  label="Start Time"
                  icon={<Icons.TbClock />}
                  value={timeSlot.startTime}
                  onChange={(value) => handleInputChange("startTime", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="time"
                  placeholder="Select end time"
                  label="End Time"
                  icon={<Icons.TbClock />}
                  value={timeSlot.endTime}
                  onChange={(value) => handleInputChange("endTime", value)}
                />
              </div>
              <div className="column_2">
                <Dropdown
                  placeholder="Select day of week"
                  label="Day"
                  selectedValue={selectedValue.day}
                  onClick={handleDaySelect}
                  options={dayOptions}
                />
              </div>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter capacity"
                  label="Capacity"
                  icon={<Icons.TbUsers />}
                  value={timeSlot.capacity}
                  onChange={(value) => handleInputChange("capacity", value)}
                />
              </div>
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Additional Notes</h2>
              <div className="column">
                <Textarea
                  placeholder="Enter any additional notes about this time slot"
                  label="Notes"
                  icon={<Icons.TbNotes />}
                  value={timeSlot.notes}
                  onChange={(value) => handleInputChange("notes", value)}
                />
              </div>
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar_item">
              <h2 className="sub_heading">Publish</h2>
              <Button
                label="save & exit"
                icon={<Icons.TbDeviceFloppy />}
                className=""
              />
              <Button
                label="save"
                icon={<Icons.TbCircleCheck />}
                className="success"
              />
            </div>
            <div className="sidebar_item">
              <h2 className="sub_heading">Time Slot Options</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="isActive"
                  label="Active"
                  isChecked={timeSlot.isActive}
                  onChange={(isChecked) => handleCheckboxChange("isActive", isChecked)}
                />
                <CheckBox
                  id="isReservable"
                  label="Available for Reservations"
                  isChecked={timeSlot.isReservable}
                  onChange={(isChecked) => handleCheckboxChange("isReservable", isChecked)}
                />
                <CheckBox
                  id="isPeakHour"
                  label="Peak Hour"
                  isChecked={timeSlot.isPeakHour}
                  onChange={(isChecked) => handleCheckboxChange("isPeakHour", isChecked)}
                />
                <CheckBox
                  id="isRecurring"
                  label="Recurring Weekly"
                  isChecked={timeSlot.isRecurring}
                  onChange={(isChecked) => handleCheckboxChange("isRecurring", isChecked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddTimeSlot; 