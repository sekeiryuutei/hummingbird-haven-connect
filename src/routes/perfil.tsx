import { createFileRoute } from "@tanstack/react-router";
import { UserRound, Save, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useFinca, money } from "@/lib/finca-store";
export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil y aportes | Finca Alejandría" },
      {
        name: "description",
        content: "Tu perfil de padrino y el historial de aportes mensuales a los colibríes.",
      },
      { property: "og:title", content: "Mi perfil · Finca Alejandría" },
      { property: "og:description", content: "Consulta tus aportes y datos de padrino." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});
function Profile() {
  const { state, update, notify } = useFinca();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  return (
    <main className="content">
      <div className="page-header">
        <div className="eyebrow">
          <UserRound size={12} />
          Parte de nuestra comunidad
        </div>
        <h1 className="page-title">Mi perfil</h1>
        <p className="subtitle">
          {state.signedIn
            ? "Gracias por cuidar lo que nos conecta."
            : "Tu sesión de demostración está cerrada."}
        </p>
      </div>
      <div className="finance-layout">
        <section>
          <form
            className="profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              update((s) => ({
                ...s,
                profile: { name: (name ?? s.profile.name).trim(), email: email ?? s.profile.email },
              }));
              notify("Tu perfil se guardó.");
            }}
          >
            <label className="field">
              Nombre
              <input
                required
                value={name ?? state.profile.name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              Correo electrónico
              <input
                type="email"
                required
                value={email ?? state.profile.email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">
                <Save />
                Guardar cambios
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  update((s) => ({ ...s, signedIn: !s.signedIn }));
                  notify(state.signedIn ? "Sesión demo cerrada." : "Sesión demo iniciada.");
                }}
              >
                {state.signedIn ? <LogOut /> : <LogIn />}
                {state.signedIn ? "Cerrar sesión" : "Iniciar sesión demo"}
              </Button>
            </div>
          </form>
          <p className="notice mt-6">
            Perfil de demostración. Los datos se guardan solo en este dispositivo; no es una cuenta
            real.
          </p>
        </section>
        <section>
          <h3>Historial de aportes</h3>
          {state.payments.length ? (
            state.payments.map((p) => (
              <div className="data-row" key={p.id}>
                <div>
                  <strong>{state.birds.find((b) => b.id === p.birdId)?.name}</strong>
                  <small>
                    {p.date} · {p.method} · Mensual
                  </small>
                </div>
                <div className="text-right">
                  <strong>{money(p.amount)} COP</strong>
                  <div className="mt-2">
                    <span className="success-tag">Exitoso · Simulado</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="subtitle">Todavía no has realizado aportes.</p>
          )}
        </section>
      </div>
    </main>
  );
}
