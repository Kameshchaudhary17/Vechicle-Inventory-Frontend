import { Wrench } from "lucide-react";

export default function Logo({ variant = "light" }: { variant?: "light" | "dark" }) {
  const color = variant === "light" ? "text-white" : "text-brand-700";
  return (
    <div className={`flex items-center gap-2 font-extrabold display-font text-lg ${color}`}>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${
        variant === "light" ? "bg-white/15 backdrop-blur" : "bg-brand-100 text-brand-700"
      }`}>
        <Wrench className="w-5 h-5" />
      </span>
      VehicleHub
    </div>
  );
}
