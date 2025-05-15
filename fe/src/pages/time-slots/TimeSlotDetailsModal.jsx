import React from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import * as Icons from "react-icons/tb";

const TimeSlotDetailsModal = ({ isOpen, onClose, timeSlot, onEdit }) => {
  if (!timeSlot) return null;

  const formatTime = (time) => {
    if (!time) return "";
    // Convert 24h time to 12h format with AM/PM
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Modal bool={isOpen} onClose={onClose} className="md">
      <div className="modal-head">
        <h2>Time Slot Details</h2>
      </div>
      <div className="modal-body">
        <div className="details-section">
          <h3>Time Information</h3>
          <div className="details-row">
            <div className="details-label">Day:</div>
            <div className="details-value">{timeSlot.day}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Start Time:</div>
            <div className="details-value">{formatTime(timeSlot.startTime)}</div>
          </div>
          <div className="details-row">
            <div className="details-label">End Time:</div>
            <div className="details-value">{formatTime(timeSlot.endTime)}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Capacity:</div>
            <div className="details-value">{timeSlot.capacity} people</div>
          </div>
          <div className="details-row">
            <div className="details-label">Status:</div>
            <div className="details-value">
              <span className={`status-badge status-${timeSlot.isActive ? "active" : "inactive"}`}>
                {timeSlot.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h3>Features</h3>
          <div className="details-row">
            <div className="details-label">Reservable:</div>
            <div className="details-value">{timeSlot.isReservable ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Peak Hour:</div>
            <div className="details-value">{timeSlot.isPeakHour ? "Yes" : "No"}</div>
          </div>
          <div className="details-row">
            <div className="details-label">Recurring:</div>
            <div className="details-value">{timeSlot.isRecurring ? "Yes" : "No"}</div>
          </div>
        </div>

        {timeSlot.notes && (
          <div className="details-section">
            <h3>Notes</h3>
            <div className="details-row">
              <div className="details-value notes">
                {timeSlot.notes}
              </div>
            </div>
          </div>
        )}

        <div className="details-section">
          <h3>Additional Information</h3>
          <div className="details-row">
            <div className="details-label">Created On:</div>
            <div className="details-value">
              {new Date(timeSlot.createdAt).toLocaleString()}
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
        .status-active {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        .status-inactive {
          background-color: #ffebee;
          color: #c62828;
        }
      `}</style>
    </Modal>
  );
};

export default TimeSlotDetailsModal; 