import * as Icons from "react-icons/tb";
import React, { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import FileUpload from "../../components/common/FileUpload.jsx";
import ColorPicker from "../../components/common/Input.jsx"; // Using Input as color picker

const AddShopTheme = () => {
  const [theme, setTheme] = useState({
    name: "",
    description: "",
    category: "",
    status: "",
    isDefault: false,
    isResponsive: true,
    isPremium: false,
    isCustomizable: true,
    primaryColor: "#3498db",
    secondaryColor: "#2ecc71",
    accentColor: "#e74c3c",
    backgroundColor: "#f8f9fa",
    textColor: "#333333",
    fontFamily: "",
    headerStyle: "",
    footerStyle: ""
  });

  const [selectedValue, setSelectedValue] = useState({
    category: "",
    status: "",
    headerStyle: "",
    footerStyle: ""
  });

  const categoryOptions = [
    { value: "modern", label: "Modern" },
    { value: "classic", label: "Classic" },
    { value: "minimal", label: "Minimalist" },
    { value: "vibrant", label: "Vibrant" },
    { value: "elegant", label: "Elegant" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" }
  ];

  const headerStyleOptions = [
    { value: "fixed", label: "Fixed" },
    { value: "transparent", label: "Transparent" },
    { value: "sticky", label: "Sticky" },
    { value: "standard", label: "Standard" }
  ];

  const footerStyleOptions = [
    { value: "standard", label: "Standard" },
    { value: "minimal", label: "Minimal" },
    { value: "detailed", label: "Detailed" },
    { value: "centered", label: "Centered" }
  ];

  const fontFamilyOptions = [
    { value: "roboto", label: "Roboto" },
    { value: "open-sans", label: "Open Sans" },
    { value: "lato", label: "Lato" },
    { value: "montserrat", label: "Montserrat" },
    { value: "poppins", label: "Poppins" }
  ];

  const handleInputChange = (key, value) => {
    setTheme({
      ...theme,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setTheme({
      ...theme,
      [key]: checked
    });
  };

  const handleCategorySelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      category: selectedOption.label
    });
    setTheme({
      ...theme,
      category: selectedOption.value
    });
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      status: selectedOption.label
    });
    setTheme({
      ...theme,
      status: selectedOption.value
    });
  };

  const handleHeaderStyleSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      headerStyle: selectedOption.label
    });
    setTheme({
      ...theme,
      headerStyle: selectedOption.value
    });
  };

  const handleFooterStyleSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      footerStyle: selectedOption.label
    });
    setTheme({
      ...theme,
      footerStyle: selectedOption.value
    });
  };

  const handleFontFamilySelect = (selectedOption) => {
    setTheme({
      ...theme,
      fontFamily: selectedOption.value
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Basic Information</h2>
              <div className="column_2">
                <Input
                  type="text"
                  placeholder="Enter theme name"
                  label="Theme Name"
                  icon={<Icons.TbPalette />}
                  value={theme.name}
                  onChange={(value) => handleInputChange("name", value)}
                />
              </div>
              <div className="column_2">
                <Dropdown
                  placeholder="Select category"
                  label="Category"
                  selectedValue={selectedValue.category}
                  onClick={handleCategorySelect}
                  options={categoryOptions}
                />
              </div>
              <div className="column">
                <Textarea
                  placeholder="Enter theme description"
                  label="Description"
                  icon={<Icons.TbNotes />}
                  value={theme.description}
                  onChange={(value) => handleInputChange("description", value)}
                />
              </div>
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Theme Preview</h2>
              <FileUpload label="Theme Screenshot" />
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Color Scheme</h2>
              <div className="column_3">
                <Input
                  type="color"
                  label="Primary Color"
                  value={theme.primaryColor}
                  onChange={(value) => handleInputChange("primaryColor", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="color"
                  label="Secondary Color"
                  value={theme.secondaryColor}
                  onChange={(value) => handleInputChange("secondaryColor", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="color"
                  label="Accent Color"
                  value={theme.accentColor}
                  onChange={(value) => handleInputChange("accentColor", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="color"
                  label="Background Color"
                  value={theme.backgroundColor}
                  onChange={(value) => handleInputChange("backgroundColor", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="color"
                  label="Text Color"
                  value={theme.textColor}
                  onChange={(value) => handleInputChange("textColor", value)}
                />
              </div>
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Layout Options</h2>
              <div className="column_2">
                <Dropdown
                  placeholder="Select header style"
                  label="Header Style"
                  selectedValue={selectedValue.headerStyle}
                  onClick={handleHeaderStyleSelect}
                  options={headerStyleOptions}
                />
              </div>
              <div className="column_2">
                <Dropdown
                  placeholder="Select footer style"
                  label="Footer Style"
                  selectedValue={selectedValue.footerStyle}
                  onClick={handleFooterStyleSelect}
                  options={footerStyleOptions}
                />
              </div>
              <div className="column">
                <Dropdown
                  placeholder="Select font family"
                  label="Font Family"
                  onClick={handleFontFamilySelect}
                  options={fontFamilyOptions}
                />
              </div>
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Theme Assets</h2>
              <FileUpload label="Theme Template Files (ZIP)" />
              <div className="mt-3">
                <FileUpload label="Theme CSS File" />
              </div>
              <div className="mt-3">
                <FileUpload label="Theme JavaScript File" />
              </div>
            </div>
          </div>
          
          <div className="sidebar">
            <div className="sidebar_item">
              <h2 className="sub_heading">Publish</h2>
              <Dropdown
                placeholder="Select status"
                label="Status"
                selectedValue={selectedValue.status}
                onClick={handleStatusSelect}
                options={statusOptions}
              />
              <div className="mt-3">
                <Button
                  label="save & exit"
                  icon={<Icons.TbDeviceFloppy />}
                  className=""
                />
              </div>
              <div className="mt-2">
                <Button
                  label="save"
                  icon={<Icons.TbCircleCheck />}
                  className="success"
                />
              </div>
            </div>
            
            <div className="sidebar_item">
              <h2 className="sub_heading">Theme Features</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="isDefault"
                  label="Set as Default Theme"
                  isChecked={theme.isDefault}
                  onChange={(isChecked) => handleCheckboxChange("isDefault", isChecked)}
                />
                <CheckBox
                  id="isResponsive"
                  label="Mobile Responsive"
                  isChecked={theme.isResponsive}
                  onChange={(isChecked) => handleCheckboxChange("isResponsive", isChecked)}
                />
                <CheckBox
                  id="isPremium"
                  label="Premium Theme"
                  isChecked={theme.isPremium}
                  onChange={(isChecked) => handleCheckboxChange("isPremium", isChecked)}
                />
                <CheckBox
                  id="isCustomizable"
                  label="User Customizable"
                  isChecked={theme.isCustomizable}
                  onChange={(isChecked) => handleCheckboxChange("isCustomizable", isChecked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddShopTheme; 