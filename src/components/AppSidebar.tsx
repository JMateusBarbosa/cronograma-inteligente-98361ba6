import { NavLink } from "react-router-dom";
import { Home, Calculator, BookOpen, Layers, CalendarOff } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/consulta-avulsa", label: "Consulta Avulsa", icon: Calculator },
  { to: "/cursos", label: "Cursos", icon: BookOpen },
  { to: "/modulos", label: "Módulos", icon: Layers },
  { to: "/feriados", label: "Feriados", icon: CalendarOff },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const AppSidebar = ({ mobileOpen, onMobileClose }: AppSidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-[70px] bg-foreground/40 z-20"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-[220px] bg-primary shrink-0 flex flex-col z-20 transition-transform duration-200",
          "fixed md:relative inset-y-0 left-0 top-[70px] md:top-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <nav className="flex-1 flex flex-col gap-1 py-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-5 py-3 text-sm font-heading font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
