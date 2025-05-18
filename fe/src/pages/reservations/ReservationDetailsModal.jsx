import React from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import * as Icons from "react-icons/tb";

const ReservationDetailsModal = ({ isOpen, onClose, reservation, onEdit }) => {
  if (!reservation) return null;

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Reservation Details</h2>
      </div>
      <div className="modal-body">
        <div className="details-section">
          <h3>Customer Information</h3>
          <div className="details-row">
            <div className="details-label">Name:</div>
            <div className="details-value">{reservation.customerName}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Email:</div>
            <div className="details-value">{reservation.customerEmail}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Phone:</div>
            <div className="details-value">{reservation.customerPhone}</div>
          </div>
        </div>

        <div className="details-section">
          <h3>Reservation Details</h3>
          <div className="details-row">
            <div className="details-label">Date:</div>
            <div className="details-value">{reservation.date}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Time:</div>
            <div className="details-value">{reservation.time}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Party Size:</div>
            <div className="details-value">{reservation.partySize} people</div>
          </div>
          <div className="details-row">
            <div className="details-label">Table:</div>
            <div className="details-value">{reservation.tableId}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Status:</div>
            <div className="details-value">
              <span className={`status-badge status-${reservation.status.toLowerCase()}`}>
                {reservation.status}
              </span>
            </div>
          </div>
        </div>

        {reservation.specialRequests && (
          <div className="details-section">
            <h3>Special Requests</h3>
            <div className="details-row">
              <div className="details-value special-requests">
                {reservation.specialRequests}
              </div>
            </div>
          </div>
        )}

        <div className="details-section">
          <h3>Additional Information</h3>
          <div className="details-row">
            <div className="details-label">Created On:</div>
            <div className="details-value">
              {new Date(reservation.createdAt).toLocaleString()}
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
        .special-requests {
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
        .status-confirmed {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        .status-pending {
          background-color: #fff8e1;
          color: #f57c00;
        }
        .status-cancelled {
          background-color: #ffebee;
          color: #c62828;
        }
        .status-completed {
          background-color: #e1f5fe;
          color: #0277bd;
        }
      `}</style>
    </Modal>
  );
};

export default ReservationDetailsModal; 