import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import FileUpload from "../../components/common/FileUpload.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import DatePicker from "../../components/common/DatePicker.jsx";
import TimePicker from "../../components/common/TimePicker.jsx";

const AddReservation = () => {
  const [reservation, setReservation] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    time: "",
    partySize: "",
    specialRequests: "",
    status: "",
    tableAssigned: "",
  });

  const [selectOptions, setSelectOptions] = useState([
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "confirmed",
      label: "Confirmed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ]);

  const [selectedValue, setSelectedValue] = useState({
    status: "",
    table: "",
  });

  const tableOptions = [
    { value: "table1", label: "Table 1" },
    { value: "table2", label: "Table 2" },
    { value: "table3", label: "Table 3" },
    { value: "table4", label: "Table 4" },
    { value: "table5", label: "Table 5" },
  ];

  const handleInputChange = (key, value) => {
    setReservation({
      ...reservation,
      [key]: value,
    });
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      status: selectedOption.label,
    });
    setReservation({
      ...reservation,
      status: selectedOption.value,
    });
  };

  const handleTableSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      table: selectedOption.label,
    });
    setReservation({
      ...reservation,
      tableAssigned: selectedOption.value,
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Reservation Info</h2>
              <div className="column_2">
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  label="Customer Name"
                  icon={<Icons.TbUser />}
                  value={reservation.customerName}
                  onChange={(value) => handleInputChange("customerName", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="email"
                  placeholder="Enter customer email"
                  label="Customer Email"
                  icon={<Icons.TbMail />}
                  value={reservation.customerEmail}
                  onChange={(value) => handleInputChange("customerEmail", value)}
                />
              </div>
              <div className="column">
                <Input
                  type="tel"
                  placeholder="Enter customer phone"
                  label="Customer Phone"
                  icon={<Icons.TbPhone />}
                  value={reservation.customerPhone}
                  onChange={(value) => handleInputChange("customerPhone", value)}
                />
              </div>
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Reservation Details</h2>
              <div className="column_3">
                <Input
                  type="date"
                  placeholder="Select date"
                  label="Date"
                  icon={<Icons.TbCalendar />}
                  value={reservation.date}
                  onChange={(value) => handleInputChange("date", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="time"
                  placeholder="Select time"
                  label="Time"
                  icon={<Icons.TbClock />}
                  value={reservation.time}
                  onChange={(value) => handleInputChange("time", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter party size"
                  label="Party Size"
                  icon={<Icons.TbUsers />}
                  value={reservation.partySize}
                  onChange={(value) => handleInputChange("partySize", value)}
                />
              </div>
              <div className="column">
                <Textarea
                  placeholder="Enter any special requests"
                  label="Special Requests"
                  icon={<Icons.TbNotes />}
                  value={reservation.specialRequests}
                  onChange={(value) => handleInputChange("specialRequests", value)}
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
              <h2 className="sub_heading">Reservation Status</h2>
              <div className="column">
                <Dropdown
                  placeholder="Select status"
                  selectedValue={selectedValue.status}
                  onClick={handleStatusSelect}
                  options={selectOptions}
                  className="sm"
                />
              </div>
            </div>
            <div className="sidebar_item">
              <h2 className="sub_heading">Table Assignment</h2>
              <div className="column">
                <Dropdown
                  placeholder="Select table"
                  selectedValue={selectedValue.table}
                  onClick={handleTableSelect}
                  options={tableOptions}
                  className="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddReservation; 