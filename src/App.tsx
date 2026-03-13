import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Inicio from "./pages/Inicio";
import ConsultaAvulsa from "./pages/ConsultaAvulsa";
import Cursos from "./pages/Cursos";
import Modulos from "./pages/Modulos";
import Feriados from "./pages/Feriados";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/consulta-avulsa" element={<ConsultaAvulsa />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/modulos" element={<Modulos />} />
            <Route path="/feriados" element={<Feriados />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
