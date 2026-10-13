import { useState } from "react";
import { Heart, ArrowRight, ShieldCheck, LockKeyhole, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFinca, money, today, type Bird } from "@/lib/finca-store";
export function BirdCard({ bird, owned = false }: { bird: Bird; owned?: boolean }) {
  const { state, update, notify } = useFinca();
  const [amount, setAmount] = useState(30000);
  const [custom, setCustom] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [method, setMethod] = useState("Wompi");
  const [success, setSuccess] = useState(false);
  const active = state.payments.some((p) => p.birdId === bird.id);
  const full = bird.sponsors >= 10;
  const favorite = state.favorites.includes(bird.id);
  function pay() {
    if (!state.signedIn) {
      notify("Inicia tu sesión de demostración desde Mi perfil.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 1000) {
      notify("El aporte mínimo es de $1.000 COP.");
      return;
    }
    const current = state.birds.find((b) => b.id === bird.id);
    if (!current || current.sponsors >= 10 || active) {
      notify("Esta especie ya no tiene cupos disponibles o ya la apadrinas.");
      setCheckout(false);
      return;
    }
    update((s) => ({
      ...s,
      birds: s.birds.map((b) => (b.id === bird.id ? { ...b, sponsors: b.sponsors + 1 } : b)),
      payments: [
        ...s.payments,
        { id: crypto.randomUUID(), birdId: bird.id, amount, date: today(), method },
      ],
    }));
    setSuccess(true);
  }
  return (
    <article className="bird-card">
      <div className={`bird-photo ${bird.id === "silfo" ? "sylph" : ""}`}>
        <img src={bird.image} alt={bird.name} width={1024} height={768} loading="lazy" />
        <span className="photo-badge">
          {full ? <LockKeyhole size={10} /> : <LeafIcon />}
          {full ? "Cupos llenos" : "Apadrinamiento disponible"}
        </span>
        <Button
          variant="photo"
          size="icon"
          className="photo-heart"
          aria-label={`${favorite ? "Quitar de" : "Añadir a"} favoritos ${bird.name}`}
          onClick={() =>
            update((s) => ({
              ...s,
              favorites: favorite
                ? s.favorites.filter((id) => id !== bird.id)
                : [...s.favorites, bird.id],
            }))
          }
        >
          <Heart size={13} fill={favorite ? "currentColor" : "none"} />
        </Button>
      </div>
      <div className="bird-body">
        <h3>{bird.name}</h3>
        <div className="scientific">{bird.scientific}</div>
        <p className="bird-description">{bird.description}</p>
        <div className="health-row">
          <span className="health-dot" />
          {bird.health}
          <span className="text-muted-foreground"> · {bird.conservation}</span>
        </div>
        <div className="capacity-row">
          <strong>{bird.sponsors}/10 padrinos activos</strong>
          <span>{full ? "Gracias por su apoyo" : `${10 - bird.sponsors} cupos disponibles`}</span>
        </div>
        <progress max={10} value={bird.sponsors} aria-label={`Cupos de ${bird.name}`} />
        {owned || active ? (
          <>
            <p className="contribution-label">
              Tu aporte mensual:{" "}
              <strong>
                {money(state.payments.find((p) => p.birdId === bird.id)?.amount ?? amount)} COP
              </strong>
            </p>
            <Button asChild className="sponsor-button">
              <Link to="/mis-apadrinados" search={{ ave: bird.id }}>
                <Heart size={13} />
                Ir a la comunidad
                <ArrowRight size={13} />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <span className="contribution-label">Elige tu aporte mensual</span>
            <div className="amounts">
              <Button
                variant={!custom && amount === 30000 ? "secondary" : "outline"}
                onClick={() => {
                  setAmount(30000);
                  setCustom(false);
                }}
                disabled={full}
              >
                $30.000
              </Button>
              <Button
                variant={!custom && amount === 50000 ? "secondary" : "outline"}
                onClick={() => {
                  setAmount(50000);
                  setCustom(false);
                }}
                disabled={full}
              >
                $50.000
              </Button>
              <Button
                variant={custom ? "secondary" : "outline"}
                onClick={() => {
                  setCustom(true);
                  setAmount(0);
                }}
                disabled={full}
              >
                Otro valor
              </Button>
            </div>
            {custom && (
              <label className="field">
                Aporte mensual en COP
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </label>
            )}
            <Button
              className="sponsor-button"
              disabled={full}
              onClick={() => {
                setSuccess(false);
                setCheckout(true);
              }}
            >
              <Heart size={13} />
              {full ? "Cupos llenos" : "Apadrinar especie"}
              {!full && <ArrowRight className="ml-auto" size={13} />}
            </Button>
          </>
        )}
      </div>
      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="dialog-body">
          {success ? (
            <>
              <CheckCircle2 className="mx-auto text-primary" size={48} />
              <DialogTitle className="text-center">¡Ya eres parte de su historia!</DialogTitle>
              <DialogDescription className="text-center">
                Tu apadrinamiento de {bird.name} está activo en esta demostración.
              </DialogDescription>
              <Button asChild onClick={() => setCheckout(false)}>
                <Link to="/mis-apadrinados" search={{ ave: bird.id }}>
                  Ver mi apadrinado
                  <ArrowRight />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <DialogTitle>Apadrina una vida</DialogTitle>
              <DialogDescription>Un aporte mensual para cuidar a {bird.name}.</DialogDescription>
              <div className="checkout-bird">
                <img src={bird.image} alt={bird.name} />
                <div>
                  <strong>{bird.name}</strong>
                  <p>{money(amount)} COP / mes</p>
                </div>
              </div>
              <label className="field">
                Medio de pago
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>Wompi</option>
                  <option>PSE</option>
                  <option>Tarjeta</option>
                </select>
              </label>
              <p className="notice">
                Pago de demostración. No se solicitarán datos bancarios ni se hará ningún cobro real
                o recurrente.
              </p>
              <Button onClick={pay}>
                <LockKeyhole size={15} />
                Confirmar pago simulado
              </Button>
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
                <ShieldCheck size={13} />
                Tu aporte se destina al cuidado del bosque
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
}
function LeafIcon() {
  return <span className="health-dot" />;
}
