import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import * as Icons from "react-icons/tb";

const EditTimeSlotModal = ({ isOpen, onClose, timeSlot, onUpdate }) => {
  const [editedTimeSlot, setEditedTimeSlot] = useState({
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

  const [selectedDay, setSelectedDay] = useState("");

  useEffect(() => {
    if (timeSlot) {
      setEditedTimeSlot({
        ...timeSlot
      });

      setSelectedDay(timeSlot.day);
    }
  }, [timeSlot]);

  if (!timeSlot) return null;

  const handleInputChange = (key, value) => {
    setEditedTimeSlot({
      ...editedTimeSlot,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setEditedTimeSlot({
      ...editedTimeSlot,
      [key]: checked
    });
  };

  const dayOptions = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" }
  ];

  const handleDaySelect = (selectedOption) => {
    setSelectedDay(selectedOption.label);
    handleInputChange("day", selectedOption.label);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the time slot
    // For this example, we'll just call the onUpdate function with the edited data
    onUpdate(editedTimeSlot);
    onClose();
  };

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Edit Time Slot</h2>
      </div>
      <div className="modal-body">
        <div className="edit-section">
          <h3>Time Information</h3>
          <div className="row">
            <div className="column">
              <Dropdown
                label="Day"
                placeholder="Select day"
                options={dayOptions}
                selectedValue={selectedDay}
                onClick={handleDaySelect}
              />
            </div>
          </div>
          <div className="row">
            <div className="column_2">
              <Input
                type="time"
                label="Start Time"
                placeholder="Select start time"
                value={editedTimeSlot.startTime}
                onChange={(value) => handleInputChange("startTime", value)}
                icon={<Icons.TbClock />}
              />
            </div>
            <div className="column_2">
              <Input
                type="time"
                label="End Time"
                placeholder="Select end time"
                value={editedTimeSlot.endTime}
                onChange={(value) => handleInputChange("endTime", value)}
                icon={<Icons.TbClock />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Input
                type="number"
                label="Capacity"
                placeholder="Enter capacity"
                value={editedTimeSlot.capacity}
                onChange={(value) => handleInputChange("capacity", value)}
                icon={<Icons.TbUsers />}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Features</h3>
          <div className="row">
            <div className="column features-grid">
              <CheckBox
                id="edit_isActive"
                label="Active"
                isChecked={editedTimeSlot.isActive}
                onChange={(isChecked) => handleCheckboxChange("isActive", isChecked)}
              />
              <CheckBox
                id="edit_isReservable"
                label="Available for Reservations"
                isChecked={editedTimeSlot.isReservable}
                onChange={(isChecked) => handleCheckboxChange("isReservable", isChecked)}
              />
              <CheckBox
                id="edit_isPeakHour"
                label="Peak Hour"
                isChecked={editedTimeSlot.isPeakHour}
                onChange={(isChecked) => handleCheckboxChange("isPeakHour", isChecked)}
              />
              <CheckBox
                id="edit_isRecurring"
                label="Recurring Weekly"
                isChecked={editedTimeSlot.isRecurring}
                onChange={(isChecked) => handleCheckboxChange("isRecurring", isChecked)}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Additional Notes</h3>
          <div className="row">
            <div className="column">
              <Textarea
                label="Notes"
                placeholder="Enter any additional notes about this time slot"
                value={editedTimeSlot.notes}
                onChange={(value) => handleInputChange("notes", value)}
                icon={<Icons.TbNotes />}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <Button
          label="Cancel"
          className="outline"
          icon={<Icons.TbX />}
          onClick={onClose}
        />
        <Button
          label="Save"
          className="success"
          icon={<Icons.TbCheck />}
          onClick={handleSave}
        />
      </div>

      <style jsx>{`
        .edit-section {
          margin-bottom: 20px;
        }
        .edit-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .row {
          margin-bottom: 15px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      `}</style>
    </Modal>
  );
};

export default EditTimeSlotModal; 