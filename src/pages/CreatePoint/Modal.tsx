import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import './Modal.css';

interface ModalProps {
    message: string;
    isOpen: boolean;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content">
                <FiCheckCircle size={48} color='green' />
                <p>{message}</p>
            </div>
        </div>
    );
};

export default Modal;
