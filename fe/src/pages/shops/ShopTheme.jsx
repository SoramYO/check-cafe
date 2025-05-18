import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Modal from "../../components/common/Modal.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import Divider from "../../components/common/Divider.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import shopAPI from "../../apis/shop";

const ShopTheme = () => {
  const [themes, setThemes] = useState([]);
  const [metadata, setMetadata] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalActive, setModalActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    theme_image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "status", label: "Update Status" },
  ];

  // Fetch themes from API
  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopAPI.getThemes("/themes", {
          page: currentPage,
          limit: selectedValue,
        });
        setThemes(response.data.themes);
        setMetadata(response.data.metadata);
      } catch (err) {
        setError("Failed to fetch themes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemes();
  }, [currentPage, selectedValue]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, theme_image: file }));
      
      // Tạo URL preview cho file ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkCheckbox = (isCheck) => {
    setBulkCheck(isCheck);
    if (isCheck) {
      const updateChecks = {};
      themes.forEach((theme) => {
        updateChecks[theme._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckTheme = (isCheck, id) => {
    setSpecificChecks((prev) => ({
      ...prev,
      [id]: isCheck,
    }));
  };

  const showTableRow = (selectedOption) => {
    setSelectedValue(selectedOption.value);
    setCurrentPage(1);
  };

  const bulkActionDropDown = async (selectedOption) => {
    const selectedThemeIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedThemeIds.length} themes?`)) {
        setIsLoading(true);
        try {
          await Promise.all(selectedThemeIds.map(id => shopAPI.deleteTheme(`/themes/${id}`)));
          setThemes(prev => prev.filter(theme => !selectedThemeIds.includes(theme._id)));
          setSuccessMessage("Themes deleted successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
          setError("Failed to delete themes");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openModal = (theme = null) => {
    setSelectedTheme(theme);
    setFormData({
      name: theme?.name || "",
      description: theme?.description || "",
      theme_image: null,
    });
    setPreviewImage(theme?.theme_image || null);
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
    setSelectedTheme(null);
    setFormData({ name: "", description: "", theme_image: null });
    setPreviewImage(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      
      if (formData.theme_image) {
        data.append("theme_image", formData.theme_image);
      }

      let response;
      if (selectedTheme) {
        // Update theme
        response = await shopAPI.updateTheme(`/themes/${selectedTheme._id}`, data);
        setThemes((prev) =>
          prev.map((theme) => (theme._id === selectedTheme._id ? response.data.theme : theme))
        );
        setSuccessMessage("Theme updated successfully");
      } else {
        // Create theme
        response = await shopAPI.createTheme("/themes", data);
        setThemes((prev) => [...prev, response.data.theme]);
        setSuccessMessage("Theme created successfully");
      }
      
      setTimeout(() => {
        closeModal();
        setSuccessMessage("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to save theme");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionItems = ["Edit", "Delete"];

  const handleActionItemClick = async (item, themeId) => {
    const action = item.toLowerCase();
    const theme = themes.find((t) => t._id === themeId);
    
    if (action === "delete") {
      if (window.confirm(`Are you sure you want to delete this theme?`)) {
        setIsLoading(true);
        try {
          await shopAPI.deleteTheme(`/themes/${themeId}`);
          setThemes(prev => prev.filter(t => t._id !== themeId));
          setSuccessMessage("Theme deleted successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
          setError("Failed to delete theme");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (action === "edit") {
      openModal(theme);
    }
  };

  return (
    <section className="themes">
      <div className="container">
        {successMessage && (
          <div className="success-message" style={{
            padding: '10px',
            marginBottom: '20px',
            background: '#e6f7e6',
            color: '#2e7d32',
            borderRadius: '4px',
            border: '1px solid #2e7d32'
          }}>
            {successMessage}
          </div>
        )}
        <div className="wrapper">
          <div className="sidebar">
            <div className="sidebar_item">
              <h2 className="sub_heading">Add Theme</h2>
              <form onSubmit={handleSubmit}>
                <div className="column">
                  <Input
                    type="text"
                    placeholder="Enter theme name"
                    label="Name"
                    value={formData.name}
                    onChange={(value) => handleInputChange("name", value)}
                    required
                  />
                </div>
                <div className="column">
                  <Textarea
                    placeholder="Enter theme description"
                    label="Description"
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                  />
                </div>
                <div className="column">
                  <label className="form-label">Theme Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-input"
                  />
                  {previewImage && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                      />
                    </div>
                  )}
                </div>
                <Divider />
                <Button
                  label="Discard"
                  className="right outline"
                  type="button"
                  onClick={() => {
                    setFormData({ name: "", description: "", theme_image: null });
                    setPreviewImage(null);
                  }}
                />
                <Button
                  label={isLoading ? "Saving..." : "Save"}
                  type="submit"
                  disabled={isLoading}
                />
              </form>
            </div>
          </div>
          <div className="content transparent">
            <div className="content_head">
              <Dropdown
                placeholder="Bulk Action"
                className="sm"
                onClick={bulkActionDropDown}
                options={bulkAction}
              />
              <Input
                placeholder="Search Themes..."
                className="sm table_search"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
              />
              <div className="btn_parent">
                <Button
                  label="Create Theme"
                  className="sm"
                  icon={<Icons.TbPlus />}
                  onClick={() => openModal()}
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
                        <th>Name</th>
                        <th>Description</th>
                        <th>Image</th>
                        <th className="td_date">Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {themes?.map((theme) => (
                        <tr key={theme._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckTheme(isCheck, theme._id)}
                              isChecked={specificChecks[theme._id] || false}
                            />
                          </td>
                          <td className="td_id">{theme._id}</td>
                          <td>
                            <Link to={`/themes/${theme._id}`}>{theme.name}</Link>
                          </td>
                          <td>{theme.description}</td>
                          <td>
                            {theme.theme_image ? (
                              <img
                                src={theme.theme_image}
                                alt={theme.name}
                                style={{ width: "50px", height: "50px", borderRadius: "4px", objectFit: "cover" }}
                              />
                            ) : (
                              "No Image"
                            )}
                          </td>
                          <td className="td_date">
                            {new Date(theme.createdAt).toLocaleDateString()}
                          </td>
                          <td className="td_action">
                            <TableAction
                              actionItems={actionItems}
                              onActionItemClick={(item) => handleActionItemClick(item, theme._id)}
                            />
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
                totalPages={metadata?.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={isModalActive} onClose={closeModal} title={selectedTheme ? "Edit Theme" : "Create Theme"}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error">{error}</div>}
            {successMessage && (
              <div className="success">{successMessage}</div>
            )}
            <div className="form-group">
              <Input
                type="text"
                placeholder="Enter theme name"
                label="Name"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                required
              />
            </div>
            <div className="form-group">
              <Textarea
                placeholder="Enter theme description"
                label="Description"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Theme Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              {previewImage && (
                <div style={{ marginTop: '15px' }}>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} 
                  />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <Button
              label="Cancel"
              className="sm outline"
              type="button"
              icon={<Icons.TbX />}
              onClick={closeModal}
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
    </section>
  );
};

export default ShopTheme;
