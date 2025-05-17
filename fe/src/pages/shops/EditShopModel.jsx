import React, { useState, useEffect } from "react";
import * as Icons from "react-icons/tb";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import Modal from "../../components/common/Modal.jsx";
import shopAPI from "../../apis/shop";

const EditShopModal = ({ isOpen, onClose, shop, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    description: "",
    theme_ids: [],
    amenities: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const themes = [{ label: "Sân vườn", value: "682074de420997d7051394ba" }];
  const amenities = [
    { label: "Cho thú cưng vào", value: "6820f0e5628427b63b334ad3" },
    { label: "WiFi miễn phí", value: "6820f0e5628427b63b334ad7" },
  ];

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || "",
        address: shop.address || "",
        phone: shop.phone || "",
        website: shop.website || "",
        description: shop.description || "",
        theme_ids: shop.theme_ids.map((theme) => theme._id) || [],
        amenities: shop.amenities.map((amenity) => amenity._id) || [],
      });
    }
  }, [shop]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = (key, selectedValues) => {
    setFormData((prev) => ({ ...prev, [key]: selectedValues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");
    try {
      const response = await shopAPI.updateShop(`/shops/${shop._id}`, formData);
      setSuccessMessage("Shop updated successfully!");
      onUpdate(response.data);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError("Failed to update shop");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!shop) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Shop">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
          <div className="form-group">
            <Input
              type="text"
              label="Name"
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              placeholder="Enter shop name"
            />
          </div>
          <div className="form-group">
            <Input
              type="text"
              label="Address"
              value={formData.address}
              onChange={(value) => handleInputChange("address", value)}
              placeholder="Enter shop address"
            />
          </div>
          <div className="form-group">
            <Input
              type="text"
              label="Phone"
              value={formData.phone}
              onChange={(value) => handleInputChange("phone", value)}
              placeholder="Enter shop phone"
            />
          </div>
          <div className="form-group">
            <Input
              type="text"
              label="Website"
              value={formData.website}
              onChange={(value) => handleInputChange("website", value)}
              placeholder="Enter shop website"
            />
          </div>
          <div className="form-group">
            <Input
              type="textarea"
              label="Description"
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="Enter shop description"
            />
          </div>
          <div className="form-group">
            <MultiSelect
              options={themes}
              label="Themes"
              isSelected={formData.theme_ids}
              onChange={(values) => handleSelectChange("theme_ids", values)}
              placeholder="Select themes"
            />
          </div>
          <div className="form-group">
            <MultiSelect
              options={amenities}
              label="Amenities"
              isSelected={formData.amenities}
              onChange={(values) => handleSelectChange("amenities", values)}
              placeholder="Select amenities"
            />
          </div>
        </div>
        <div className="modal-footer">
          <Button
            label="Cancel"
            className="sm outline"
            icon={<Icons.TbX />}
            onClick={onClose}
          />
          <Button
            label={isLoading ? "Saving..." : "Save"}
            className="sm"
            type="submit"
            icon={<Icons.TbCheck />}
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditShopModal;