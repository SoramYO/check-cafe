import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import * as Icons from "react-icons/tb";

const EditReservationModal = ({ isOpen, onClose, reservation, onUpdate }) => {
  const [editedReservation, setEditedReservation] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    time: "",
    partySize: "",
    tableId: "",
    status: "",
    specialRequests: "",
  });

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    if (reservation) {
      setEditedReservation({
        ...reservation,
      });

      setSelectedStatus(reservation.status);
      setSelectedTable(reservation.tableId);
    }
  }, [reservation]);

  if (!reservation) return null;

  const handleInputChange = (key, value) => {
    setEditedReservation({
      ...editedReservation,
      [key]: value,
    });
  };

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Completed", label: "Completed" },
  ];

  const tableOptions = [
    { value: "Table 1", label: "Table 1" },
    { value: "Table 2", label: "Table 2" },
    { value: "Table 3", label: "Table 3" },
    { value: "Table 4", label: "Table 4" },
    { value: "Table 5", label: "Table 5" },
  ];

  const handleStatusSelect = (selectedOption) => {
    setSelectedStatus(selectedOption.label);
    handleInputChange("status", selectedOption.label);
  };

  const handleTableSelect = (selectedOption) => {
    setSelectedTable(selectedOption.label);
    handleInputChange("tableId", selectedOption.label);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the reservation
    // For this example, we'll just call the onUpdate function with the edited data
    onUpdate(editedReservation);
    onClose();
  };

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Edit Reservation</h2>
      </div>
      <div className="modal-body">
        <div className="edit-section">
          <h3>Customer Information</h3>
          <div className="row">
            <div className="column">
              <Input
                type="text"
                label="Customer Name"
                placeholder="Enter customer name"
                value={editedReservation.customerName}
                onChange={(value) => handleInputChange("customerName", value)}
                icon={<Icons.TbUser />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Input
                type="email"
                label="Customer Email"
                placeholder="Enter customer email"
                value={editedReservation.customerEmail}
                onChange={(value) => handleInputChange("customerEmail", value)}
                icon={<Icons.TbMail />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Input
                type="tel"
                label="Customer Phone"
                placeholder="Enter customer phone"
                value={editedReservation.customerPhone}
                onChange={(value) => handleInputChange("customerPhone", value)}
                icon={<Icons.TbPhone />}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Reservation Details</h3>
          <div className="row">
            <div className="column_2">
              <Input
                type="date"
                label="Date"
                value={editedReservation.date}
                onChange={(value) => handleInputChange("date", value)}
                icon={<Icons.TbCalendar />}
              />
            </div>
            <div className="column_2">
              <Input
                type="time"
                label="Time"
                value={editedReservation.time}
                onChange={(value) => handleInputChange("time", value)}
                icon={<Icons.TbClock />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column_2">
              <Input
                type="number"
                label="Party Size"
                placeholder="Enter party size"
                value={editedReservation.partySize}
                onChange={(value) => handleInputChange("partySize", value)}
                icon={<Icons.TbUsers />}
              />
            </div>
            <div className="column_2">
              <Dropdown
                label="Table"
                placeholder="Select table"
                options={tableOptions}
                selectedValue={selectedTable}
                onClick={handleTableSelect}
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
          <div className="row">
            <div className="column">
              <Textarea
                label="Special Requests"
                placeholder="Enter any special requests"
                value={editedReservation.specialRequests}
                onChange={(value) => handleInputChange("specialRequests", value)}
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
      `}</style>
    </Modal>
  );
};

export default EditReservationModal; 