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
import MultiSelect from "../../components/common/MultiSelect.jsx";

const ManageShopThemes = () => {
  const [fields, setFields] = useState({
    name: "",
    category: "",
    status: ""
  });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [themes, setThemes] = useState([]);
  const [metadata, setMetadata] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
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

  const categoryOptions = [
    { label: "Modern" },
    { label: "Classic" },
    { label: "Minimalist" },
    { label: "Vibrant" },
    { label: "Elegant" }
  ];

  const statusOptions = [
    { label: "Active" },
    { label: "Inactive" },
    { label: "Draft" }
  ];

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Mock data for now, replace with actual API call when available
        const mockData = {
          data: {
            themes: [
              {
                _id: "1",
                name: "Cafe Modern",
                thumbnail: "/assets/themes/cafe-modern.jpg",
                category: "Modern",
                status: "Active",
                isDefault: true,
                isPremium: false,
                isResponsive: true,
                downloads: 250,
                rating: 4.8,
                createdAt: "2023-05-15T10:30:00Z",
                lastUpdated: "2023-06-20T14:30:00Z"
              },
              {
                _id: "2",
                name: "Cafe Classic",
                thumbnail: "/assets/themes/cafe-classic.jpg",
                category: "Classic",
                status: "Active",
                isDefault: false,
                isPremium: true,
                isResponsive: true,
                downloads: 120,
                rating: 4.5,
                createdAt: "2023-02-10T09:15:00Z",
                lastUpdated: "2023-05-05T11:20:00Z"
              },
              {
                _id: "3",
                name: "Minimalist Brew",
                thumbnail: "/assets/themes/minimal-brew.jpg",
                category: "Minimalist",
                status: "Draft",
                isDefault: false,
                isPremium: false,
                isResponsive: true,
                downloads: 0,
                rating: 0,
                createdAt: "2023-07-05T16:45:00Z",
                lastUpdated: "2023-07-05T16:45:00Z"
              }
            ],
            metadata: {
              totalItems: 3,
              totalPages: 1,
              currentPage: 1,
              limit: 10
            }
          }
        };
        setThemes(mockData.data.themes);
        setMetadata(mockData.data.metadata);
      } catch (err) {
        setError("Failed to fetch themes");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThemes();
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

  const handleBulkAction = (selectedOption) => {
    const selectedThemeIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      alert(`Deleting themes with IDs: ${selectedThemeIds.join(", ")}`);
    } else if (selectedOption.value === "activate") {
      alert(`Activating themes with IDs: ${selectedThemeIds.join(", ")}`);
    } else if (selectedOption.value === "deactivate") {
      alert(`Deactivating themes with IDs: ${selectedThemeIds.join(", ")}`);
    }
  };

  const actionItems = ["View", "Edit", "Delete", "Preview", "Set as Default"];

  const handleActionItemClick = (item, themeId) => {
    const action = item.toLowerCase();
    const theme = themes.find((t) => t._id === themeId);
    
    if (action === "view") {
      setSelectedTheme(theme);
      setIsDetailsModalOpen(true);
    } else if (action === "edit") {
      setSelectedTheme(theme);
      setIsEditModalOpen(true);
    } else if (action === "delete") {
      alert(`Deleting theme with ID: ${themeId}`);
    } else if (action === "preview") {
      alert(`Previewing theme: ${theme.name}`);
    } else if (action === "set as default") {
      alert(`Setting theme: ${theme.name} as default`);
    }
  };

  const handleUpdateTheme = (updatedTheme) => {
    setThemes((prev) =>
      prev.map((theme) => (theme._id === updatedTheme._id ? updatedTheme : theme))
    );
  };

  const handleToggleOffcanvas = () => {
    setIsOffcanvasOpen(!isOffcanvasOpen);
  };

  const handleCloseOffcanvas = () => {
    setIsOffcanvasOpen(false);
  };

  const handleSelectCategory = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      category: selectedValues.label,
    }));
  };

  const handleSelectStatus = (selectedValues) => {
    setFields((prev) => ({
      ...prev,
      status: selectedValues.label,
    }));
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Active") {
      return "success";
    } else if (status === "Inactive") {
      return "warning";
    } else if (status === "Draft") {
      return "info";
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

  const thumbnailStyle = {
    width: "60px",
    height: "40px",
    objectFit: "cover",
    borderRadius: "4px"
  };

  return (
    <section className="table">
      <div className="container">
        <div className="heading">
          <div className="heading_left">
            <h1>Manage Shop Themes</h1>
          </div>
          <div className="heading_right">
            <Link to="/shop-theme/add">
              <Button
                label="add theme"
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
                  <th className="w_2">Image</th>
                  <th className="w_4">Name</th>
                  <th className="w_3">Category</th>
                  <th className="w_2">Default</th>
                  <th className="w_2">Premium</th>
                  <th className="w_3">Downloads</th>
                  <th className="w_2">Rating</th>
                  <th className="w_3">Last Updated</th>
                  <th className="w_2">Status</th>
                  <th className="w_4">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="loading">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="error">
                      {error}
                    </td>
                  </tr>
                ) : themes.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="no_data">
                      No themes found
                    </td>
                  </tr>
                ) : (
                  themes.map((theme) => (
                    <tr key={theme._id}>
                      <td>
                        <CheckBox
                          id={`check_${theme._id}`}
                          label=""
                          onChange={(isCheck) =>
                            handleCheckTheme(isCheck, theme._id)
                          }
                          isChecked={specificChecks[theme._id] || false}
                        />
                      </td>
                      <td>
                        <img 
                          src={theme.thumbnail} 
                          alt={theme.name} 
                          style={thumbnailStyle}
                        />
                      </td>
                      <td>{theme.name}</td>
                      <td>{theme.category}</td>
                      <td>
                        {theme.isDefault ? (
                          <Icons.TbCircleCheck style={{ color: 'green' }} />
                        ) : (
                          <Icons.TbCircleX style={{ color: 'gray' }} />
                        )}
                      </td>
                      <td>
                        {theme.isPremium ? (
                          <Icons.TbCircleCheck style={{ color: 'green' }} />
                        ) : (
                          <Icons.TbCircleX style={{ color: 'gray' }} />
                        )}
                      </td>
                      <td>{theme.downloads}</td>
                      <td>{theme.rating > 0 ? theme.rating.toFixed(1) : 'N/A'}</td>
                      <td>{formatDate(theme.lastUpdated)}</td>
                      <td>
                        <Badge
                          label={theme.status}
                          className={getStatusBadgeClass(theme.status)}
                        />
                      </td>
                      <td>
                        <div style={actionButtonsStyle}>
                          <TableAction
                            actionItems={actionItems}
                            onClick={(item) =>
                              handleActionItemClick(item, theme._id)
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
          <h2>Filter Themes</h2>
        </div>
        <div className="offcanvas_body">
          <Input
            type="text"
            placeholder="Search by name"
            label="Theme Name"
            icon={<Icons.TbSearch />}
            value={fields.name}
            onChange={(value) => handleInputChange("name", value)}
          />
          <Dropdown
            placeholder="Select category"
            label="Category"
            selectedValue={fields.category}
            onClick={handleSelectCategory}
            options={categoryOptions}
          />
          <Dropdown
            placeholder="Select status"
            label="Status"
            selectedValue={fields.status}
            onClick={handleSelectStatus}
            options={statusOptions}
          />
          <div className="mt-3">
            <CheckBox
              id="filterDefault"
              label="Default Themes Only"
              onChange={(isChecked) => handleInputChange("isDefault", isChecked ? "true" : "")}
            />
          </div>
          <div className="mt-3">
            <CheckBox
              id="filterPremium"
              label="Premium Themes Only"
              onChange={(isChecked) => handleInputChange("isPremium", isChecked ? "true" : "")}
            />
          </div>
          <div className="mt-3">
            <CheckBox
              id="filterResponsive"
              label="Responsive Themes Only"
              onChange={(isChecked) => handleInputChange("isResponsive", isChecked ? "true" : "")}
            />
          </div>
        </div>
        <div className="offcanvas_footer">
          <Button
            label="clear filter"
            icon={<Icons.TbFilterOff />}
            className="danger outline"
            onClick={() =>
              setFields({
                name: "",
                category: "",
                status: ""
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
      
    </section>
  );
};

export default ManageShopThemes; 