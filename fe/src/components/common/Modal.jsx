import React from "react";
import "../../styles/Modal.css";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal active">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;