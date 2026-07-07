import { X } from "@phosphor-icons/react";

export function ModalHead({ title, subtitle, onClose }) {
  return (
    <div className="modal-head">
      <div>
        <p>{subtitle}</p>
        <h2>{title}</h2>
      </div>
      <button aria-label="关闭" title="关闭" onClick={onClose}>
        <X size={20} />
      </button>
    </div>
  );
}
