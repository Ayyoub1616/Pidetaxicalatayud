# Operación diaria

## Copias de seguridad y restauración

Activa Point-in-Time Recovery en Supabase para producción. Además, programa un `pg_dump` cifrado diario y comprueba trimestralmente una restauración en un proyecto de ensayo. Para restaurar, congela nuevas solicitudes, crea un proyecto limpio, aplica las migraciones y restaura el volcado antes de cambiar las variables del despliegue.

## Taxistas

Desde **Admin → Taxistas**, crea el registro, envía la invitación y comprueba el checklist de cuenta, instalación PWA y push. Suspender conserva todo el histórico y excluye al taxista del reparto. No elimines un taxista con servicios: usa baja lógica (`inactive`).

## Guardias y prioridad

Desde **Admin → Guardias**, crea el intervalo en horario Europe/Madrid. Los solapamientos deben revisarse, aunque son válidos para guardias compartidas. El orden de Taxistas solo se usa después de la prioridad de guardia; el desempate utiliza el último servicio asignado.

## Push y logs

Comprueba HTTPS, permiso del navegador, VAPID y una suscripción activa en `driver_push_subscriptions`. Envía una prueba y revisa `notification_logs`. Una respuesta 404/410 del proveedor invalida la suscripción. La PWA abierta recibe además actualizaciones por Realtime.

## Reserva bloqueada

Consulta la timeline, ofertas pendientes y `dispatch_attempt`. Expira ofertas vencidas, comprueba estado/guardia de los conductores y redistribuye. Antes del inicio, el administrador puede retirar o asignar manualmente. Toda intervención debe crear `booking_event` y `audit_log`.
