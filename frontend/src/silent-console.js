/** Keeps the browser console quiet in production (app bundle also strips `console` via Vite). */
if (import.meta.env.PROD) {
  const noop = () => {};
  console.log = console.debug = console.info = console.warn = console.error = noop;
}
