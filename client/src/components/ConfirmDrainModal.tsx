import React from "react";
import PopUpModal from "./PopUpModal";

interface ConfirmDrainModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDrainModal: React.FC<ConfirmDrainModalProps> = ({ show, onClose, onConfirm }) => {
  return (
    <PopUpModal
      show={show}
      title="Vidange du réservoir"
      onClose={onClose}
      actions={
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
          onClick={onConfirm}
        >
          J'ai bien dirigé la sortie d'eau vers le drain
        </button>
      }
    >
      <p>
        Avant d'activer la pompe, veuillez vérifier que la sortie d'eau est bien dirigée vers le drain.
      </p>
    </PopUpModal>
  );
};

export default ConfirmDrainModal;
