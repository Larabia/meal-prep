# Chamba App

Aplicación web/PWA simple para registrar días trabajados, kilómetros y calcular cobros quincenales.

## Régimen configurado

Tarifas vigentes desde 01/08/2026:

- 0–50 km: $131.100
- 51–100 km: $150.760
- 101–150 km: $170.430
- 151–200 km: $203.100
- 201–251 km: $222.780

Cobros:

- Trabajo del 1 al 15 de un mes → se cobra del 5 al 10 del mes siguiente.
- Trabajo del 16 al último día de un mes → se cobra del 20 al 25 del mes siguiente.

## Publicar en GitHub Pages

1. Crear un repositorio nuevo en GitHub, por ejemplo `control-repartos`.
2. Subir todos los archivos de esta carpeta a la raíz del repositorio.
3. Ir a **Settings → Pages**.
4. En **Build and deployment**, elegir **Deploy from a branch**.
5. Seleccionar la rama `main` y la carpeta `/ (root)`.
6. Guardar.
7. Esperar unos minutos y abrir la URL que informa GitHub Pages.

## Instalar en el teléfono

### Android / Chrome
Abrir la URL publicada y usar **Instalar aplicación** o **Agregar a pantalla principal**.

### iPhone / Safari
Abrir la URL → botón **Compartir** → **Agregar a pantalla de inicio**.

## Persistencia

Los datos se guardan en `localStorage` del navegador. No hay backend ni cuenta de usuario.

## Detalles divertidos

Al guardar un día, Chamba App muestra mensajes aleatorios de aliento y citas estoicas breves.
También tiene mensajes especiales para jornadas de más de 200 km, rachas de días y hitos de $500.000 / $1.000.000 por quincena.

> Nota: las citas clásicas pueden variar levemente según la traducción al español.


### Premio secreto

Existe un mensaje ultra raro con aproximadamente 1% de probabilidad al guardar un día:
“🏆 Premio desbloqueado: hoy te ganaste sexo anal, máquina.”
