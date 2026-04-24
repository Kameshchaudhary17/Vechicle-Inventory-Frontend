import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  error?: boolean;
};

const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { error, className = "", ...rest }, ref
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
      <input
        ref={ref}
        type={show ? "text" : "password"}
        className={`input pl-11 pr-11 ${error ? "input-error" : ""} ${className}`}
        {...rest}
      />
      <button type="button" tabIndex={-1} onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition">
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
});

export default PasswordInput;
