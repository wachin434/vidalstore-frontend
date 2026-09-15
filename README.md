# VidalStore · Frontend (Angular + Amplify, look de Steam)

Tienda de videojuegos con identidad real: registro/login con AWS Cognito
(Authorization Code + PKCE vía Amplify), guard de ruta, interceptor HTTP con
lista blanca, y vistas que se muestran u ocultan según el grupo del usuario.

## Cómo montarlo

Este repo trae solo el `src/` y la configuración raíz. Si prefieres partir con
el andamiaje que genera el propio Angular CLI (recomendado si nunca lo has
hecho), créalo y pisa los archivos:

```bash
npm install -g @angular/cli@19
ng new vidalstore-frontend --standalone --routing --style=css --skip-git
# reemplaza el src/ generado por el de este repo, y copia angular.json,
# package.json, tsconfig*.json si prefieres los de acá
cd vidalstore-frontend
npm install aws-amplify
```

O, más directo, usa tal cual los `package.json` / `angular.json` / `tsconfig*.json`
de este repo:

```bash
npm install
```

## Configurar Amplify

Abre `src/main.ts` y reemplaza los 4 valores de `Amplify.configure` por los que
te imprimió `backend/scripts/crear-user-pool.sh` (o los que sacaste a mano de
la consola de Cognito): `userPoolId`, `userPoolClientId`, `domain`.

Ninguno es secreto: un app client de tipo SPA no tiene client secret.

## Levantarlo

```bash
npm start
```

Abre `http://localhost:4200`. Necesitas el gateway (`:8080`) y el microservicio
(`:3001`) del backend corriendo primero.

## Qué hace cada pieza (mapeado a los indicadores de la pauta)

| Archivo | Qué resuelve | Indicador |
|---|---|---|
| `src/main.ts` | `Amplify.configure` + `enable-oauth-listener` | IE1, IE8 |
| `src/app/auth/sesion.guard.ts` | Protege `/catalogo`, `/biblioteca`, `/publicar`, `/admin` | IE1 |
| `src/app/auth/token.interceptor.ts` | Lista blanca explícita de destinos con el token | IE1 |
| `src/app/auth/sesion.ts` | Lee `cognito:groups` para mostrar/ocultar vistas | IE1 |
| `src/app/callback/` | Recibe la vuelta de Cognito y navega al catálogo | IE8 |
| `src/app/catalogo/`, `biblioteca/`, `publicar/`, `admin/` | Las pantallas de negocio | IE1, IE10 |

## Registro de cuenta nueva (IE7)

No hay un formulario de registro propio: el login usa
`signInWithRedirect()`, que lleva al **managed login** de Cognito, y ese
dominio ya trae el link "Sign up" si el user pool tiene el auto-registro
habilitado (que es el comportamiento por defecto al crear el user pool con
`Options for sign-in identifiers: Email`). Un jugador nuevo se crea la cuenta
ahí mismo, sin que nadie lo dé de alta a mano. Esto es intencional: usar
`signIn()` con un formulario propio rompería los scopes personalizados (ver
la nota de `signInWithRedirect vs signIn` en la guía del laboratorio L3,
tramo 8.5) y el encargo exige Authorization Code con PKCE de todas formas.

## Dónde queda el token, y por qué (para la defensa)

Por defecto, Amplify guarda los tokens en `localStorage`. Es el mismo punto
débil que hundió a VidalCasino si además hay un XSS, pero acá el interceptor
tiene lista blanca (una sola entrada: el gateway) y el `token_use` se revisa
en el backend, así que un `id_token` filtrado no sirve contra la API. Para la
defensa: sé capaz de explicar por qué esto no es "gratis" — la alternativa de
verdad (que el navegador nunca toque el token) es un BFF en el servidor, que
está fuera del alcance de este curso.

## El botón COMPRAR

Arturo pidió que el botón diga "COMPRAR" en grande, y así está. Para la
pregunta 4 de la defensa ("¿le implementarían el botón así?"): el sistema
permite venderlo como compra; lo que corresponde —dado el contexto normativo
del punto 1 del enunciado (revocación de licencias, ley de California sobre
la palabra "comprar")— es distinguir compra de licencia con una letra chica
visible, no solo en los términos y condiciones. Fundamenta tu propia postura
en la defensa; esto es solo el punto de partida.
