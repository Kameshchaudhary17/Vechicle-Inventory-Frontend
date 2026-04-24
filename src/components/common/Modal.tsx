import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export default function Modal({
  open, onClose, title, children, size = "md"
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative card w-full ${widths[size]} p-6 max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
