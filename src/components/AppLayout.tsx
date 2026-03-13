import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-[70px] bg-primary shrink-0 z-30 px-4 md:px-[60px] flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden h-10 w-10 rounded flex items-center justify-center text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <div className="h-10 w-10 rounded bg-accent flex items-center justify-center shrink-0">
          <span className="text-accent-foreground font-heading font-bold text-lg">SC</span>
        </div>

        {/* System name */}
        <h1 className="text-primary-foreground font-heading text-sm md:text-xl font-semibold tracking-tight leading-tight truncate">
          Sistema de Cronograma de Cursos
        </h1>
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