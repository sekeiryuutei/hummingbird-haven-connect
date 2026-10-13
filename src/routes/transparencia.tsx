import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Wallet, Bird, Users } from "lucide-react";
import { useState } from "react";
import { useFinca, money } from "@/lib/finca-store";
export const Route = createFileRoute("/transparencia")({
  head: () => ({
    meta: [
      { title: "Transparencia e impacto | Finca Alejandría" },
      {
        name: "description",
        content: "Conoce cómo se invierten los aportes al cuidado de los colibríes y el bosque.",
      },
      { property: "og:title", content: "Transparencia · Finca Alejandría" },
      {
        property: "og:description",
        content: "Néctar, cuidado del bosque y atención de aves: cada aporte cuenta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Transparency,
});
export function Metrics() {
  const { state } = useFinca();
  const total = 1200000 + state.payments.reduce((sum, p) => sum + p.amount, 0);
  return (
    <div className="metric-grid">
      {[
        { icon: Wallet, label: "Total recaudado", value: money(total) + " COP" },
        { icon: Bird, label: "Colibríes activos", value: state.birds.length },
        {
          icon: Users,
          label: "Comunidad de padrinos",
          value: state.birds.reduce((sum, b) => sum + b.sponsors, 0),
        },
      ].map(({ icon: Icon, label, value }) => (
        <div className="metric" key={label}>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon size={17} />
            {label}
          </div>
          <div className="stat-value">{value}</div>
        </div>
      ))}
    </div>
  );
}
function Transparency() {
  const { state } = useFinca();
  const [category, setCategory] = useState("Todos");
  const total = 1200000 + state.payments.reduce((sum, p) => sum + p.amount, 0);
  const spent = state.expenses.reduce((s, e) => s + e.amount, 0);
  return (
    <main className="content">
      <div className="page-header">
        <div className="eyebrow">
          <ShieldCheck size={12} />
          Cuentas claras, impacto real
        </div>
        <h1 className="page-title">Cada aporte deja una huella</h1>
        <p className="subtitle">Así cuidamos juntos la vida en Finca Alejandría.</p>
      </div>
      <p className="notice">
        Balance de demostración · Los aportes y gastos aquí presentados son datos simulados.
      </p>
      <Metrics />
      <div className="finance-layout">
        <section>
          <h3>Destino de nuestros aportes</h3>
          {[
            { name: "Néctar e higiene de bebederos", value: 45 },
            { name: "Bosque de niebla y senderos", value: 30 },
            { name: "Atención médica y monitoreo", value: 25 },
          ].map((a) => (
            <div className="allocation" key={a.name}>
              <div>
                <span>{a.name}</span>
                <strong>{a.value}%</strong>
              </div>
              <progress value={a.value} max={100} aria-label={a.name} />
              <p className="mt-2 text-xs text-muted-foreground">
                {money((total * a.value) / 100)} COP asignados
              </p>
            </div>
          ))}
          <div className="data-row">
            <strong>Gastos registrados</strong>
            <span>{money(spent)} COP</span>
          </div>
          <div className="data-row">
            <strong>Saldo disponible</strong>
            <span>{money(total - spent)} COP</span>
          </div>
        </section>
        <section>
          <h3>Registro de inversión</h3>
          <label className="field">
            Categoría
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Todos</option>
              <option>Néctar e higiene</option>
              <option>Bosque y senderos</option>
              <option>Atención y monitoreo</option>
            </select>
          </label>
          {state.expenses
            .filter((e) => category === "Todos" || e.category === category)
            .map((e) => (
              <div className="data-row" key={e.id}>
                <div>
                  {e.name}
                  <small>
                    {e.date} · {e.category}
                  </small>
                </div>
                <strong>{money(e.amount)}</strong>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}
