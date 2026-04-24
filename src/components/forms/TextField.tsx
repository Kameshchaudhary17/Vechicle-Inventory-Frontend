import { forwardRef, type ReactNode } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
};

const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, icon, hint, error, className = "", id, ...rest }, ref
) {
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={inputId} className="label">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400">{icon}</span>}
        <input
          id={inputId}
          ref={ref}
          className={`input ${icon ? "pl-11" : ""} ${error ? "input-error" : ""} ${className}`}
          {...rest}
        />
      </div>
      {error ? <p className="text-xs text-rose-600 mt-1">{error}</p>
        : hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
});

export default TextField;
