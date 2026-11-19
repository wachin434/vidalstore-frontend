// Dirección del gateway: el 8080 en tu equipo y relativa ('' = mismo origen) cuando lo sirve Caddy en Azure.
export const GATEWAY =
  globalThis.location?.hostname === 'localhost' ? 'http://localhost:8080' : '';
