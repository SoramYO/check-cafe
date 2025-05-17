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
import reservationAPI from "../../apis/reservation";
import ReservationDetailsModal from "./ReservationDetailsModal.jsx";
import EditReservationModal from "./EditReservationModal.jsx";

const ManageReservation = () => {
  const [fields, setFields] = useState({
    customerName: "",
    date: "",
    status: "",
    tableId: "",
    partySizeRange: [1, 20],
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [reservations, setReservations] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "update_status", label: "Update Status" },
  ];

  const tables = [
    { label: "Table 1" },
    { label: "Table 2" },
    { label: "Table 3" },
    { label: "Table 4" },
    { label: "Table 5" },
  ];

  const statuses = [
    { label: "Pending" },
    { label: "Confirmed" },
    { label: "Cancelled" },
    { label: "Completed" },
  ];

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            reservations: [
              {
                _id: "1",
                customerName: "John Doe",
                customerEmail: "john.doe@example.com",
                customerPhone: "123-456-7890",
                date: "2023-10-15",
                time: "18:30",
                partySize: 4,
                tableId: "Table 2",
                status: "Confirmed",
                specialRequests: "Window seat if possible",
                createdAt: "2023-10-01T10:30:00Z"
              },
              {
                _id: "2",
                customerName: "Jane Smith",
                customerEmail: "jane.smith@example.com",
                customerPhone: "987-654-3210",
                date: "2023-10-16",
                time: "19:00",
                partySize: 2,
                tableId: "Table 5",
                status: "Pending",
                specialRequests: "",
                createdAt: "2023-10-02T09:15:00Z"
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
        setReservations(mockData.data.reservations);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch reservations");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
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
      reservations.forEach((reservation) => {
        updateChecks[reservation._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckReservation = (isCheck, id) => {
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
    const selectedReservationIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting reservations with IDs: ${selectedReservationIds.join(", ")}`);
    } else if (selectedOption.value === "update_status") {
      alert(`Updating status for reservations with IDs: ${selectedReservationIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, reservationId) => {
    const action = item.toLowerCase();
    const reservation = reservations.find((r) => r._id === reservationId);
    if (action === "view") {
      setSelectedReservation(reservation);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedReservation(reservation);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting reservation with ID: ${reservationId}`);
    }
  };

  const handleUpdateReservation = (updatedReservation) => {
    setReservations((prev) =>
      prev.map((reservation) => (reservation._id === updatedReservation._id ? updatedReservation : reservation))
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
      partySizeRange: newValues,
    }));
  };

  const handleSelectTable = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      tableId: selectedValues,
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

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'light-success';
      case 'pending':
        return 'light-warning';
      case 'cancelled':
        return 'light-danger';
      case 'completed':
        return 'light-info';
      default:
        return '';
    }
  };

  return (
    <section className="reservations">
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
                placeholder="Search Reservation..."
                className="sm table_search"
                value={fields.customerName}
                onChange={(value) => handleInputChange("customerName", value)}
              />
              <Offcanvas isOpen={isOffcanvasOpen} onClose={handleCloseOffcanvas}>
                <div className="offcanvas-head">
                  <h2>Advance Search</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="column">
                    <Input
                      type="text"
                      placeholder="Enter the customer name"
                      label="Customer Name"
                      value={fields.customerName}
                      onChange={(value) => handleInputChange("customerName", value)}
                    />
                  </div>
                  <div className="column">
                    <Input
                      type="date"
                      label="Date"
                      value={fields.date}
                      placeholder="Select date"
                      onChange={(value) => handleInputChange("date", value)}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={tables}
                      placeholder="Select Table"
                      label="Table"
                      isSelected={fields.tableId}
                      onChange={handleSelectTable}
                    />
                  </div>
                  <div className="column">
                    <Dropdown
                      options={statuses}
                      placeholder="Select Status"
                      label="Status"
                      selectedValue={fields.status}
                      onClick={handleSelectStatus}
                    />
                  </div>
                  <div className="column">
                    <RangeSlider
                      label="Party Size Range"
                      values={fields.partySizeRange}
                      min={1}
                      max={20}
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
                <Link to="/reservations/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Reservation</span>
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
                        <th>Customer</th>
                        <th>Date & Time</th>
                        <th>Party Size</th>
                        <th>Table</th>
                        <th>Status</th>
                        <th>Created On</th>
                        <th className="td_action">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckReservation(isCheck, reservation._id)}
                              isChecked={specificChecks[reservation._id] || false}
                            />
                          </td>
                          <td className="td_id">#{reservation._id}</td>
                          <td>
                            <Link
                              to="#"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              {reservation.customerName}
                            </Link>
                            <div className="small">{reservation.customerPhone}</div>
                          </td>
                          <td>
                            {reservation.date} <br/>
                            <span className="small">{reservation.time}</span>
                          </td>
                          <td>{reservation.partySize}</td>
                          <td>{reservation.tableId}</td>
                          <td className="td_status">
                            <Badge label={reservation.status} className={getStatusBadgeClass(reservation.status)} />
                          </td>
                          <td>{new Date(reservation.createdAt).toLocaleDateString()}</td>
                          <td className="td_action">
                            <div className="action-buttons" style={actionButtonsStyle}>
                              <button 
                                style={viewButtonStyle}
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Icons.TbEye style={{ marginRight: "4px" }} /> View
                              </button>
                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setSelectedReservation(reservation);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Icons.TbEdit style={{ marginRight: "4px" }} /> Edit
                              </button>
                              <button
                                style={deleteButtonStyle}
                                onClick={() => handleActionItemClick("delete", reservation._id)}
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
      <ReservationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        reservation={selectedReservation}
        onEdit={handleOpenEditFromDetails}
      />
      <EditReservationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        reservation={selectedReservation}
        onUpdate={handleUpdateReservation}
      />
    </section>
  );
};

export default ManageReservation; 