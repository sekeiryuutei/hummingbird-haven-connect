import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  MapPin,
  Heart,
  ArrowRight,
  Leaf,
  Bird,
  Users,
  ShieldCheck,
  Trees,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BirdCard } from "@/components/bird-card";
import { useFinca, sylph, readPhoto } from "@/lib/finca-store";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explorar colibríes | Finca Alejandría" },
      {
        name: "description",
        content:
          "Apadrina un colibrí y cuida el bosque de niebla de Finca Alejandría, Km 18, Cali.",
      },
      { property: "og:title", content: "El Paraíso de los Colibríes · Finca Alejandría" },
      {
        property: "og:description",
        content: "Conoce las especies y forma parte de su conservación en Cali.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});
function Index() {
  const { state, update, admin, notify } = useFinca();
  const [filter, setFilter] = useState("all");
  const section = useRef<HTMLElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const birds = state.birds.filter(
    (b) =>
      filter === "all" ||
      (filter === "available" ? b.sponsors < 10 : state.favorites.includes(b.id)),
  );
  const sponsors = state.birds.reduce((sum, b) => sum + b.sponsors, 0);
  async function changeHeroPhoto(file?: File) {
    if (!file) return;
    try {
      const heroImage = await readPhoto(file);
      update((s) => ({ ...s, heroImage }));
      notify("Foto de portada actualizada.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "No se pudo cambiar la foto de portada.");
    }
  }
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={state.heroImage || sylph}
          alt="Silfo Celeste volando entre las flores del bosque de niebla"
          width={1536}
          height={1024}
        />
        <div className="hero-content">
          <div className="eyebrow">
            <Leaf size={12} />
            Un refugio de vida en el bosque de niebla
          </div>
          <h1>
            El Paraíso de
            <br />
            los <span>Colibríes</span>
          </h1>
          <p className="hero-copy">
            Pequeñas alas, un gran propósito. Apadrina un colibrí y ayúdanos a proteger la magia del
            bosque en Finca Alejandría.
          </p>
          <div className="hero-actions">
            <Button
              variant="gold"
              size="lg"
              onClick={() =>
                section.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              <Heart size={15} />
              Quiero apadrinar
              <ArrowRight size={15} />
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <Link to="/transparencia">Conoce tu impacto</Link>
            </Button>
            {admin && (
              <>
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    changeHeroPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="heroOutline"
                  size="lg"
                  onClick={() => heroInputRef.current?.click()}
                >
                  <Camera size={15} />
                  Cambiar portada
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="hero-location">
          <MapPin size={12} />
          Km 18, Cali · Bosque de Niebla
        </div>
      </section>
      <section className="stats-strip" aria-label="Nuestro impacto">
        <div className="stats-inner">
          {[
            {
              icon: Bird,
              value: String(state.birds.length).padStart(2, "0"),
              label: "Especies protegidas",
            },
            { icon: Users, value: String(sponsors), label: "Padrinos comprometidos" },
            { icon: Trees, value: "1", label: "Bosque que cuidamos juntos" },
            { icon: Heart, value: "100%", label: "Amor por la conservación" },
          ].map(({ icon: Icon, value, label }) => (
            <div className="stat" key={label}>
              <Icon className="stat-icon" strokeWidth={1.5} />
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="content" ref={section}>
        <div className="section-top">
          <div className="min-w-0">
            <div className="eyebrow">Conoce a quienes vas a cuidar</div>
            <h2>Un vínculo que transforma vidas</h2>
            <p>Encuentra tu colibrí y sé parte de su historia. Cada aporte hace la diferencia.</p>
          </div>
          <div className="filter-controls" role="group" aria-label="Filtrar especies">
            <Button
              variant={filter === "all" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas las especies
            </Button>
            <Button
              variant={filter === "available" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilter("available")}
            >
              Con cupos
            </Button>
            <Button
              variant={filter === "favorites" ? "secondary" : "outline"}
              size="icon"
              title="Mis favoritos"
              aria-label="Ver favoritos"
              onClick={() => setFilter(filter === "favorites" ? "all" : "favorites")}
            >
              <Heart size={14} />
            </Button>
          </div>
        </div>
        <div className="birds-grid">
          {birds.map((b) => (
            <BirdCard bird={b} key={b.id} />
          ))}
        </div>
        {!birds.length && (
          <div className="empty">
            <Heart />
            <h2>Aún no hay favoritos</h2>
            <p>Tu próxima conexión con la naturaleza te está esperando.</p>
          </div>
        )}
        <p className="note">
          <ShieldCheck size={13} />
          Cada especie tiene un máximo de 10 padrinos para garantizar un cuidado cercano y
          responsable.
        </p>
      </section>
    </>
  );
}
