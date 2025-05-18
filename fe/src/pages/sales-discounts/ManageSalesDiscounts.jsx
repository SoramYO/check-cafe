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
import DateRangePicker from "../../components/common/CustomCalendar.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";

const ManageSalesDiscounts = () => {
  const [fields, setFields] = useState({
    name: "",
    discountCode: "",
    discountType: "",
    status: "",
    validityRange: [new Date(), new Date(new Date().setDate(new Date().getDate() + 30))],
    discountValueRange: [0, 100]
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [discounts, setDiscounts] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "activate", label: "Activate" },
    { value: "deactivate", label: "Deactivate" }
  ];

  const discountTypeOptions = [
    { label: "Percentage" },
    { label: "Fixed Amount" },
    { label: "Buy One Get One" },
    { label: "Free Item" }
  ];

  const statusOptions = [
    { label: "Active" },
    { label: "Inactive" },
    { label: "Expired" }
  ];

  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            discounts: [
              {
                _id: "1",
                name: "Summer Special",
                discountCode: "SUMMER20",
                discountType: "Percentage",
                value: 20,
                status: "Active",
                validFrom: "2023-06-01T00:00:00Z",
                validTo: "2023-08-31T23:59:59Z",
                minPurchase: 50,
                maxDiscount: 200,
                usageLimit: 1,
                createdAt: "2023-05-15T10:30:00Z"
              },
              {
                _id: "2",
                name: "New Customer",
                discountCode: "WELCOME10",
                discountType: "Fixed Amount",
                value: 10,
                status: "Active",
                validFrom: "2023-01-01T00:00:00Z",
                validTo: "2023-12-31T23:59:59Z",
                minPurchase: 20,
                maxDiscount: null,
                usageLimit: null,
                createdAt: "2023-01-01T08:00:00Z"
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
        setDiscounts(mockData.data.discounts);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch discounts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscounts();
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
      discounts.forEach((discount) => {
        updateChecks[discount._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckDiscount = (isCheck, id) => {
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
    const selectedDiscountIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting discounts with IDs: ${selectedDiscountIds.join(", ")}`);
    } else if (selectedOption.value === "activate") {
      alert(`Activating discounts with IDs: ${selectedDiscountIds.join(", ")}`);
    } else if (selectedOption.value === "deactivate") {
      alert(`Deactivating discounts with IDs: ${selectedDiscountIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, discountId) => {
    const action = item.toLowerCase();
    const discount = discounts.find((d) => d._id === discountId);
    
    if (action === "view") {
      setSelectedDiscount(discount);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedDiscount(discount);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting discount with ID: ${discountId}`);
    }
  };

  const handleUpdateDiscount = (updatedDiscount) => {
    setDiscounts((prev) =>
      prev.map((discount) => (discount._id === updatedDiscount._id ? updatedDiscount : discount))
    );
  };

  const handleToggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleSelectDiscountType = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      discountType: selectedValues.label,
    }));
  };

  const handleSelectStatus = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      status: selectedValues.label,
    }));
  };

  const handleDateRangeChange = (range) => {
    setFields((prev) => ({
      ...prev,
      validityRange: range,
    }));
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Active") {
      return "success";
    } else if (status === "Inactive") {
      return "warning";
    } else if (status === "Expired") {
      return "danger";
    }
    return "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Custom styles for action buttons
  const actionButtonsStyle = {
    display: "flex",
    gap: "8px",
  };

  return (
    <section className="table">
      <div className="container">
        <div className="heading">
          <div className="heading_left">
            <h1>Manage Sales Discounts</h1>
          </div>
          <div className="heading_right">
            <Link to="/sales-discounts/add">
              <Button
                label="add discount"
                icon={<Icons.TbPlus />}
                className="success"
              />
            </Link>
            <Button
              label="filter"
              icon={<Icons.TbAdjustments />}
              onClick={handleToggleOffcanvas}
            />
          </div>
        </div>
        <div className="content">
          <div className="bulk_action">
            <div className="bulk_action_left">
              <CheckBox
                id="check_all"
                label=""
                onChange={handleBulkCheckbox}
                isChecked={bulkCheck}
              />
              <Dropdown
                placeholder="Bulk Action"
                options={bulkAction}
                onClick={handleBulkAction}
              />
            </div>
            <div className="bulk_action_right">
              <Dropdown
                icon={<Icons.TbRows />}
                placeholder="10"
                options={tableRowOptions}
                onClick={showTableRow}
              />
            </div>
          </div>
          <div className="table_content">
            <table>
              <thead>
                <tr>
                  <th className="w_1">#</th>
                  <th className="w_4">Name</th>
                  <th className="w_3">Code</th>
                  <th className="w_3">Type</th>
                  <th className="w_3">Value</th>
                  <th className="w_3">Valid From</th>
                  <th className="w_3">Valid To</th>
                  <th className="w_3">Status</th>
                  <th className="w_3">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="loading">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="error">
                      {error}
                    </td>
                  </tr>
                ) : discounts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="no_data">
                      No discount found
                    </td>
                  </tr>
                ) : (
                  discounts.map((discount) => (
                    <tr key={discount._id}>
                      <td>
                        <CheckBox
                          id={`check_${discount._id}`}
                          label=""
                          onChange={(isCheck) =>
                            handleCheckDiscount(isCheck, discount._id)
                          }
                          isChecked={specificChecks[discount._id] || false}
                        />
                      </td>
                      <td>{discount.name}</td>
                      <td><code>{discount.discountCode}</code></td>
                      <td>{discount.discountType}</td>
                      <td>
                        {discount.discountType === "Percentage"
                          ? `${discount.value}%`
                          : `$${discount.value}`}
                      </td>
                      <td>{formatDate(discount.validFrom)}</td>
                      <td>{formatDate(discount.validTo)}</td>
                      <td>
                        <Badge
                          label={discount.status}
                          className={getStatusBadgeClass(discount.status)}
                        />
                      </td>
                      <td>
                        <div style={actionButtonsStyle}>
                          <TableAction
                            actionItems={actionItems}
                            onClick={(item) =>
                              handleActionItemClick(item, discount._id)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <Pagination
              currentPage={currentPage}
              totalPage={metadata.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Offcanvas
        position="right"
        isOpen={isOffcanvasOpen}
        onClose={handleCloseOffcanvas}
      >
        <div className="offcanvas_header">
          <h2>Filter Discounts</h2>
        </div>
        <div className="offcanvas_body">
          <Input
            type="text"
            placeholder="Search by name"
            label="Discount Name"
            icon={<Icons.TbSearch />}
            value={fields.name}
            onChange={(value) => handleInputChange("name", value)}
          />
          <Input
            type="text"
            placeholder="Enter discount code"
            label="Discount Code"
            icon={<Icons.TbDiscount2 />}
            value={fields.discountCode}
            onChange={(value) => handleInputChange("discountCode", value)}
          />
          <Dropdown
            placeholder="Select discount type"
            label="Discount Type"
            selectedValue={fields.discountType}
            onClick={handleSelectDiscountType}
            options={discountTypeOptions}
          />
          <Dropdown
            placeholder="Select status"
            label="Status"
            selectedValue={fields.status}
            onClick={handleSelectStatus}
            options={statusOptions}
          />
          <DateRangePicker
            label="Valid Period"
            selectedRange={fields.validityRange}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="offcanvas_footer">
          <Button
            label="clear filter"
            icon={<Icons.TbFilterOff />}
            className="danger outline"
            onClick={() =>
              setFields({
                name: "",
                discountCode: "",
                discountType: "",
                status: "",
                validityRange: [new Date(), new Date(new Date().setDate(new Date().getDate() + 30))],
                discountValueRange: [0, 100]
              })
            }
          />
          <Button
            label="apply filter"
            icon={<Icons.TbFilter />}
            className="success"
            onClick={handleCloseOffcanvas}
          />
        </div>
      </Offcanvas>

      {/* Details and Edit modals would be implemented with separate components */}
      {/* Similar to SeatDetailsModal and EditSeatModal */}
      
    </section>
  );
};

export default ManageSalesDiscounts; 