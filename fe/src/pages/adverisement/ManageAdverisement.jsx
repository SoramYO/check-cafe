import * as Icons from "react-icons/tb";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input.jsx";
import Badge from "../../components/common/Badge.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import Modal from "../../components/common/Modal.jsx";
import Textarea from "../../components/common/Textarea.jsx";
import Dropdown from "../../components/common/Dropdown.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import TableAction from "../../components/common/TableAction.jsx";
import shopAPI from "../../apis/shop";

const ManageAdvertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [metadata, setMetadata] = useState({ currentPage: 1, limit: 5, totalItems: 0, totalPages: 1 });
  const [bulkCheck, setBulkCheck] = useState(false);
  const [specificChecks, setSpecificChecks] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedValue, setSelectedValue] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });

  const tableRowOptions = [
    { value: 2, label: "2" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
  ];

  const bulkAction = [
    { value: "delete", label: "Delete" },
    { value: "status", label: "Update Status" },
  ];

  // Fetch advertisements
  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopAPI.getAdvertisements("/advertisements", {
          page: currentPage,
          limit: selectedValue,
        });
        setAdvertisements(response.data.advertisements.data);
        setMetadata(response.data.metadata);
      } catch (err) {
        setError("Failed to fetch advertisements");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, [currentPage, selectedValue]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleBulkCheckbox = (isCheck) => {
    setBulkCheck(isCheck);
    if (isCheck) {
      const updateChecks = {};
      advertisements.forEach((ad) => {
        updateChecks[ad._id] = true;
      });
      setSpecificChecks(updateChecks);
    } else {
      setSpecificChecks({});
    }
  };

  const handleCheckAd = (isCheck, id) => {
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
    const selectedAdIds = Object.keys(specificChecks).filter((id) => specificChecks[id]);
    if (selectedOption.value === "delete") {
      if (selectedAdIds.length === 0) {
        alert("Please select at least one advertisement to delete.");
        return;
      }
      if (window.confirm(`Are you sure you want to delete ${selectedAdIds.length} advertisement(s)?`)) {
        setIsLoading(true);
        setError(null);
        try {
          await Promise.all(
            selectedAdIds.map((id) => shopAPI.deleteAdvertisement(`/advertisements/${id}`))
          );
          setAdvertisements((prev) => prev.filter((ad) => !selectedAdIds.includes(ad._id)));
          setSpecificChecks({});
          setBulkCheck(false);
        } catch (err) {
          setError("Failed to delete advertisements");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (selectedOption.value === "status") {
      alert(`Updating status for advertisements with IDs: ${selectedAdIds.join(", ")}`);
      // Implement status update API call
    }
  };

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const openDetailModal = (ad) => {
    setSelectedAd(ad);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedAd(null);
  };

  const openEditModal = (ad) => {
    setSelectedAd(ad);
    setFormData({
      title: ad?.title || "",
      content: ad?.content || "",
      image: null,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedAd(null);
    setFormData({ title: "", content: "", image: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      if (formData.image) {
        data.append("image", formData.image);
      }

      let response;
      if (selectedAd) {
        // Update advertisement
        response = await shopAPI.updateAdvertisement(`/advertisements/${selectedAd._id}`, data);
        setAdvertisements((prev) =>
          prev.map((ad) => (ad._id === selectedAd._id ? response.data.advertisement : ad))
        );
      } else {
        // Create advertisement
        response = await shopAPI.createAdvertisement("/advertisements", data);
        setAdvertisements((prev) => [...prev, response.data.advertisement]);
      }
      closeEditModal();
    } catch (err) {
      setError(err.message || "Failed to save advertisement");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionItems = ["View", "Edit", "Delete"];

  const handleActionItemClick = async (item, adId) => {
    const action = item.toLowerCase();
    const ad = advertisements.find((a) => a._id === adId);
    if (action === "delete") {
      if (window.confirm(`Are you sure you want to delete advertisement "${ad.title}"?`)) {
        setIsLoading(true);
        setError(null);
        try {
          await shopAPI.deleteAdvertisement(`/advertisements/${adId}`);
          setAdvertisements((prev) => prev.filter((a) => a._id !== adId));
          setSpecificChecks((prev) => {
            const updated = { ...prev };
            delete updated[adId];
            return updated;
          });
        } catch (err) {
          setError("Failed to delete advertisement");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    } else if (action === "edit") {
      openEditModal(ad);
    } else if (action === "view") {
      openDetailModal(ad);
    }
  };

  return (
    <section className="advertisements">
      <div className="container">
        <div className="wrapper">
          <div className="content transparent">
            <div className="content_head">
              <Dropdown
                placeholder="Bulk Action"
                className="sm"
                onClick={bulkActionDropDown}
                options={bulkAction}
              />
              <Input
                placeholder="Search Advertisements..."
                className="sm table_search"
                onChange={(value) => handleInputChange("title", value)}
              />
              <div className="btn_parent">
                <Link to="/advertisements/add" className="sm button">
                  <Icons.TbPlus />
                  <span>Create Advertisement</span>
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
                        <th>Title</th>
                        <th>Content</th>
                        <th>Created At</th>
                        <th className="td_action">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advertisements.map((ad) => (
                        <tr key={ad._id}>
                          <td className="td_checkbox">
                            <CheckBox
                              onChange={(isCheck) => handleCheckAd(isCheck, ad._id)}
                              isChecked={specificChecks[ad._id] || false}
                            />
                          </td>
                          <td className="td_id">{ad._id}</td>
                          <td className="td_image">
                            {ad.image ? (
                              <img src={ad.image} alt={ad.title} style={{ width: "50px", height: "auto", borderRadius: "4px" }} />
                            ) : (
                              "No Image"
                            )}
                          </td>
                          <td>
                            <Link to={`/advertisements/${ad._id}`}>{ad.title}</Link>
                          </td>
                          <td>{ad.content}</td>
                          <td>{new Date(ad.createdAt).toLocaleDateString()}</td>
                          <td className="td_action">
                            <TableAction
                              actionItems={actionItems}
                              onActionItemClick={(item) => handleActionItemClick(item, ad._id)}
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
                totalPages={metadata.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Detail Modal */}
      <Modal isOpen={detailModalOpen} onClose={closeDetailModal} title="Advertisement Details">
        {selectedAd && (
          <>
            <div className="modal-body">
              <div className="ad-details">
                <div className="detail-item">
                  <strong>Title:</strong>
                  <div>{selectedAd.title}</div>
                </div>
                <div className="detail-item">
                  <strong>Content:</strong>
                  <div>{selectedAd.content}</div>
                </div>
                <div className="detail-item">
                  <strong>Created At:</strong>
                  <div>{new Date(selectedAd.createdAt).toLocaleDateString()}</div>
                </div>
                {selectedAd.image && (
                  <div className="detail-item">
                    <strong>Image:</strong>
                    <div>
                      <img
                        src={selectedAd.image}
                        alt={selectedAd.title}
                        className="ad-image"
                        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <Button
                label="Close"
                className="sm outline"
                icon={<Icons.TbX />}
                onClick={closeDetailModal}
              />
              <Button
                label="Edit"
                className="sm"
                icon={<Icons.TbEdit />}
                onClick={() => {
                  closeDetailModal();
                  openEditModal(selectedAd);
                }}
              />
            </div>
          </>
        )}
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={closeEditModal} title={selectedAd ? "Edit Advertisement" : "Create Advertisement"}>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error">{error}</div>}
            <div className="form-group">
              <Input
                type="text"
                label="Title"
                value={formData.title}
                onChange={(value) => handleInputChange("title", value)}
                placeholder="Enter advertisement title"
                required
              />
            </div>
            <div className="form-group">
              <Textarea
                label="Content"
                value={formData.content}
                onChange={(value) => handleInputChange("content", value)}
                placeholder="Enter advertisement content"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-input"
              />
              {selectedAd?.image && (
                <img
                  src={selectedAd.image}
                  alt="Current ad"
                  style={{ width: "100px", height: "auto", marginTop: "10px", borderRadius: "4px" }}
                />
              )}
            </div>
          </div>
          <div className="modal-footer">
            <Button
              label="Cancel"
              className="sm outline"
              icon={<Icons.TbX />}
              type="button"
              onClick={closeEditModal}
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

export default ManageAdvertisement;
