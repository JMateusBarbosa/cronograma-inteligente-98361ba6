import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-[70px] bg-primary items-center justify-between shrink-0 z-20 my-0 px-[60px] py-0 mx-0 flex flex-row">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-heading font-bold text-lg">SC</span>
          </div>
        </div>
        {/* System name */}
        <h1 className="text-primary-foreground font-heading text-lg md:text-xl font-semibold tracking-tight">
          Sistema de Cronograma de Cursos
        </h1>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>);

};

export default AppLayout;