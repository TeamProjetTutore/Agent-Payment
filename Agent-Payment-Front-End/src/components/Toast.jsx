import React from "react";
import { useUI } from "../context/UIContext";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function Toast() {
  const { toast, t } = useUI();

  if (!toast.visible) return null;

  const isError = toast.type === "error";

  return (
    <div className={`toast-container ${isError ? "toast-error" : "toast-success"}`}>
      <div className="toast-icon">
        {isError ? <FaExclamationCircle /> : <FaCheckCircle />}
      </div>
      <div className="toast-message">
        {t(toast.message)}
      </div>
    </div>
  );
}
