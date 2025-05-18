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
import RangeSlider from "../../components/common/RangeSlider.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import SeatDetailsModal from "./SeatDetailsModal.jsx";
import EditSeatModal from "./EditSeatModal.jsx";

const ManageSeats = () => {
  const [fields, setFields] = useState({
    seatNumber: "",
    type: "",
    location: "",
    status: "",
    capacityRange: [1, 12],
    features: []
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [seats, setSeats] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "update_status", label: "Update Status" },
  ];

  const seatTypeOptions = [
    { label: "Table" },
    { label: "Booth" },
    { label: "Bar" },
    { label: "Counter" },
    { label: "Patio" }
  ];

  const locationOptions = [
    { label: "Main Dining Area" },
    { label: "Private Room" },
    { label: "Outdoor" },
    { label: "Bar Area" },
    { label: "Window Seating" }
  ];

  const statusOptions = [
    { label: "Available" },
    { label: "Maintenance" },
    { label: "Reserved" }
  ];

  const featureOptions = [
    { label: "VIP" },
    { label: "Wheelchair Accessible" },
    { label: "Outdoor" }
  ];

  useEffect(() => {
    const fetchSeats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            seats: [
              {
                _id: "1",
                seatNumber: "A1",
                capacity: 4,
                type: "Table",
                location: "Main Dining Area",
                status: "Available",
                isVIP: false,
                isAccessible: true,
                isOutdoor: false,
                isReserved: false,
                notes: "Near the window with a view",
                createdAt: "2023-08-15T10:30:00Z"
              },
              {
                _id: "2",
                seatNumber: "B3",
                capacity: 2,
                type: "Booth",
                location: "Private Room",
                status: "Reserved",
                isVIP: true,
                isAccessible: false,
                isOutdoor: false,
                isReserved: true,
                notes: "Intimate booth for couples",
                createdAt: "2023-08-20T14:20:00Z"
              }
            ],
            metadata: {
              totalItems: 2,
              totalPages: 1,
              currentPage: 1,
              limit: 10
            }
          }
        };
        setSeats(mockData.data.seats);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch seats");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();
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
      seats.forEach((seat) => {
        updateChecks[seat._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckSeat = (isCheck, id) => {
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
    const selectedSeatIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting seats with IDs: ${selectedSeatIds.join(", ")}`);
    } else if (selectedOption.value === "update_status") {
      alert(`Updating status for seats with IDs: ${selectedSeatIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, seatId) => {
    const action = item.toLowerCase();
    const seat = seats.find((s) => s._id === seatId);
    if (action === "view") {
      setSelectedSeat(seat);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedSeat(seat);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting seat with ID: ${seatId}`);
    }
  };

  const handleUpdateSeat = (updatedSeat) => {
    setSeats((prev) =>
      prev.map((seat) => (seat._id === updatedSeat._id ? updatedSeat : seat))
    );
  };

  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const handleToggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleSliderChange = (newValues) => {
    setFields((prev) => ({
      ...prev,
      capacityRange: newValues,
    }));
  };

  const handleSelectType = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      type: selectedValues,
    }));
  };

  const handleSelectLocation = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      location: selectedValues,
    }));
  };

  const handleSelectStatus = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      status: selectedValues.label,
    }));
  };

  const handleSelectFeatures = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      features: selectedValues,
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

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'light-success';
      case 'maintenance':
        return 'light-warning';
      case 'reserved':
        return 'light-danger';
      default:
        return '';
    }
  };

  return (
    <section className="seats">
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
                placeholder="Search Seat..."
                className="sm table_search"
                value={fields.seatNumber}
                onChange={(value) => handleInputChange("seatNumber", value)}
              />
              <Offcanvas isOpen={isOffcanvasOpen} onClose={handleCloseOffcanvas}>
                <div className="offcanvas-head">
                  <h2>Advance Search</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="column">
                    <Input
                      type="text"
                      placeholder="Enter the seat number"
                      label="Seat Number"
                      value={fields.seatNumber}
                      onChange={(value) => handleInputChange("seatNumber", value)}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={seatTypeOptions}
                      placeholder="Select Type"
                      label="Type"
                      isSelected={fields.type}
                      onChange={handleSelectType}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={locationOptions}
                      placeholder="Select Location"
                      label="Location"
                      isSelected={fields.location}
                      onChange={handleSelectLocation}
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
                    <MultiSelect
                      options={featureOptions}
                      placeholder="Select Features"
                      label="Features"
                      isSelected={fields.features}
                      onChange={handleSelectFeatures}
                    />
                  </div>
                  <div className="column">
                    <RangeSlider
                      label="Capacity Range"
                      values={fields.capacityRange}
                      min={1}
                      max={12}
                      onValuesChange={handleSliderChange}
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
                <Link to="/seats/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Seat</span>
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
                        <th>Seat Number</th>
                        <th>Type</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Features</th>
                        <th className="td_action">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seats.map((seat) => (
                        <tr key={seat._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckSeat(isCheck, seat._id)}
                              isChecked={specificChecks[seat._id] || false}
                            />
                          </td>
                          <td className="td_id">#{seat._id}</td>
                          <td>
                            <Link
                              to="#"
                              onClick={() => {
                                setSelectedSeat(seat);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              {seat.seatNumber}
                            </Link>
                          </td>
                          <td>{seat.type}</td>
                          <td>{seat.location}</td>
                          <td>{seat.capacity}</td>
                          <td className="td_status">
                            <Badge label={seat.status} className={getStatusBadgeClass(seat.status)} />
                          </td>
                          <td>
                            {seat.isVIP && <span className="feature-tag">VIP</span>}
                            {seat.isAccessible && <span className="feature-tag">Accessible</span>}
                            {seat.isOutdoor && <span className="feature-tag">Outdoor</span>}
                          </td>
                          <td className="td_action">
                            <div className="action-buttons" style={actionButtonsStyle}>
                              <button 
                                style={viewButtonStyle}
                                onClick={() => {
                                  setSelectedSeat(seat);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Icons.TbEye style={{ marginRight: "4px" }} /> View
                              </button>
                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setSelectedSeat(seat);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Icons.TbEdit style={{ marginRight: "4px" }} /> Edit
                              </button>
                              <button
                                style={deleteButtonStyle}
                                onClick={() => handleActionItemClick("delete", seat._id)}
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
      <SeatDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        seat={selectedSeat}
        onEdit={handleOpenEditFromDetails}
      />
      <EditSeatModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        seat={selectedSeat}
        onUpdate={handleUpdateSeat}
      />
    </section>
  );
};

export default ManageSeats; 