import * as Icons from "react-icons/tb";
import React, { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import FileUpload from "../../components/common/FileUpload.jsx";

const AddSeat = () => {
  const [seat, setSeat] = useState({
    seatNumber: "",
    capacity: "",
    type: "",
    location: "",
    status: "",
    isReserved: false,
    isVIP: false,
    isAccessible: false,
    isOutdoor: false,
    notes: ""
  });

  const [selectedValue, setSelectedValue] = useState({
    type: "",
    location: "",
    status: ""
  });

  const seatTypeOptions = [
    { value: "table", label: "Table" },
    { value: "booth", label: "Booth" },
    { value: "bar", label: "Bar" },
    { value: "counter", label: "Counter" },
    { value: "patio", label: "Patio" }
  ];

  const locationOptions = [
    { value: "main", label: "Main Dining Area" },
    { value: "private", label: "Private Room" },
    { value: "outdoor", label: "Outdoor" },
    { value: "bar", label: "Bar Area" },
    { value: "window", label: "Window Seating" }
  ];

  const statusOptions = [
    { value: "available", label: "Available" },
    { value: "maintenance", label: "Maintenance" },
    { value: "reserved", label: "Reserved" }
  ];

  const handleInputChange = (key, value) => {
    setSeat({
      ...seat,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setSeat({
      ...seat,
      [key]: checked
    });
  };

  const handleTypeSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      type: selectedOption.label
    });
    setSeat({
      ...seat,
      type: selectedOption.value
    });
  };

  const handleLocationSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      location: selectedOption.label
    });
    setSeat({
      ...seat,
      location: selectedOption.value
    });
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      status: selectedOption.label
    });
    setSeat({
      ...seat,
      status: selectedOption.value
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Seat Information</h2>
              <div className="column_2">
                <Input
                  type="text"
                  placeholder="Enter seat number"
                  label="Seat Number"
                  icon={<Icons.TbChair />}
                  value={seat.seatNumber}
                  onChange={(value) => handleInputChange("seatNumber", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter capacity"
                  label="Capacity"
                  icon={<Icons.TbUsers />}
                  value={seat.capacity}
                  onChange={(value) => handleInputChange("capacity", value)}
                />
              </div>
              <div className="column_3">
                <Dropdown
                  placeholder="Select seat type"
                  label="Seat Type"
                  selectedValue={selectedValue.type}
                  onClick={handleTypeSelect}
                  options={seatTypeOptions}
                />
              </div>
              <div className="column_3">
                <Dropdown
                  placeholder="Select location"
                  label="Location"
                  selectedValue={selectedValue.location}
                  onClick={handleLocationSelect}
                  options={locationOptions}
                />
              </div>
              <div className="column_3">
                <Dropdown
                  placeholder="Select status"
                  label="Status"
                  selectedValue={selectedValue.status}
                  onClick={handleStatusSelect}
                  options={statusOptions}
                />
              </div>
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Seat Image</h2>
              <FileUpload />
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Additional Notes</h2>
              <div className="column">
                <Textarea
                  placeholder="Enter any additional notes about this seat"
                  label="Notes"
                  icon={<Icons.TbNotes />}
                  value={seat.notes}
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
              <h2 className="sub_heading">Seat Features</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="isVIP"
                  label="VIP Seating"
                  isChecked={seat.isVIP}
                  onChange={(isChecked) => handleCheckboxChange("isVIP", isChecked)}
                />
                <CheckBox
                  id="isAccessible"
                  label="Wheelchair Accessible"
                  isChecked={seat.isAccessible}
                  onChange={(isChecked) => handleCheckboxChange("isAccessible", isChecked)}
                />
                <CheckBox
                  id="isOutdoor"
                  label="Outdoor Seating"
                  isChecked={seat.isOutdoor}
                  onChange={(isChecked) => handleCheckboxChange("isOutdoor", isChecked)}
                />
                <CheckBox
                  id="isReserved"
                  label="Currently Reserved"
                  isChecked={seat.isReserved}
                  onChange={(isChecked) => handleCheckboxChange("isReserved", isChecked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddSeat; 