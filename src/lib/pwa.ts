export async function initializePwa() {
  if (!("serviceWorker" in navigator)) return;
  const disabled =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    new URLSearchParams(location.search).get("sw") === "off";

  const swUrl = `${import.meta.env.BASE_URL}sw.js`;

  if (disabled) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((r) =>
          [r.active, r.waiting, r.installing].some(
            (w) => w && new URL(w.scriptURL).pathname.endsWith("/sw.js"),
          ),
        )
        .map((r) => r.unregister()),
    );
    return;
  }

  await navigator.serviceWorker.register(swUrl);
}
