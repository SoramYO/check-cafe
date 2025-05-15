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
import menuItemAPI from "../../apis/menuItem";
import MenuItemDetailsModal from "./MenuItemDetailsModal.jsx";
import EditMenuItemModal from "./EditMenuItemModal.jsx";

const ManageMenuItems = () => {
  const [fields, setFields] = useState({
    name: "",
    category: "",
    status: "",
    priceRange: [0, 100],
    dietaryOptions: [],
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "update_status", label: "Update Status" },
  ];

  const categories = [
    { label: "Appetizer" },
    { label: "Main Course" },
    { label: "Dessert" },
    { label: "Drink" },
    { label: "Side Dish" },
  ];

  const statuses = [
    { label: "Available" },
    { label: "Unavailable" },
    { label: "Seasonal" },
  ];

  const dietaryOptions = [
    { label: "Vegetarian" },
    { label: "Vegan" },
    { label: "Gluten Free" },
    { label: "Dairy Free" },
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            menuItems: [
              {
                _id: "1",
                name: "Caesar Salad",
                description: "Fresh romaine lettuce with parmesan cheese, croutons, and Caesar dressing",
                price: 12.99,
                category: "Appetizer",
                preparationTime: 10,
                isVegetarian: true,
                isPopular: true,
                status: "Available",
                mainImage: {
                  url: "https://example.com/caesar-salad.jpg"
                },
                ingredients: "Romaine lettuce, parmesan cheese, croutons, caesar dressing",
                createdAt: "2023-09-15T10:30:00Z"
              },
              {
                _id: "2",
                name: "Spaghetti Carbonara",
                description: "Classic Italian pasta with eggs, cheese, pancetta, and black pepper",
                price: 16.99,
                category: "Main Course",
                preparationTime: 25,
                isVegetarian: false,
                isPopular: true,
                status: "Available",
                mainImage: {
                  url: "https://example.com/carbonara.jpg"
                },
                ingredients: "Spaghetti, eggs, pecorino romano, pancetta, black pepper",
                createdAt: "2023-09-14T14:20:00Z"
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
        setMenuItems(mockData.data.menuItems);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch menu items");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuItems();
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
      menuItems.forEach((item) => {
        updateChecks[item._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckMenuItem = (isCheck, id) => {
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
    const selectedMenuItemIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting menu items with IDs: ${selectedMenuItemIds.join(", ")}`);
    } else if (selectedOption.value === "update_status") {
      alert(`Updating status for menu items with IDs: ${selectedMenuItemIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = (item, menuItemId) => {
    const action = item.toLowerCase();
    const menuItem = menuItems.find((m) => m._id === menuItemId);
    if (action === "view") {
      setSelectedMenuItem(menuItem);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedMenuItem(menuItem);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting menu item with ID: ${menuItemId}`);
    }
  };

  const handleUpdateMenuItem = (updatedMenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item._id === updatedMenuItem._id ? updatedMenuItem : item))
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
      priceRange: newValues,
    }));
  };

  const handleSelectCategory = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      category: selectedValues,
    }));
  };

  const handleSelectStatus = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      status: selectedValues.label,
    }));
  };

  const handleSelectDietaryOptions = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      dietaryOptions: selectedValues,
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
    <section className="menu-items">
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
                placeholder="Search Menu Item..."
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
                      placeholder="Enter the menu item name"
                      label="Name"
                      value={fields.name}
                      onChange={(value) => handleInputChange("name", value)}
                    />
                  </div>
                  <div className="column">
                    <MultiSelect
                      options={categories}
                      placeholder="Select Category"
                      label="Category"
                      isSelected={fields.category}
                      onChange={handleSelectCategory}
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
                    <MultiSelect
                      options={dietaryOptions}
                      placeholder="Select Dietary Options"
                      label="Dietary Options"
                      isSelected={fields.dietaryOptions}
                      onChange={handleSelectDietaryOptions}
                    />
                  </div>
                  <div className="column">
                    <RangeSlider
                      label="Price Range"
                      values={fields.priceRange}
                      min={0}
                      max={100}
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
                <Link to="/menu-items/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Menu Item</span>
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
                        <th>Category</th>
                        <th>Price</th>
                        <th>Prep Time</th>
                        <th>Status</th>
                        <th className="td_action">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((menuItem) => (
                        <tr key={menuItem._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckMenuItem(isCheck, menuItem._id)}
                              isChecked={specificChecks[menuItem._id] || false}
                            />
                          </td>
                          <td className="td_id">#{menuItem._id}</td>
                          <td className="td_image">
                            {menuItem.mainImage?.url ? (
                              <img src={menuItem.mainImage.url} alt={menuItem.name} />
                            ) : (
                              <span>No Image</span>
                            )}
                          </td>
                          <td>
                            <Link
                              to="#"
                              onClick={() => {
                                setSelectedMenuItem(menuItem);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              {menuItem.name}
                            </Link>
                            <div className="small">{menuItem.ingredients ? menuItem.ingredients.split(',').slice(0, 2).join(', ') + (menuItem.ingredients.split(',').length > 2 ? '...' : '') : ''}</div>
                          </td>
                          <td>{menuItem.category}</td>
                          <td>${menuItem.price.toFixed(2)}</td>
                          <td>{menuItem.preparationTime} mins</td>
                          <td className="td_status">
                            <Badge 
                              label={menuItem.status} 
                              className={
                                menuItem.status === "Available" 
                                  ? "light-success" 
                                  : menuItem.status === "Unavailable" 
                                    ? "light-danger" 
                                    : "light-warning"
                              } 
                            />
                          </td>
                          <td className="td_action">
                            <div className="action-buttons" style={actionButtonsStyle}>
                              <button 
                                style={viewButtonStyle}
                                onClick={() => {
                                  setSelectedMenuItem(menuItem);
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                <Icons.TbEye style={{ marginRight: "4px" }} /> View
                              </button>
                              <button
                                style={editButtonStyle}
                                onClick={() => {
                                  setSelectedMenuItem(menuItem);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Icons.TbEdit style={{ marginRight: "4px" }} /> Edit
                              </button>
                              <button
                                style={deleteButtonStyle}
                                onClick={() => handleActionItemClick("delete", menuItem._id)}
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
      <MenuItemDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        menuItem={selectedMenuItem}
        onEdit={handleOpenEditFromDetails}
      />
      <EditMenuItemModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        menuItem={selectedMenuItem}
        onUpdate={handleUpdateMenuItem}
      />
    </section>
  );
};

export default ManageMenuItems; 