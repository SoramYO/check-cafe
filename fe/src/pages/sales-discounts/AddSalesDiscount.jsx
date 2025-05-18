import * as Icons from "react-icons/tb";
import React, { useState } from "react";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import CustomCalendar from "../../components/common/CustomCalendar.jsx";

const AddSalesDiscount = () => {
  const [discount, setDiscount] = useState({
    name: "",
    discountCode: "",
    discountType: "",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: new Date(),
    validTo: new Date(new Date().setDate(new Date().getDate() + 30)),
    isActive: true,
    description: ""
  });

  const [selectedValue, setSelectedValue] = useState({
    discountType: "",
    status: ""
  });

  const discountTypeOptions = [
    { value: "percentage", label: "Percentage" },
    { value: "fixed", label: "Fixed Amount" },
    { value: "bogo", label: "Buy One Get One" },
    { value: "free", label: "Free Item" }
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const handleInputChange = (key, value) => {
    setDiscount({
      ...discount,
      [key]: value
    });
  };

  const handleCheckboxChange = (key, checked) => {
    setDiscount({
      ...discount,
      [key]: checked
    });
  };

  const handleDiscountTypeSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      discountType: selectedOption.label
    });
    setDiscount({
      ...discount,
      discountType: selectedOption.value
    });
  };

  const handleStatusSelect = (selectedOption) => {
    setSelectedValue({
      ...selectedValue,
      status: selectedOption.label
    });
    setDiscount({
      ...discount,
      isActive: selectedOption.value === "active"
    });
  };

  const handleDateChange = (range) => {
    setDiscount({
      ...discount,
      validFrom: range[0],
      validTo: range[1]
    });
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <div className="content">
            <div className="content_item">
              <h2 className="sub_heading">Discount Information</h2>
              <div className="column_2">
                <Input
                  type="text"
                  placeholder="Enter discount name"
                  label="Discount Name"
                  icon={<Icons.TbDiscount2 />}
                  value={discount.name}
                  onChange={(value) => handleInputChange("name", value)}
                />
              </div>
              <div className="column_2">
                <Input
                  type="text"
                  placeholder="Enter discount code"
                  label="Discount Code"
                  icon={<Icons.TbTicket />}
                  value={discount.discountCode}
                  onChange={(value) => handleInputChange("discountCode", value)}
                />
              </div>
              <div className="column_2">
                <Dropdown
                  placeholder="Select discount type"
                  label="Discount Type"
                  selectedValue={selectedValue.discountType}
                  onClick={handleDiscountTypeSelect}
                  options={discountTypeOptions}
                />
              </div>
              <div className="column_2">
                <Input
                  type={selectedValue.discountType === "Percentage" ? "number" : "text"}
                  placeholder={selectedValue.discountType === "Percentage" ? "Enter percentage (e.g. 20)" : "Enter amount (e.g. 10.99)"}
                  label="Discount Value"
                  icon={selectedValue.discountType === "Percentage" ? <Icons.TbPercentage /> : <Icons.TbCurrency />}
                  value={discount.value}
                  onChange={(value) => handleInputChange("value", value)}
                />
              </div>
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Discount Limits</h2>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter minimum purchase amount"
                  label="Minimum Purchase"
                  icon={<Icons.TbCoinOff />}
                  value={discount.minPurchase}
                  onChange={(value) => handleInputChange("minPurchase", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter maximum discount amount"
                  label="Maximum Discount"
                  icon={<Icons.TbCoinUp />}
                  value={discount.maxDiscount}
                  onChange={(value) => handleInputChange("maxDiscount", value)}
                />
              </div>
              <div className="column_3">
                <Input
                  type="number"
                  placeholder="Enter usage limit per customer"
                  label="Usage Limit"
                  icon={<Icons.TbReceipt2 />}
                  value={discount.usageLimit}
                  onChange={(value) => handleInputChange("usageLimit", value)}
                />
              </div>
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Validity Period</h2>
              <CustomCalendar
                label="Valid From/To"
                selectedRange={[discount.validFrom, discount.validTo]}
                onChange={handleDateChange}
                isRangePicker={true}
              />
            </div>
            
            <div className="content_item">
              <h2 className="sub_heading">Additional Details</h2>
              <div className="column">
                <Textarea
                  placeholder="Enter any additional details about this discount"
                  label="Description"
                  icon={<Icons.TbNotes />}
                  value={discount.description}
                  onChange={(value) => handleInputChange("description", value)}
                />
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
              <h2 className="sub_heading">Discount Options</h2>
              <div className="sidebar_checkboxes">
                <CheckBox
                  id="applyToAllProducts"
                  label="Apply to All Products"
                  isChecked={discount.applyToAllProducts}
                  onChange={(isChecked) => handleCheckboxChange("applyToAllProducts", isChecked)}
                />
                <CheckBox
                  id="allowCombination"
                  label="Allow Combination with Other Discounts"
                  isChecked={discount.allowCombination}
                  onChange={(isChecked) => handleCheckboxChange("allowCombination", isChecked)}
                />
                <CheckBox
                  id="forNewCustomers"
                  label="For New Customers Only"
                  isChecked={discount.forNewCustomers}
                  onChange={(isChecked) => handleCheckboxChange("forNewCustomers", isChecked)}
                />
                <CheckBox
                  id="requiresMinimumItems"
                  label="Requires Minimum Items"
                  isChecked={discount.requiresMinimumItems}
                  onChange={(isChecked) => handleCheckboxChange("requiresMinimumItems", isChecked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddSalesDiscount; 