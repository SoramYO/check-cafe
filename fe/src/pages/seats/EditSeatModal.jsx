import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import * as Icons from "react-icons/tb";

const EditSeatModal = ({ isOpen, onClose, seat, onUpdate }) => {
  const [editedSeat, setEditedSeat] = useState({
    seatNumber: "",
    capacity: "",
    type: "",
    location: "",
    status: "",
    isVIP: false,
    isAccessible: false,
    isOutdoor: false,
    isReserved: false,
    notes: ""
  });

  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (seat) {
      setEditedSeat({
        ...seat
      });

      setSelectedType(seat.type);
      setSelectedLocation(seat.location);
      setSelectedStatus(seat.status);
    }
  }, [seat]);

  if (!seat) return null;

  const handleInputChange = (key, value) => {
    setEditedSeat({
      ...editedSeat,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setEditedSeat({
      ...editedSeat,
      [key]: checked
    });
  };

  const typeOptions = [
    { value: "Table", label: "Table" },
    { value: "Booth", label: "Booth" },
    { value: "Bar", label: "Bar" },
    { value: "Counter", label: "Counter" },
    { value: "Patio", label: "Patio" }
  ];

  const locationOptions = [
    { value: "Main Dining Area", label: "Main Dining Area" },
    { value: "Private Room", label: "Private Room" },
    { value: "Outdoor", label: "Outdoor" },
    { value: "Bar Area", label: "Bar Area" },
    { value: "Window Seating", label: "Window Seating" }
  ];

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Reserved", label: "Reserved" }
  ];

  const handleTypeSelect = (selectedOption) => {
    setSelectedType(selectedOption.label);
    handleInputChange("type", selectedOption.label);
  };

  const handleLocationSelect = (selectedOption) => {
    setSelectedLocation(selectedOption.label);
    handleInputChange("location", selectedOption.label);
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedStatus(selectedOption.label);
    handleInputChange("status", selectedOption.label);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the seat
    // For this example, we'll just call the onUpdate function with the edited data
    onUpdate(editedSeat);
    onClose();
  };

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Edit Seat</h2>
      </div>
      <div className="modal-body">
        <div className="edit-section">
          <h3>Seat Information</h3>
          <div className="row">
            <div className="column">
              <Input
                type="text"
                label="Seat Number"
                placeholder="Enter seat number"
                value={editedSeat.seatNumber}
                onChange={(value) => handleInputChange("seatNumber", value)}
                icon={<Icons.TbChair />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Input
                type="number"
                label="Capacity"
                placeholder="Enter capacity"
                value={editedSeat.capacity}
                onChange={(value) => handleInputChange("capacity", value)}
                icon={<Icons.TbUsers />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Dropdown
                label="Type"
                placeholder="Select type"
                options={typeOptions}
                selectedValue={selectedType}
                onClick={handleTypeSelect}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Dropdown
                label="Location"
                placeholder="Select location"
                options={locationOptions}
                selectedValue={selectedLocation}
                onClick={handleLocationSelect}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Dropdown
                label="Status"
                placeholder="Select status"
                options={statusOptions}
                selectedValue={selectedStatus}
                onClick={handleStatusSelect}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Features</h3>
          <div className="row">
            <div className="column features-grid">
              <CheckBox
                id="edit_isVIP"
                label="VIP Seating"
                isChecked={editedSeat.isVIP}
                onChange={(isChecked) => handleCheckboxChange("isVIP", isChecked)}
              />
              <CheckBox
                id="edit_isAccessible"
                label="Wheelchair Accessible"
                isChecked={editedSeat.isAccessible}
                onChange={(isChecked) => handleCheckboxChange("isAccessible", isChecked)}
              />
              <CheckBox
                id="edit_isOutdoor"
                label="Outdoor Seating"
                isChecked={editedSeat.isOutdoor}
                onChange={(isChecked) => handleCheckboxChange("isOutdoor", isChecked)}
              />
              <CheckBox
                id="edit_isReserved"
                label="Currently Reserved"
                isChecked={editedSeat.isReserved}
                onChange={(isChecked) => handleCheckboxChange("isReserved", isChecked)}
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
                placeholder="Enter any additional notes about this seat"
                value={editedSeat.notes}
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

export default EditSeatModal; 