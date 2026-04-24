import type { ReactNode } from "react";
import { ShieldCheck, BarChart3, Sparkles, Bell } from "lucide-react";
import Logo from "../../components/brand/Logo";

interface Bullet { icon: ReactNode; title: string; desc: string; }

const defaults: Bullet[] = [
  { icon: <BarChart3 className="w-4 h-4" />, title: "Real-time inventory & invoices", desc: "Low-stock alerts the moment a part dips below 10 units." },
  { icon: <Sparkles className="w-4 h-4" />, title: "AI failure prediction", desc: "Usage and mileage patterns predict upcoming part replacements." },
  { icon: <Bell className="w-4 h-4" />, title: "Automated reminders", desc: "Credit overdue > 30 days? We email the customer for you." },
  { icon: <ShieldCheck className="w-4 h-4" />, title: "Secure by default", desc: "OTP verification, hashed passwords, JWT-scoped access." }
];

interface Props {
  children: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
  bullets?: Bullet[];
}

export default function AuthLayout({
  children,
  heroTitle = "Run your parts business like a pro.",
  heroSubtitle = "Vehicle parts, inventory, invoices & customer service — one clean dashboard. Priced in Nepalese Rupees.",
  bullets = defaults
}: Props) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden text-white p-12 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-400/30 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl animate-blob blob-delay-2" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-fuchsia-400/20 blur-3xl animate-blob blob-delay-4" />

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 max-w-lg fade-up">
          <h1 className="display-font text-4xl xl:text-5xl font-extrabold leading-tight mb-4">{heroTitle}</h1>
          <p className="text-brand-100/90 text-lg mb-8">{heroSubtitle}</p>

          <ul className="space-y-4">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center shrink-0 text-white">
                  {b.icon}
                </span>
                <div>
                  <div className="font-semibold">{b.title}</div>
                  <div className="text-sm text-brand-100/80">{b.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-brand-200/80 text-sm">
          © {new Date().getFullYear()} VehicleHub — Parts & Service Management
        </div>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-6 flex justify-center">
            <Logo variant="dark" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
