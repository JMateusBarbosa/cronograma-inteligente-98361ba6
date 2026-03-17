import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";
import logo from "@/assets/logo.png";

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-[90px] bg-primary shrink-0 z-30 px-4 md:px-[60px] flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden h-10 w-10 rounded flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <div className="h-14 w-14 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          <img src={logo} alt="Indústria do Saber" className="h-12 w-12 object-contain" />
        </div>

        {/* System name - centered */}
        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <h1 className="text-primary-foreground font-heading text-lg md:text-2xl font-bold tracking-tight leading-tight">
              Sistema de Cronograma de Cursos
            </h1>
            <p className="text-primary-foreground/60 text-xs md:text-sm font-heading hidden sm:block">
              Indústria do Saber — Centro de Formação Profissional
            </p>
          </div>
        </div>

        {/* Spacer to balance the logo on the left */}
        <div className="h-14 w-14 shrink-0 hidden md:block" />
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
