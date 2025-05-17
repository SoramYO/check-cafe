import React, { useState, useEffect } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import * as Icons from "react-icons/tb";

const EditMenuItemModal = ({ isOpen, onClose, menuItem, onUpdate }) => {
  const [editedMenuItem, setEditedMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    priceSale: "",
    category: "",
    preparationTime: "",
    calories: "",
    ingredients: "",
    status: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isSpicy: false,
    isPopular: false,
    isSpecialOffer: false
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (menuItem) {
      setEditedMenuItem({
        ...menuItem
      });

      setSelectedCategory(menuItem.category);
      setSelectedStatus(menuItem.status);
    }
  }, [menuItem]);

  if (!menuItem) return null;

  const handleInputChange = (key, value) => {
    setEditedMenuItem({
      ...editedMenuItem,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setEditedMenuItem({
      ...editedMenuItem,
      [key]: checked
    });
  };

  const categoryOptions = [
    { value: "Appetizer", label: "Appetizer" },
    { value: "Main Course", label: "Main Course" },
    { value: "Dessert", label: "Dessert" },
    { value: "Drink", label: "Drink" },
    { value: "Side Dish", label: "Side Dish" }
  ];

  const statusOptions = [
    { value: "Available", label: "Available" },
    { value: "Unavailable", label: "Unavailable" },
    { value: "Seasonal", label: "Seasonal" }
  ];

  const handleCategorySelect = (selectedOption) => {
    setSelectedCategory(selectedOption.label);
    handleInputChange("category", selectedOption.label);
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedStatus(selectedOption.label);
    handleInputChange("status", selectedOption.label);
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the menu item
    // For this example, we'll just call the onUpdate function with the edited data
    onUpdate(editedMenuItem);
    onClose();
  };

  return (
    <Modal bool={isOpen} onClose={onClose} className="lg">
      <div className="modal-head">
        <h2>Edit Menu Item</h2>
      </div>
      <div className="modal-body">
        <div className="edit-section">
          <h3>Basic Information</h3>
          <div className="row">
            <div className="column">
              <Input
                type="text"
                label="Name"
                placeholder="Enter menu item name"
                value={editedMenuItem.name}
                onChange={(value) => handleInputChange("name", value)}
                icon={<Icons.TbPizza />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Textarea
                label="Description"
                placeholder="Enter description"
                value={editedMenuItem.description}
                onChange={(value) => handleInputChange("description", value)}
                icon={<Icons.TbFileDescription />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column_2">
              <Input
                type="number"
                label="Price"
                placeholder="Enter price"
                value={editedMenuItem.price}
                onChange={(value) => handleInputChange("price", value)}
                icon={<Icons.TbCoin />}
              />
            </div>
            <div className="column_2">
              <Input
                type="number"
                label="Sale Price"
                placeholder="Enter sale price (optional)"
                value={editedMenuItem.priceSale}
                onChange={(value) => handleInputChange("priceSale", value)}
                icon={<Icons.TbCoins />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column_2">
              <Dropdown
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                selectedValue={selectedCategory}
                onClick={handleCategorySelect}
              />
            </div>
            <div className="column_2">
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
          <h3>Details</h3>
          <div className="row">
            <div className="column_2">
              <Input
                type="number"
                label="Preparation Time (min)"
                placeholder="Enter preparation time"
                value={editedMenuItem.preparationTime}
                onChange={(value) => handleInputChange("preparationTime", value)}
                icon={<Icons.TbClock />}
              />
            </div>
            <div className="column_2">
              <Input
                type="number"
                label="Calories"
                placeholder="Enter calories"
                value={editedMenuItem.calories}
                onChange={(value) => handleInputChange("calories", value)}
                icon={<Icons.TbFlame />}
              />
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Textarea
                label="Ingredients"
                placeholder="Enter ingredients (comma separated)"
                value={editedMenuItem.ingredients}
                onChange={(value) => handleInputChange("ingredients", value)}
                icon={<Icons.TbListDetails />}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Dietary Options</h3>
          <div className="row">
            <div className="column dietary-grid">
              <CheckBox
                id="edit_isVegetarian"
                label="Vegetarian"
                isChecked={editedMenuItem.isVegetarian}
                onChange={(isChecked) => handleCheckboxChange("isVegetarian", isChecked)}
              />
              <CheckBox
                id="edit_isVegan"
                label="Vegan"
                isChecked={editedMenuItem.isVegan}
                onChange={(isChecked) => handleCheckboxChange("isVegan", isChecked)}
              />
              <CheckBox
                id="edit_isGlutenFree"
                label="Gluten Free"
                isChecked={editedMenuItem.isGlutenFree}
                onChange={(isChecked) => handleCheckboxChange("isGlutenFree", isChecked)}
              />
              <CheckBox
                id="edit_isDairyFree"
                label="Dairy Free"
                isChecked={editedMenuItem.isDairyFree}
                onChange={(isChecked) => handleCheckboxChange("isDairyFree", isChecked)}
              />
            </div>
          </div>
        </div>

        <div className="edit-section">
          <h3>Marketing Options</h3>
          <div className="row">
            <div className="column marketing-grid">
              <CheckBox
                id="edit_isSpicy"
                label="Spicy"
                isChecked={editedMenuItem.isSpicy}
                onChange={(isChecked) => handleCheckboxChange("isSpicy", isChecked)}
              />
              <CheckBox
                id="edit_isPopular"
                label="Popular"
                isChecked={editedMenuItem.isPopular}
                onChange={(isChecked) => handleCheckboxChange("isPopular", isChecked)}
              />
              <CheckBox
                id="edit_isSpecialOffer"
                label="Special Offer"
                isChecked={editedMenuItem.isSpecialOffer}
                onChange={(isChecked) => handleCheckboxChange("isSpecialOffer", isChecked)}
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
        .dietary-grid, .marketing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
      `}</style>
    </Modal>
  );
};

export default EditMenuItemModal; 