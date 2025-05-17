import React from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import * as Icons from "react-icons/tb";

const SeatDetailsModal = ({ isOpen, onClose, seat, onEdit }) => {
  if (!seat) return null;

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Seat Details</h2>
      </div>
      <div className="modal-body">
        <div className="details-section">
          <h3>Seat Information</h3>
          <div className="details-row">
            <div className="details-label">Seat Number:</div>
            <div className="details-value">{seat.seatNumber}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Type:</div>
            <div className="details-value">{seat.type}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Location:</div>
            <div className="details-value">{seat.location}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Capacity:</div>
            <div className="details-value">{seat.capacity} people</div>
          </div>
          <div className="details-row">
            <div className="details-label">Status:</div>
            <div className="details-value">
              <span className={`status-badge status-${seat.status.toLowerCase()}`}>
                {seat.status}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Features</h3>
          <div className="details-row">
            <div className="details-label">VIP:</div>
            <div className="details-value">{seat.isVIP ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Accessible:</div>
            <div className="details-value">{seat.isAccessible ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Outdoor:</div>
            <div className="details-value">{seat.isOutdoor ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Reserved:</div>
            <div className="details-value">{seat.isReserved ? "Yes" : "No"}</div>
          </div>
        </div>

        {seat.notes && (
          <div className="details-section">
            <h3>Notes</h3>
            <div className="details-row">
              <div className="details-value notes">
                {seat.notes}
              </div>
            </div>
          </div>
        )}

        <div className="details-section">
          <h3>Additional Information</h3>
          <div className="details-row">
            <div className="details-label">Created On:</div>
            <div className="details-value">
              {new Date(seat.createdAt).toLocaleString()}
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
        .notes {
          background: #f9f9f9;
          padding: 10px;
          border-radius: 4px;
          font-style: italic;
          color: #555;
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
        .status-maintenance {
          background-color: #fff8e1;
          color: #f57c00;
        }
        .status-reserved {
          background-color: #ffebee;
          color: #c62828;
        }
      `}</style>
    </Modal>
  );
};

export default SeatDetailsModal; 