import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bird,
  Heart,
  ChartNoAxesCombined,
  UserRound,
  Download,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFinca } from "@/lib/finca-store";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const links = [
  { to: "/" as const, label: "Explorar", icon: Bird },
  { to: "/mis-apadrinados" as const, label: "Mis apadrinados", icon: Heart },
  { to: "/transparencia" as const, label: "Transparencia", icon: ChartNoAxesCombined },
  { to: "/perfil" as const, label: "Mi perfil", icon: UserRound },
];
export function FincaShell({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { state, admin, setAdmin } = useFinca();
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [instructions, setInstructions] = useState(false);
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  async function installApp() {
    if (install) {
      await install.prompt();
      await install.userChoice;
      setInstall(null);
    } else setInstructions(true);
  }
  const nav = links.map(({ to, label, icon: Icon }) => (
    <Link key={to} to={to} className={`nav-link ${path === to ? "active" : ""}`}>
      <Icon />
      <span>{label}</span>
    </Link>
  ));
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">
              <Bird size={25} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <div className="brand-name">Finca Alejandría</div>
              <div className="brand-sub">El paraíso de los colibríes</div>
            </div>
          </Link>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {nav}
          </nav>
          <div className="header-actions">
            <Button variant="outline" size="sm" onClick={installApp} aria-label="Instalar App">
              <Download size={14} />
              <span className="install-text">Instalar App</span>
            </Button>
            <Button
              asChild
              variant={admin ? "secondary" : "ghost"}
              size="icon"
              title={admin ? "Modo Administrador" : "Modo Padrino · cambiar a administrador"}
            >
              <Link
                to={admin ? "/" : "/administracion"}
                onClick={() => setAdmin(!admin)}
                aria-label="Cambiar modo administrador"
              >
                <ShieldCheck size={17} />
              </Link>
            </Button>
            <Link to="/perfil" className="avatar" title="Mi perfil">
              {state.profile.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        <span>© 2026 Finca Alejandría · Km 18, Cali</span>
        <span className="flex items-center gap-2">
          <Leaf size={12} /> Un pequeño aporte. Un bosque lleno de vida.
        </span>
      </footer>
      <nav className="bottom-nav" aria-label="Navegación móvil">
        {nav}
      </nav>
      <Dialog open={instructions} onOpenChange={setInstructions}>
        <DialogContent className="dialog-body">
          <DialogTitle>Lleva el paraíso contigo</DialogTitle>
          <DialogDescription>Instala Finca Alejandría en tu teléfono.</DialogDescription>
          <p className="text-sm leading-7">
            En iPhone: abre la página en Safari, pulsa Compartir y elige «Añadir a pantalla de
            inicio». En Android: abre el menú de Chrome y selecciona «Instalar aplicación» o «Añadir
            a pantalla de inicio».
          </p>
          <p className="notice">
            La instalación y el acceso sin conexión estarán disponibles en la app publicada. Abre
            cada sección con internet antes de consultarla sin conexión.
          </p>
          <Button onClick={() => setInstructions(false)}>Entendido</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
