import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Offcanvas from "../../components/common/Offcanvas.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import TimeSlotDetailsModal from "./TimeSlotDetailsModal.jsx";
import EditTimeSlotModal from "./EditTimeSlotModal.jsx";

const ManageTimeSlots = () => {
  const [fields, setFields] = useState({
    day: "",
    status: "",
    startTime: "",
    endTime: ""
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "activate", label: "Activate" },
    { value: "deactivate", label: "Deactivate" },
  ];

  const dayOptions = [
    { label: "Monday" },
    { label: "Tuesday" },
    { label: "Wednesday" },
    { label: "Thursday" },
    { label: "Friday" },
    { label: "Saturday" },
    { label: "Sunday" }
  ];

  const statusOptions = [
    { label: "Active" },
    { label: "Inactive" }
  ];

  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            timeSlots: [
              {
                _id: "1",
                startTime: "08:00",
                endTime: "10:00",
                day: "Monday",
                capacity: 15,
                isActive: true,
                isReservable: true,
                isPeakHour: false,
                isRecurring: true,
                notes: "Morning slot",
                createdAt: "2023-07-10T10:30:00Z"
              },
              {
                _id: "2",
                startTime: "12:00",
                endTime: "14:00",
                day: "Monday",
                capacity: 20,
                isActive: true,
                isReservable: true,
                isPeakHour: true,
                isRecurring: true,
                notes: "Lunch slot",
                createdAt: "2023-07-10T11:20:00Z"
              },
              {
                _id: "3",
                startTime: "18:00",
                endTime: "20:00",
                day: "Friday",
                capacity: 25,
                isActive: false,
                isReservable: false,
                isPeakHour: true,
                isRecurring: true,
                notes: "Dinner slot",
                createdAt: "2023-07-10T12:15:00Z"
              }
            ],
            metadata: {
              totalItems: 3,
              totalPages: 1,
              currentPage: 1,
              limit: 10
            }
          }
        };
        setTimeSlots(mockData.data.timeSlots);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch time slots");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeSlots();
  }, [currentPage, selectedValue, fields]);

  const handleInputChange = (key, value) => {
    setFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBulkCheckbox = (isCheck) => {
    setBulkCheck(isCheck);
    if (isCheck) {
      const updateChecks = {};
      timeSlots.forEach((slot) => {
        updateChecks[slot._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckTimeSlot = (isCheck, id) => {
    setSpecificChecks((prev) => ({
      ...prev,
      [id]: isCheck,
    }));
  };

  const showTableRow = (selectedOption) => {
    setSelectedValue(selectedOption.value);
    setCurrentPage(1);
  };

  const handleBulkAction = (selectedOption) => {
    const selectedTimeSlotIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting time slots with IDs: ${selectedTimeSlotIds.join(", ")}`);
    } else if (selectedOption.value === "activate") {
      alert(`Activating time slots with IDs: ${selectedTimeSlotIds.join(", ")}`);
    } else if (selectedOption.value === "deactivate") {
      alert(`Deactivating time slots with IDs: ${selectedTimeSlotIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, timeSlotId) => {
    const action = item.toLowerCase();
    const timeSlot = timeSlots.find((slot) => slot._id === timeSlotId);
    if (action === "view") {
      setSelectedTimeSlot(timeSlot);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedTimeSlot(timeSlot);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting time slot with ID: ${timeSlotId}`);
    }
  };

  const handleUpdateTimeSlot = (updatedTimeSlot) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot._id === updatedTimeSlot._id ? updatedTimeSlot : slot))
    );
  };

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleToggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleSelectDay = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      day: selectedValues,
    }));
  };

  const handleSelectStatus = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      status: selectedValues.label,
    }));
  };

  // Custom styles for action buttons
  const actionButtonsStyle = {
    display: "flex",
    gap: "8px",
  };

  const buttonStyle = {
    padding: "6px 12px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
  };

  const viewButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
  };

  const editButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#2196F3",
    border: "1px solid #2196F3",
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "transparent",
    color: "#F44336",
    border: "1px solid #F44336",
  };

  const handleOpenEditFromDetails = () => {
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const formatTime = (time) => {
    if (!time) return "";
    // Convert 24h time to 12h format with AM/PM
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <section className="time-slots">
      <div className="container">
        <div className="wrapper">
          <div className="content transparent">
            <div className="content_head">
              <Dropdown
                placeholder="Bulk Action"
                className="sm"
                onClick={handleBulkAction}
                options={bulkAction}
              />
              <Button
                label="Advance Filter"
                className="sm"
                icon={<Icons.TbFilter />}
                onClick={handleToggleOffcanvas}
              />
              <Input
                placeholder="Search Time Slot..."
                className="sm table_search"
                value={fields.search}
                onChange={(value) => handleInputChange("search", value)}
              />
              <Offcanvas isOpen={isOffcanvasOpen} onClose={handleCloseOffcanvas}>
                <div className="offcanvas-head">
                  <h2>Advance Search</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="column">
                    <MultiSelect
                      options={dayOptions}
                      placeholder="Select Day"
                      label="Day"
                      isSelected={fields.day}
                      onChange={handleSelectDay}
                    />
                  </div>
                  <div className="column">
                    <Dropdown
                      options={statusOptions}
                      placeholder="Select Status"
                      label="Status"
                      selectedValue={fields.status}
                      onClick={handleSelectStatus}
                    />
                  </div>
                  <div className="column">
                    <Input
                      type="time"
                      label="Start Time"
                      value={fields.startTime}
                      onChange={(value) => handleInputChange("startTime", value)}
                    />
                  </div>
                  <div className="column">
                    <Input
                      type="time"
                      label="End Time"
                      value={fields.endTime}
                      onChange={(value) => handleInputChange("endTime", value)}
                    />
                  </div>
                </div>
                <div className="offcanvas-footer">
                  <Button
                    label="Discard"
                    className="sm outline"
                    icon={<Icons.TbX />}
                    onClick={handleCloseOffcanvas}
                  />
                  <Button
                    label="Filter"
                    className="sm"
                    icon={<Icons.TbFilter />}
                    onClick={handleCloseOffcanvas}
                  />
                </div>
              </Offcanvas>
              <div className="btn_parent">
                <Link to="/time-slots/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Time Slot</span>
                </Link>
                <Button
                  label="Reload"
                  icon={<Icons.TbRefresh />}
                  className="sm"
                  onClick={() => setCurrentPage(1)}
                />
              </div>
            </div>
            <div className="content_body">
              {isLoading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <div className="table_responsive">
                  <table className="separate">
                    <thead>
                      <tr>
                        <th className="td_checkbox">
                          <CheckBox
                            onChange={handleBulkCheckbox}
                            isChecked={bulkCheck}
                          />
                        </th>
                        <th className="td_id">ID</th>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Capacity</th>
                        <th>Features</th>
                        <th>Status</th>
                        <th className="td_action">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckTimeSlot(isCheck, timeSlot._id)}
                              isChecked={specificChecks[timeSlot._id] || false}
                            />
                          </td>
                          <td className="td_id">#{timeSlot._id}</td>
                          <td>{timeSlot.day}</td>
                          <td>
                            <Link
                              to="#"
                              onClick={() => {
                                setSelectedTimeSlot(timeSlot);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                            </Link>
                          </td>
                          <td>{timeSlot.capacity}</td>
                          <td>
                            {timeSlot.isPeakHour && <span className="feature-tag">Peak Hour</span>}
                            {timeSlot.isRecurring && <span className="feature-tag">Recurring</span>}
                          </td>
                          <td className="td_status">
                            <Badge 
                              label={timeSlot.isActive ? "Active" : "Inactive"} 
                              className={timeSlot.isActive ? "light-success" : "light-danger"} 
                            />
                          </td>
                          <td className="td_action">
                            <div className="action-buttons" style={actionButtonsStyle}>
                              <button 
                                style={viewButtonStyle}
                                onClick={() => {
                                  setSelectedTimeSlot(timeSlot);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Icons.TbEye style={{ marginRight: "4px" }} /> View
                              </button>
                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setSelectedTimeSlot(timeSlot);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Icons.TbEdit style={{ marginRight: "4px" }} /> Edit
                              </button>
                              <button
                                style={deleteButtonStyle}
                                onClick={() => handleActionItemClick("delete", timeSlot._id)}
                              >
                                <Icons.TbTrash style={{ marginRight: "4px" }} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="content_footer">
              <Dropdown
                className="top show_rows sm"
                placeholder="Items per page"
                selectedValue={selectedValue}
                onClick={showTableRow}
                options={tableRowOptions}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={metadata.totalPages}
                onPageChange={(newPage) => setCurrentPage(newPage)}
              />
            </div>
          </div>
        </div>
      </div>
      <TimeSlotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        timeSlot={selectedTimeSlot}
        onEdit={handleOpenEditFromDetails}
      />
      <EditTimeSlotModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        timeSlot={selectedTimeSlot}
        onUpdate={handleUpdateTimeSlot}
      />
    </section>
  );
};

export default ManageTimeSlots; 