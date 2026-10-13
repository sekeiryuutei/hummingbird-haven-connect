import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import sylph from "@/assets/cloud-forest.jpg";
import inca from "@/assets/inca.jpg";
import sword from "@/assets/picoespada.jpg";
export { sylph };
export type Bird = {
  id: string;
  name: string;
  scientific: string;
  image: string;
  sponsors: number;
  description: string;
  health: string;
  conservation: string;
};
export type Payment = { id: string; birdId: string; amount: number; date: string; method: string };
export type Post = {
  id: string;
  birdId: string;
  author: string;
  caption: string;
  image: string;
  date: string;
  likes: number;
  liked?: boolean;
  comments: string[];
};
export type Expense = { id: string; name: string; category: string; amount: number; date: string };
type State = {
  heroImage: string;
  birds: Bird[];
  payments: Payment[];
  posts: Post[];
  expenses: Expense[];
  favorites: string[];
  profile: { name: string; email: string };
  signedIn: boolean;
};
const initial: State = {
  heroImage: sylph,
  birds: [
    {
      id: "silfo",
      name: "Silfo Celeste",
      scientific: "Aglaiocercus coelestis",
      image: sylph,
      sponsors: 6,
      description: "Una joya de cola azul que llena de vida nuestro bosque de niebla.",
      health: "Saludable",
      conservation: "Preocupación menor",
    },
    {
      id: "inca",
      name: "Inca Acollarado",
      scientific: "Coeligena torquata",
      image: inca,
      sponsors: 8,
      description: "El elegante guardián del bosque, reconocido por su collar blanco.",
      health: "Saludable",
      conservation: "Preocupación menor",
    },
    {
      id: "picoespada",
      name: "Colibrí Picoespada",
      scientific: "Ensifera ensifera",
      image: sword,
      sponsors: 10,
      description: "Un polinizador extraordinario con un pico único en el mundo.",
      health: "En monitoreo",
      conservation: "Preocupación menor",
    },
  ],
  payments: [],
  favorites: [],
  signedIn: true,
  profile: { name: "María González", email: "maria@ejemplo.com" },
  posts: [
    {
      id: "post1",
      birdId: "silfo",
      author: "Laura Martínez",
      caption:
        "Hoy nos regaló este vuelo entre las flores. ¡Qué alegría ser parte de su cuidado! 🌿",
      image: sylph,
      date: "10 oct 2026",
      likes: 12,
      comments: ["Andrés: ¡Una foto preciosa!"],
    },
    {
      id: "post2",
      birdId: "inca",
      author: "Andrés López",
      caption: "Una mañana de niebla y un encuentro inolvidable con nuestro Inca.",
      image: inca,
      date: "9 oct 2026",
      likes: 8,
      comments: ["Laura: Su collar es increíble."],
    },
  ],
  expenses: [
    {
      id: "e1",
      name: "Néctar y limpieza de bebederos",
      category: "Néctar e higiene",
      amount: 540000,
      date: "10 oct 2026",
    },
    {
      id: "e2",
      name: "Cuidado del bosque y senderos",
      category: "Bosque y senderos",
      amount: 360000,
      date: "8 oct 2026",
    },
    {
      id: "e3",
      name: "Monitoreo y atención veterinaria",
      category: "Atención y monitoreo",
      amount: 300000,
      date: "5 oct 2026",
    },
  ],
};
type Store = {
  state: State;
  update: (fn: (s: State) => State) => void;
  admin: boolean;
  setAdmin: (v: boolean) => void;
  notify: (text: string) => void;
};
const StoreContext = createContext<Store | null>(null);
export const money = (amount: number) => "$" + new Intl.NumberFormat("es-CO").format(amount);
export const today = () =>
  new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
export function FincaProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("finca-alejandria-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<State>;
        setState((prev) => ({
          ...prev,
          ...parsed,
          heroImage: parsed.heroImage || prev.heroImage,
        }));
      }
    } catch {
      setMessage("No fue posible recuperar los datos locales.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("finca-alejandria-v1", JSON.stringify(state));
      } catch {
        setMessage("El almacenamiento está lleno. Prueba una foto más pequeña.");
      }
  }, [state, ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <StoreContext.Provider value={{ state, update: setState, admin, setAdmin, notify: setMessage }}>
      {children}
      {message && (
        <div
          role="status"
          className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-md bg-primary px-5 py-4 text-sm text-primary-foreground shadow-lg"
        >
          {message}
        </div>
      )}
    </StoreContext.Provider>
  );
}
export function useFinca() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("FincaProvider required");
  return store;
}
export async function readPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Selecciona una imagen.");
  if (file.size > 8 * 1024 * 1024) throw new Error("La foto debe pesar menos de 8 MB.");
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la foto."));
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = raw;
  await image.decode();
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 1000 / image.width);
  canvas.width = image.width * ratio;
  canvas.height = image.height * ratio;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo procesar la foto.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}
