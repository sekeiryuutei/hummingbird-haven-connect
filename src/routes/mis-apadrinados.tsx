import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ArrowLeft, Send, Camera, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BirdCard } from "@/components/bird-card";
import { useFinca, readPhoto, today } from "@/lib/finca-store";
export const Route = createFileRoute("/mis-apadrinados")({
  validateSearch: (search: Record<string, unknown>) => ({
    ave: typeof search["ave"] === "string" ? search["ave"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mis apadrinados y comunidad | Finca Alejandría" },
      {
        name: "description",
        content: "Tus colibríes apadrinados y la comunidad de cuidadores del bosque.",
      },
      { property: "og:title", content: "Mis apadrinados · Finca Alejandría" },
      {
        property: "og:description",
        content: "Comparte encuentros y fotografías con los padrinos de tu especie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Sponsorships,
});
function Sponsorships() {
  const { state, update, notify } = useFinca();
  const { ave } = Route.useSearch();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});
  const [openComment, setOpenComment] = useState("");
  const owned = state.birds.filter((b) => state.payments.some((p) => p.birdId === b.id));
  const bird = owned.find((b) => b.id === ave);
  async function photo(file?: File) {
    if (!file) return;
    try {
      setImage(await readPhoto(file));
    } catch (e) {
      notify(e instanceof Error ? e.message : "No se pudo cargar la imagen.");
    }
  }
  function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!bird || !caption.trim() || !image) return;
    update((s) => ({
      ...s,
      posts: [
        {
          id: crypto.randomUUID(),
          birdId: bird.id,
          author: s.profile.name,
          caption: caption.trim(),
          image,
          date: today(),
          likes: 0,
          comments: [],
        },
        ...s.posts,
      ],
    }));
    setCaption("");
    setImage("");
    notify("Tu foto ya está en la comunidad.");
  }
  if (bird)
    return (
      <main className="content">
        <div className="forum-header">
          <div className="min-w-0">
            <div className="eyebrow text-primary">Comunidad de padrinos</div>
            <h1 className="page-title">{bird.name}</h1>
            <p className="subtitle">
              {bird.health} · {bird.description}
            </p>
          </div>
          <Button variant="outline" asChild size="icon">
            <Link
              to="/mis-apadrinados"
              search={{ ave: undefined }}
              aria-label="Volver a mis apadrinados"
            >
              <ArrowLeft />
            </Link>
          </Button>
        </div>
        <div className="forum-layout">
          <div>
            {state.posts
              .filter((p) => p.birdId === bird.id)
              .map((p) => (
                <article className="post" key={p.id}>
                  <div className="post-head">
                    <span className="avatar">{p.author[0]}</span>
                    <div>
                      <strong>{p.author}</strong>
                      <small>
                        {p.date} · Padrino de {bird.name}
                      </small>
                    </div>
                  </div>
                  <img className="post-image" src={p.image} alt={p.caption} loading="lazy" />
                  <p className="post-caption">{p.caption}</p>
                  <div className="post-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          posts: s.posts.map((post) =>
                            post.id === p.id
                              ? {
                                  ...post,
                                  liked: !post.liked,
                                  likes: post.likes + (post.liked ? -1 : 1),
                                }
                              : post,
                          ),
                        }))
                      }
                    >
                      <Heart size={14} fill={p.liked ? "currentColor" : "none"} />
                      {p.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenComment(openComment === p.id ? "" : p.id)}
                    >
                      <MessageCircle size={14} />
                      {p.comments.length} comentarios
                    </Button>
                  </div>
                  {p.comments.map((c, i) => (
                    <p className="comment" key={i}>
                      {c}
                    </p>
                  ))}
                  {openComment === p.id && (
                    <form
                      className="p-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!comments[p.id]?.trim()) return;
                        update((s) => ({
                          ...s,
                          posts: s.posts.map((post) =>
                            post.id === p.id
                              ? {
                                  ...post,
                                  comments: [
                                    ...post.comments,
                                    `${s.profile.name}: ${comments[p.id]?.trim()}`,
                                  ],
                                }
                              : post,
                          ),
                        }));
                        setComments((c) => ({ ...c, [p.id]: "" }));
                      }}
                    >
                      <label className="field">
                        Tu comentario
                        <input
                          required
                          value={comments[p.id] ?? ""}
                          onChange={(e) => setComments((c) => ({ ...c, [p.id]: e.target.value }))}
                        />
                      </label>
                      <Button size="sm" type="submit">
                        <Send />
                        Comentar
                      </Button>
                    </form>
                  )}
                </article>
              ))}
          </div>
          <form className="composer" onSubmit={publish}>
            <h3>Un encuentro para compartir</h3>
            <label className="field">
              Tu fotografía en la finca
              <input
                type="file"
                accept="image/*"
                onChange={(e) => photo(e.target.files?.[0])}
                required={!image}
              />
            </label>
            {image && <img className="upload-preview" src={image} alt="Fotografía seleccionada" />}
            <label className="field">
              Pie de foto
              <textarea
                required
                placeholder="¿Qué hizo especial tu visita?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
            <Button type="submit" disabled={!image || !caption.trim()}>
              <Camera size={15} />
              Publicar en el foro
            </Button>
          </form>
        </div>
      </main>
    );
  return (
    <main className="content">
      <div className="page-header">
        <div className="eyebrow">
          <Heart size={12} />
          Tu vínculo con el bosque
        </div>
        <h1 className="page-title">Mis apadrinados</h1>
        <p className="subtitle">Pequeñas vidas que crecen con tu apoyo.</p>
      </div>
      {owned.length ? (
        <div className="birds-grid">
          {owned.map((b) => (
            <BirdCard key={b.id} bird={b} owned />
          ))}
        </div>
      ) : (
        <div className="empty">
          <Heart strokeWidth={1.5} />
          <h2>Tu historia empieza con un colibrí</h2>
          <p>Conoce las especies de nuestro bosque y encuentra a quién cuidar.</p>
          <Button asChild>
            <Link to="/">Explorar colibríes</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
