import React from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import * as Icons from "react-icons/tb";

const MenuItemDetailsModal = ({ isOpen, onClose, menuItem, onEdit }) => {
  if (!menuItem) return null;

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Menu Item Details</h2>
      </div>
      <div className="modal-body">
        {menuItem.mainImage?.url && (
          <div className="details-section image-section">
            <img src={menuItem.mainImage.url} alt={menuItem.name} className="menu-item-image" />
          </div>
        )}

        <div className="details-section">
          <h3>Basic Information</h3>
          <div className="details-row">
            <div className="details-label">Name:</div>
            <div className="details-value">{menuItem.name}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Category:</div>
            <div className="details-value">{menuItem.category}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Price:</div>
            <div className="details-value">${menuItem.price?.toFixed(2)}</div>
          </div>
          {menuItem.priceSale && parseFloat(menuItem.priceSale) > 0 && (
            <div className="details-row">
              <div className="details-label">Sale Price:</div>
              <div className="details-value">${parseFloat(menuItem.priceSale).toFixed(2)}</div>
            </div>
          )}
          <div className="details-row">
            <div className="details-label">Status:</div>
            <div className="details-value">
              <span className={`status-badge status-${menuItem.status?.toLowerCase()}`}>
                {menuItem.status || "Not Set"}
              </span>
            </div>
          </div>
        </div>

        {menuItem.description && (
          <div className="details-section">
            <h3>Description</h3>
            <div className="details-row">
              <div className="details-value description">
                {menuItem.description}
              </div>
            </div>
          </div>
        )}

        {menuItem.ingredients && (
          <div className="details-section">
            <h3>Ingredients</h3>
            <div className="details-row">
              <div className="details-value">
                {menuItem.ingredients.split(',').map((ingredient, index) => (
                  <span key={index} className="ingredient-tag">{ingredient.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="details-section">
          <h3>Preparation Details</h3>
          <div className="details-row">
            <div className="details-label">Prep Time:</div>
            <div className="details-value">{menuItem.preparationTime || "Not specified"} minutes</div>
          </div>
          <div className="details-row">
            <div className="details-label">Calories:</div>
            <div className="details-value">{menuItem.calories || "Not specified"}</div>
          </div>
        </div>

        <div className="details-section">
          <h3>Dietary Information</h3>
          <div className="details-row">
            <div className="details-label">Vegetarian:</div>
            <div className="details-value">{menuItem.isVegetarian ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Vegan:</div>
            <div className="details-value">{menuItem.isVegan ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Gluten Free:</div>
            <div className="details-value">{menuItem.isGlutenFree ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Dairy Free:</div>
            <div className="details-value">{menuItem.isDairyFree ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Spicy:</div>
            <div className="details-value">{menuItem.isSpicy ? "Yes" : "No"}</div>
          </div>
        </div>

        <div className="details-section">
          <h3>Marketing Information</h3>
          <div className="details-row">
            <div className="details-label">Popular:</div>
            <div className="details-value">{menuItem.isPopular ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Special Offer:</div>
            <div className="details-value">{menuItem.isSpecialOffer ? "Yes" : "No"}</div>
          </div>
        </div>

        <div className="details-section">
          <h3>Additional Information</h3>
          <div className="details-row">
            <div className="details-label">Created On:</div>
            <div className="details-value">
              {menuItem.createdAt ? new Date(menuItem.createdAt).toLocaleString() : "Unknown"}
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <Button
          label="Close"
          className="outline"
          icon={<Icons.TbX />}
          onClick={onClose}
        />
        <Button
          label="Edit"
          className=""
          icon={<Icons.TbEdit />}
          onClick={onEdit}
        />
      </div>

      <style jsx>{`
        .details-section {
          margin-bottom: 20px;
        }
        .details-section h3 {
          font-size: 16px;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .details-row {
          display: flex;
          margin-bottom: 8px;
        }
        .details-label {
          font-weight: 500;
          width: 120px;
          color: #666;
        }
        .details-value {
          flex: 1;
        }
        .image-section {
          text-align: center;
          margin-bottom: 20px;
        }
        .menu-item-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
        }
        .description {
          background: #f9f9f9;
          padding: 10px;
          border-radius: 4px;
          color: #555;
          line-height: 1.5;
        }
        .ingredient-tag {
          display: inline-block;
          background: #e1f5fe;
          color: #0277bd;
          font-size: 12px;
          padding: 4px 8px;
          margin-right: 8px;
          margin-bottom: 8px;
          border-radius: 4px;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-available {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        .status-unavailable {
          background-color: #ffebee;
          color: #c62828;
        }
        .status-seasonal {
          background-color: #fff8e1;
          color: #f57c00;
        }
      `}</style>
    </Modal>
  );
};

export default MenuItemDetailsModal; 