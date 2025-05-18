import React from "react";
import * as Icons from "react-icons/tb";
import Button from "../../components/common/Button.jsx";
import Modal from "../../components/common/Modal.jsx"; // Assume a reusable Modal component

const ShopDetailsModal = ({ isOpen, onClose, shop, onEdit }) => {
  if (!shop) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shop Details">
      <div className="modal-body">
        <div className="shop-details">
          <div className="detail-item">
            <strong>Name:</strong>
            <div>{shop.name}</div>
          </div>
          <div className="detail-item">
            <strong>Address:</strong>
            <div>{shop.address}</div>
          </div>
          <div className="detail-item">
            <strong>Phone:</strong>
            <div>{shop.phone}</div>
          </div>
          <div className="detail-item">
            <strong>Website:</strong>
            <div>
              <a href={shop.website} target="_blank" rel="noopener noreferrer">
                {shop.website}
              </a>
            </div>
          </div>
          <div className="detail-item">
            <strong>Description:</strong>
            <div>{shop.description}</div>
          </div>
          <div className="detail-item">
            <strong>Rating:</strong>
            <div>{shop.rating_avg.toFixed(1)} ({shop.rating_count} reviews)</div>
          </div>
          <div className="detail-item">
            <strong>Status:</strong>
            <div className={shop.is_open ? "shop-status-open" : "shop-status-closed"}>
              {shop.is_open ? "Open" : "Closed"}
            </div>
          </div>
          <div className="detail-item">
            <strong>Themes:</strong>
            <div>{shop.theme_ids.map((theme) => theme.name).join(", ") || "None"}</div>
          </div>
          <div className="detail-item">
            <strong>Amenities:</strong>
            <div>{shop.amenities.map((amenity) => amenity.label).join(", ") || "None"}</div>
          </div>
        </div>

        <div className="shop-details-section">
          <strong>Opening Hours:</strong>
          <ul>
            {Object.entries(shop.formatted_opening_hours).map(([day, hours]) => (
              <li key={day}>
                <strong>{day}:</strong> {hours}
              </li>
            ))}
          </ul>
        </div>

        {shop.mainImage?.url && (
          <div className="shop-details-section">
            <strong>Main Image:</strong>
            <div>
              <img
                src={shop.mainImage.url}
                alt={shop.name}
                className="shop-image"
              />
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <Button
          label="Close"
          className="sm outline"
          icon={<Icons.TbX />}
          onClick={onClose}
        />
        <Button
          label="Edit Shop"
          className="sm"
          icon={<Icons.TbEdit />}
          onClick={onEdit}
        />
      </div>
    </Modal>
  );
};

export default ShopDetailsModal;
