import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
    // Prevent scrolling on the body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Modal Container with your custom pop-out animation */}
            <div className="bg-surface-alt border border-border rounded-xl w-full max-w-sm sm:max-w-md shadow-2xl animate-pop-out flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border/50">
                    <h3 className="text-lg font-semibold text-heading">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-md text-text-muted hover:text-heading hover:bg-surface my-transition"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-0 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;