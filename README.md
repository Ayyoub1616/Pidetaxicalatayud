# PideTaxiCalatayud

Central digital, mobile-first, para solicitar taxis en Calatayud. El cliente no crea cuenta; los taxistas utilizan una PWA y la administración controla operación, guardias y reparto. El pago se realiza directamente al taxista.

## Arquitectura

- Next.js App Router compatible con Vinext, React, TypeScript estricto y Tailwind.
- Supabase PostgreSQL/Auth/Realtime como fuente de verdad en producción.
- RPC PostgreSQL `accept_booking_offer` con bloqueo de filas para garantizar un único ganador.
- API pública mínima: el token del cliente se almacena únicamente como SHA-256; las respuestas nunca listan reservas.
- PWA con manifest, Service Worker, Web Push y deep link a ofertas.
- Jobs idempotentes protegidos por `CRON_SECRET`; `notification_logs.event_key` evita duplicados.
- Roles preparados: `SUPERADMIN`, `CITY_ADMIN`, `ADMIN`, `DRIVER`. La interfaz inicial usa ADMIN y DRIVER.

El modo demo (`NEXT_PUBLIC_DEMO_MODE=true`) permite recorrer las interfaces sin cuentas reales. Sus datos son locales y no sustituyen Supabase. En producción debe ser `false`.

## Instalación

Requisitos: Node 22+, pnpm y un proyecto Supabase.

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Comprobaciones: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`.

## Supabase y migraciones

1. Crea un proyecto en región europea y guarda URL, anon key y service-role key.
2. Con Supabase CLI enlazado, ejecuta `supabase db push`.
3. Para demo de base de datos: `supabase db reset`, que aplica `supabase/seed.sql` y crea 10 taxistas ficticios.
4. Verifica Auth por email, Site URL y redirects a `/acceso`.
5. Revisa que Realtime incluya `bookings` y `booking_offers`.
6. Nunca uses la service-role key en variables `NEXT_PUBLIC_*`.

Las migraciones crean ciudades, perfiles, taxistas, dispositivos, push, guardias, reservas, ofertas, eventos, valoraciones, incidencias, notificaciones, auditoría y configuración; además activan RLS y las RPC de aceptación, estado, cancelación/redispatch y asignación manual.

## Variables de entorno

Todas figuran en `.env.example`. Son imprescindibles para producción: Site URL, tres variables de Supabase, par VAPID, Resend, Turnstile, `CRON_SECRET` e `IP_HASH_SALT`. Mantén `PHONE_OTP_ENABLED=false` hasta contratar un proveedor SMS.

## VAPID, push y PWA

Genera un par VAPID una sola vez y almacena la privada como secreto. Cada dispositivo crea su propia fila en `driver_push_subscriptions`; elimina endpoints que respondan 404/410. El Service Worker muestra la notificación y abre el deep link.

- iPhone: abrir en Safari, Compartir → Añadir a pantalla de inicio, abrir la PWA y permitir notificaciones. Push web requiere una versión moderna de iOS y la app instalada.
- Android: abrir en Chrome, menú → Instalar aplicación, abrirla y permitir notificaciones.

La guía está disponible en `/taxista/instalar`.

## Resend y Turnstile

En Resend verifica `pidetaxicalatayud.es`, configura SPF/DKIM y usa un remitente del dominio. Turnstile debe proteger `/pedir-taxi`; añade los dominios de producción y preview. El backend valida el token antes de escribir y usa un hash salado de IP solo para antiabuso.

## Primer administrador

No existe contraseña hardcodeada. Tras migrar la base:

```bash
INITIAL_ADMIN_EMAIL=tu@email.es pnpm create-admin
```

El script usa la API administrativa de Supabase, invita por email y crea el perfil ADMIN para Calatayud.

## Primer taxista

Desde `/admin/taxistas`: alta, datos profesionales, vehículo y prioridad; envía la invitación. El taxista define contraseña, acepta condiciones, instala la PWA, permite push, recibe una prueba y elige estado. Suspender o dar de baja conserva históricos.

## Guardias y DispatchEngine

Solo administración modifica guardias. Para servicios inmediatos se filtran taxistas activos y disponibles; primero guardias vigentes, luego prioridad y finalmente el que lleva más tiempo sin asignación (round robin/fairness). Ocupados pueden recibir futuras si lo permiten. Las rondas, duración y máximos están en `app_settings`.

## Producción y Vercel

Importa el repositorio en Vercel, configura todas las variables en Production/Preview, despliega y activa el cron definido en `vercel.json`. Comprueba que `/api/cron/process` solo responde con `Authorization: Bearer $CRON_SECRET`. Configura alertas de errores y presupuesto. El proyecto también puede publicarse como preview mediante Sites.

## Dominio

Añade `pidetaxicalatayud.es` y `www.pidetaxicalatayud.es` al despliegue, aplica los DNS indicados por el proveedor, redirige `www` al dominio canónico, comprueba HTTPS y añade ambos dominios a Supabase Auth, Turnstile y Resend.

## Prueba completa

Con demo activada: abre `/pedir-taxi`, envía la solicitud y observa la aceptación simulada en su URL privada. En `/taxista`, pulsa “Simular nueva oferta”, acepta y recorre En camino → Llegada → Inicio → Final. En `/admin` revisa Control, taxistas y guardias. Para producción, repite con dos sesiones reales aceptando simultáneamente: solo una RPC debe ganar.

## Seguridad y aspectos legales

Anon no puede listar reservas ni taxistas. Driver solo ve ofertas propias y servicios adjudicados. Admin se valida en servidor. Los textos legales son placeholders: antes de publicar, aporta titular, NIF/CIF, domicilio, contacto, plazos, base jurídica, encargado DPO si aplica, condiciones del servicio, cookies y política de conservación. Encarga revisión jurídica española/RGPD.

## Operación y troubleshooting

Consulta [docs/OPERATIONS.md](docs/OPERATIONS.md). Si no llegan avisos, prueba Realtime, permiso del sistema, Service Worker, VAPID y `notification_logs`. Si no hay asignación, revisa guardia, estado, suspensión, accesibilidad y rondas. Si falla el login, revisa redirects y perfil vinculado a `auth.users`.

## Pendiente antes de lanzamiento real

Conectar UI administrativa a consultas/mutaciones reales, integrar envío Web Push/Resend en el worker de notificaciones, activar Turnstile visual en el formulario, validar textos legales, ejecutar una prueba de carga/race contra Supabase real, configurar observabilidad/backups y completar una prueba en dispositivos iPhone/Android físicos.
