import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Plus, Pencil, Save, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFinca, readPhoto, today, sylph, money, type Bird } from "@/lib/finca-store";
import { Metrics } from "./transparencia";
export const Route = createFileRoute("/administracion")({
  head: () => ({
    meta: [
      { title: "Administración | Finca Alejandría" },
      {
        name: "description",
        content:
          "Portal de demostración para administrar especies, aportes y gastos de Finca Alejandría.",
      },
      { property: "og:title", content: "Administración · Finca Alejandría" },
      {
        property: "og:description",
        content: "Gestión local de especies y balances de conservación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Administration,
});
function Administration() {
  const { state, update, admin, setAdmin, notify } = useFinca();
  const [edit, setEdit] = useState<Bird | null>(null);
  const [expense, setExpense] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Néctar e higiene");
  const [amount, setAmount] = useState("");
  async function photo(file?: File) {
    if (!file) return;
    try {
      const image = await readPhoto(file);
      setEdit((b) => (b ? { ...b, image } : b));
    } catch (e) {
      notify(e instanceof Error ? e.message : "No se pudo leer la foto.");
    }
  }
  if (!admin)
    return (
      <main className="content">
        <div className="empty">
          <ShieldCheck />
          <h2>Portal del administrador</h2>
          <p>Acceso de demostración para gestionar el cuidado de la finca.</p>
          <Button onClick={() => setAdmin(true)}>Entrar en modo administrador</Button>
        </div>
      </main>
    );
  return (
    <main className="content">
      <div className="page-header">
        <div className="eyebrow">
          <ShieldCheck size={13} />
          Modo administrador · Demostración
        </div>
        <h1 className="page-title">Cuidamos cada detalle</h1>
        <p className="subtitle">Especies, comunidad y recursos del bosque.</p>
      </div>
      <Metrics />
      <div className="admin-toolbar">
        <Button
          onClick={() =>
            setEdit({
              id: crypto.randomUUID(),
              name: "",
              scientific: "",
              image: sylph,
              sponsors: 0,
              description: "",
              health: "Saludable",
              conservation: "Preocupación menor",
            })
          }
        >
          <Plus />
          Nueva especie
        </Button>
        <Button variant="outline" onClick={() => setExpense(true)}>
          <Receipt />
          Registrar gasto
        </Button>
      </div>
      <div className="admin-table">
        {state.birds.map((b) => (
          <div className="data-row" key={b.id}>
            <div className="admin-species">
              <img src={b.image} alt={b.name} />
              <div>
                <strong>{b.name}</strong>
                <small>
                  {b.scientific} · {b.health}
                </small>
              </div>
            </div>
            <span>{b.sponsors}/10</span>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Editar ${b.name}`}
              onClick={() => setEdit({ ...b })}
            >
              <Pencil size={15} />
            </Button>
          </div>
        ))}
      </div>
      <section className="mt-9">
        <h2 className="text-xl font-bold">Padrinos inscritos</h2>
        <p className="subtitle mt-2">24 apadrinamientos iniciales agregados · Datos de ejemplo</p>
        {state.payments.map((p) => (
          <div className="data-row" key={p.id}>
            <div>
              <strong>{state.profile.name}</strong>
              <small>
                {state.birds.find((b) => b.id === p.birdId)?.name} · {p.date}
              </small>
            </div>
            <span>{money(p.amount)} COP / mes</span>
          </div>
        ))}
        {!state.payments.length && (
          <p className="subtitle mt-4">Las nuevas inscripciones de la demo aparecerán aquí.</p>
        )}
      </section>
      <Dialog
        open={!!edit}
        onOpenChange={(v) => {
          if (!v) setEdit(null);
        }}
      >
        <DialogContent className="dialog-body">
          <DialogTitle>
            {state.birds.some((b) => b.id === edit?.id) ? "Editar especie" : "Nueva especie"}
          </DialogTitle>
          <DialogDescription>
            Los cambios se reflejarán en el catálogo y la comunidad.
          </DialogDescription>
          {edit && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!edit.name.trim() || !edit.scientific.trim()) return;
                update((s) => ({
                  ...s,
                  birds: s.birds.some((b) => b.id === edit.id)
                    ? s.birds.map((b) => (b.id === edit.id ? edit : b))
                    : [...s.birds, edit],
                }));
                setEdit(null);
                notify("Especie guardada.");
              }}
            >
              <label className="field">
                Nombre común
                <input
                  required
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </label>
              <label className="field">
                Nombre científico
                <input
                  required
                  value={edit.scientific}
                  onChange={(e) => setEdit({ ...edit, scientific: e.target.value })}
                />
              </label>
              <label className="field">
                Descripción / novedades
                <textarea
                  required
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                />
              </label>
              <label className="field">
                Padrinos activos (máximo 10)
                <input
                  type="number"
                  min={state.payments.filter((p) => p.birdId === edit.id).length}
                  max={10}
                  required
                  value={edit.sponsors}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      sponsors: Math.min(10, Math.max(0, Number(e.target.value))),
                    })
                  }
                />
              </label>
              <label className="field">
                Estado de salud
                <select
                  value={edit.health}
                  onChange={(e) => setEdit({ ...edit, health: e.target.value })}
                >
                  <option>Saludable</option>
                  <option>En monitoreo</option>
                  <option>En recuperación</option>
                </select>
              </label>
              <label className="field">
                Estado de conservación
                <input
                  required
                  value={edit.conservation}
                  onChange={(e) => setEdit({ ...edit, conservation: e.target.value })}
                />
              </label>
              <label className="field">
                Fotografía
                <input type="file" accept="image/*" onChange={(e) => photo(e.target.files?.[0])} />
              </label>
              <img className="upload-preview" src={edit.image} alt="Foto de la especie" />
              <Button type="submit">
                <Save />
                Guardar especie
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={expense} onOpenChange={setExpense}>
        <DialogContent className="dialog-body">
          <DialogTitle>Registrar una inversión</DialogTitle>
          <DialogDescription>Actualiza el balance de transparencia de la demo.</DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (Number(amount) <= 0) return;
              update((s) => ({
                ...s,
                expenses: [
                  {
                    id: crypto.randomUUID(),
                    name,
                    category,
                    amount: Number(amount),
                    date: today(),
                  },
                  ...s.expenses,
                ],
              }));
              setExpense(false);
              setName("");
              setAmount("");
              notify("Gasto registrado en transparencia.");
            }}
          >
            <label className="field">
              Concepto
              <input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              Categoría
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>Néctar e higiene</option>
                <option>Bosque y senderos</option>
                <option>Atención y monitoreo</option>
              </select>
            </label>
            <label className="field">
              Valor en COP
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <Button type="submit">
              <Save />
              Guardar gasto
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
