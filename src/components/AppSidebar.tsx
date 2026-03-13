import { NavLink } from "react-router-dom";
import { Home, Calculator, BookOpen, Layers, CalendarOff, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
{ to: "/", label: "Início", icon: Home },
{ to: "/consulta-avulsa", label: "Consulta Avulsa", icon: Calculator },
{ to: "/cursos", label: "Cursos", icon: BookOpen },
{ to: "/modulos", label: "Módulos", icon: Layers },
{ to: "/feriados", label: "Feriados", icon: CalendarOff }];


const AppSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 left-4 z-30 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
        aria-label="Menu">
        
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {mobileOpen &&
      <div
        className="md:hidden fixed inset-0 bg-foreground/40 z-20"
        onClick={() => setMobileOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={cn(
          "w-[220px] bg-primary shrink-0 flex flex-col z-20 transition-transform duration-200",
          "fixed md:relative inset-y-0 left-0 top-[70px] md:top-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
        
        <nav className="flex-1 flex flex-col gap-1 py-0">
          {navItems.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-5 py-3 text-sm font-heading font-medium transition-colors",
              isActive ?
              "bg-accent text-accent-foreground" :
              "text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            )
            }>
            
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )}
        </nav>
      </aside>
    </>);

};

export default AppSidebar;