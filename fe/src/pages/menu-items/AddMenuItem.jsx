import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import FileUpload from "../../components/common/FileUpload.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import TextEditor from "../../components/common/TextEditor.jsx";
import Tagify from "../../components/common/Tagify.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";

const AddMenuItem = () => {
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    priceSale: "",
    costPerItem: "",
    profit: "",
    margin: "",
    category: "",
    preparationTime: "",
    calories: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    isSpicy: false,
    isPopular: false,
    isSpecialOffer: false,
    metaLink: "http://localhost:5173/menu/item",
    metaTitle: "",
    metaDescription: "",
  });

  const [selectOptions, setSelectOptions] = useState([
    {
      value: "available",
      label: "Available",
    },
    {
      value: "unavailable",
      label: "Unavailable",
    },
    {
      value: "seasonal",
      label: "Seasonal",
    },
  ]);

  const [selectedValue, setSelectedValue] = useState({
    availability: "",
    category: "",
  });

  const handleInputChange = (key, value) => {
    setMenuItem({
      ...menuItem,
      [key]: value,
    });
  };

  useEffect(() => {
    const profit = menuItem.price - menuItem.costPerItem;
    const margin = profit / menuItem.price * 100;
    setMenuItem({
      ...menuItem,
      profit: profit,
      margin: margin ? margin : '',
    });
  }, [menuItem.price, menuItem.costPerItem]);

  const handleAvailabilitySelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      availability: selectedOption.label,
    });
  };

  const categoryOptions = [
    { value: "appetizer", label: "Appetizer" },
    { value: "main", label: "Main Course" },
    { value: "dessert", label: "Dessert" },
    { value: "drink", label: "Drink" },
    { value: "side", label: "Side Dish" },
  ];

  const handleCategorySelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      category: selectedOption.label,
    });
    setMenuItem({
      ...menuItem,
      category: selectedOption.value,
    });
  };

  const allergenTags = [
    { id: 1, name: "Gluten" },
    { id: 2, name: "Dairy" },
    { id: 3, name: "Eggs" },
    { id: 4, name: "Fish" },
    { id: 5, name: "Shellfish" },
    { id: 6, name: "Tree Nuts" },
    { id: 7, name: "Peanuts" },
    { id: 8, name: "Soy" },
  ];

  const handleCheckboxChange = (key, checked) => {
    setMenuItem({
      ...menuItem,
      [key]: checked,
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Menu Item Info</h2>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the menu item name"
                  label="Name"
                  icon={<Icons.TbPizza />}
                  value={menuItem.name}
                  onChange={(value) => handleInputChange("name", value)}
                />
              </div>
              <div className="column">
                <TextEditor
                  label="Description"
                  placeholder="Enter a description"
                  value={menuItem.description}
                  onChange={(value) => handleInputChange("description", value)}
                />
              </div>  
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Menu Item Images</h2>
              <FileUpload/>
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Pricing</h2>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter the menu item price"
                  icon={<Icons.TbCoin />}
                  label="Price"
                  value={menuItem.price}
                  onChange={(value) => handleInputChange("price", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="number"
                  placeholder="Enter the menu item price sale"
                  icon={<Icons.TbCoin />}
                  label="Price sale"
                  value={menuItem.priceSale}
                  onChange={(value) => handleInputChange("priceSale", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  icon={<Icons.TbCoin />}
                  placeholder="Cost Per Item"
                  label="Cost Per Item"
                  value={menuItem.costPerItem}
                  onChange={(value) => handleInputChange("costPerItem", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="- -"
                  label="Profit"
                  readOnly={true}
                  value={menuItem.profit}
                />
              </div>
              <div className="column_3">
                <Input
                  type="text"
                  placeholder="- -"
                  label="Margin"
                  readOnly={true}
                  value={`${menuItem.margin ? menuItem.margin.toFixed(2) : "- -"}%`}
                />
              </div>
            </div>
            <div className="content_item">
              <h2 className="sub_heading">Item Details</h2>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter preparation time (minutes)"
                  icon={<Icons.TbClock />}
                  label="Preparation Time (min)"
                  value={menuItem.preparationTime}
                  onChange={(value) => handleInputChange("preparationTime", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter calories"
                  icon={<Icons.TbFlame />}
                  label="Calories"
                  value={menuItem.calories}
                  onChange={(value) => handleInputChange("calories", value)}
                />
              </div>
              <div className="column_3">
                <Dropdown
                  placeholder="Select Category"
                  label="Category"
                  selectedValue={selectedValue.category}
                  onClick={handleCategorySelect}
                  options={categoryOptions}
                />
              </div>
              <div className="column">
                <Textarea
                  placeholder="Enter ingredients (comma separated)"
                  label="Ingredients"
                  icon={<Icons.TbListDetails />}
                  value={menuItem.ingredients}
                  onChange={(value) => handleInputChange("ingredients", value)}
                />
              </div>
            </div>
            <div className="content_item meta_data">
              <div className="column">
                <span>Search engine listing</span>
                <h2 className="meta_title">{menuItem.metaTitle || menuItem.name}</h2>
                <p className="meta_link">{menuItem.metaLink}</p>
                <p className="meta_description">{menuItem.metaDescription || menuItem.description}</p>
              </div>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the meta title"
                  label="Title"
                  value={menuItem.metaTitle || menuItem.name}
                  onChange={(value) => handleInputChange("metaTitle", value)}
                />
              </div>
              <div className="column">
                <Input
                  type="text"
                  placeholder="Enter the meta link"
                  label="Link"
                  value={`${menuItem.metaLink}/${menuItem.metaTitle || menuItem.name}`}
                  onChange={(value) => handleInputChange("metaLink", value)}
                />
              </div>
              <div className="column">
                <Textarea
                  type="text"
                  placeholder="Enter the meta description"
                  label="Description"
                  value={menuItem.metaDescription || menuItem.description}
                  onChange={(value) => handleInputChange("metaDescription", value)}
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
              <h2 className="sub_heading">Availability</h2>
              <div className="column">
                <Dropdown
                  placeholder="Select availability"
                  selectedValue={selectedValue.availability}
                  onClick={handleAvailabilitySelect}
                  options={selectOptions}
                  className="sm"
                />
              </div>
            </div>
            <div className="sidebar_item">
              <h2 className="sub_heading">Dietary Options</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="isVegetarian"
                  label="Vegetarian"
                  isChecked={menuItem.isVegetarian}
                  onChange={(isChecked) => handleCheckboxChange("isVegetarian", isChecked)}
                />
                <CheckBox
                  id="isVegan"
                  label="Vegan"
                  isChecked={menuItem.isVegan}
                  onChange={(isChecked) => handleCheckboxChange("isVegan", isChecked)}
                />
                <CheckBox
                  id="isGlutenFree"
                  label="Gluten Free"
                  isChecked={menuItem.isGlutenFree}
                  onChange={(isChecked) => handleCheckboxChange("isGlutenFree", isChecked)}
                />
                <CheckBox
                  id="isDairyFree"
                  label="Dairy Free"
                  isChecked={menuItem.isDairyFree}
                  onChange={(isChecked) => handleCheckboxChange("isDairyFree", isChecked)}
                />
              </div>
            </div>
            <div className="sidebar_item">
              <h2 className="sub_heading">Features</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="isSpicy"
                  label="Spicy"
                  isChecked={menuItem.isSpicy}
                  onChange={(isChecked) => handleCheckboxChange("isSpicy", isChecked)}
                />
                <CheckBox
                  id="isPopular"
                  label="Popular"
                  isChecked={menuItem.isPopular}
                  onChange={(isChecked) => handleCheckboxChange("isPopular", isChecked)}
                />
                <CheckBox
                  id="isSpecialOffer"
                  label="Special Offer"
                  isChecked={menuItem.isSpecialOffer}
                  onChange={(isChecked) => handleCheckboxChange("isSpecialOffer", isChecked)}
                />
              </div>
            </div>
            <div className="sidebar_item">
              <h2 className="sub_heading">Allergens</h2>
              <Tagify
                tagsData={allergenTags}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddMenuItem; 