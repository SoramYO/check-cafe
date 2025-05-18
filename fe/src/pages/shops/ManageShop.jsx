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
import shopAPI from "../../apis/shop";
import ShopDetailsModal from "./ShopDetailsModal.jsx";
import EditShopModal from "./EditShopModel.jsx";

const ManageShop = () => {
  const [fields, setFields] = useState({
    name: "",
    address: "",
    theme: "",
    status: "",
    ratingRange: [0, 5],
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [shops, setShops] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "update_status", label: "Update Status" },
  ];

  const themes = [
    { label: "Sân vườn" },
  ];

  const statuses = [
    { label: "Open" },
    { label: "Closed" },
  ];

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopAPI.getShops("/public", {
          page: currentPage,
          limit: selectedValue,
          name: fields.name || undefined,
          address: fields.address || undefined,
          theme: fields.theme || undefined,
          status: fields.status || undefined,
          ratingRange: fields.ratingRange || undefined,
        });
        setShops(response.data.shops);
        setMetadata(response.data.metadata);
      } catch (err) {
        setError("Failed to fetch shops");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
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
      shops.forEach((shop) => {
        updateChecks[shop._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckShop = (isCheck, id) => {
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
    const selectedShopIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting shops with IDs: ${selectedShopIds.join(", ")}`);
    } else if (selectedOption.value === "update_status") {
      alert(`Updating status for shops with IDs: ${selectedShopIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, shopId) => {
    const action = item.toLowerCase();
    const shop = shops.find((s) => s._id === shopId);
    if (action === "view") {
      setSelectedShop(shop);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedShop(shop);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting shop with ID: ${shopId}`);
    }
  };

  const handleUpdateShop = (updatedShop) => {
    setShops((prev) =>
      prev.map((shop) => (shop._id === updatedShop._id ? updatedShop : shop))
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
      ratingRange: newValues,
    }));
  };

  const handleSelectTheme = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      theme: selectedValues,
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

  return (
    <section className="shops">
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
                placeholder="Search Shop..."
                className="sm table_search"
                value={fields.name}
                onChange={(value) => handleInputChange("name", value)}
              />
              <Offcanvas isOpen={isOffcanvasOpen} onClose={handleCloseOffcanvas}>
                <div className="offcanvas-head">
                  <h2>Advance Search</h2>
                </div>
                <div className="offcanvas-body">
                  <div className="column">
                    <Input
                      type="text"
                      placeholder="Enter the shop name"
                      label="Name"
                      value={fields.name}
                      onChange={(value) => handleInputChange("name", value)}
                    />
                  </div>
                  <div className="column">
                    <Input
                      type="text"
                      label="Address"
                      value={fields.address}
                      placeholder="Enter the shop address"
                      onChange={(value) => handleInputChange("address", value)}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={themes}
                      placeholder="Select Theme"
                      label="Theme"
                      isSelected={fields.theme}
                      onChange={handleSelectTheme}
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
                      label="Rating Range"
                      values={fields.ratingRange}
                      min={0}
                      max={5}
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
                <Link to="/shops/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Shop</span>
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
                        <th className="td_image">Image</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th className="td_action">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shops.map((shop) => (
                        <tr key={shop._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckShop(isCheck, shop._id)}
                              isChecked={specificChecks[shop._id] || false}
                            />
                          </td>
                          <td className="td_id">#</td>
                          <td className="td_image">
                            {shop.mainImage?.url ? (
                              <img src={shop.mainImage.url} alt={shop.name} />
                            ) : (
                              <span>No Image</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to="#"
                              onClick={() => {
                                setSelectedShop(shop);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              {shop.name}
                            </Link>
                          </td>
                          <td>{shop.address}</td>
                          <td>{shop.phone}</td>
                          <td>{shop.rating_avg.toFixed(1)} ({shop.rating_count})</td>
                          <td className="td_status">
                            {shop.is_open ? (
                              <Badge label="Open" className="light-success" />
                            ) : (
                              <Badge label="Closed" className="light-danger" />
                            )}
                          </td>
                          <td className="td_action">
                            <div className="action-buttons" style={actionButtonsStyle}>
                              <button 
                                style={viewButtonStyle}
                                onClick={() => {
                                  setSelectedShop(shop);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Icons.TbEye style={{ marginRight: "4px" }} /> View
                              </button>
                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setSelectedShop(shop);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Icons.TbEdit style={{ marginRight: "4px" }} /> Edit
                              </button>
                              <button
                                style={deleteButtonStyle}
                                onClick={() => handleActionItemClick("delete", shop._id)}
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
      <ShopDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        shop={selectedShop}
        onEdit={handleOpenEditFromDetails}
      />
      <EditShopModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shop={selectedShop}
        onUpdate={handleUpdateShop}
      />
    </section>
  );
};

export default ManageShop;