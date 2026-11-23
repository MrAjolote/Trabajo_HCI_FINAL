# Movikids · Landing Page (HCI for UX Design 2026-20)

Landing interactiva y responsive basada en los mockups Web/Desktop del Figma *Movikids – 4.6 Mockups*.
Solo HTML, CSS y JavaScript (sin dependencias; solo Google Fonts: Momo Trust Display y Oxygen Mono).

## Estructura
- `index.html` (raíz): redirige a `pages/index.html` para que GitHub Pages abra la landing.
- `pages/index.html` · `css/styles.css` · `js/main.js` · `assets/` · `docs/` · `favicon.ico` · `.gitignore`

## Despliegue en GitHub Pages
Settings → Pages → Deploy from a branch → `main` / `(root)`. La URL abre `index.html` y redirige a `pages/index.html`.

## Datos de prueba
Cuenta demo: `padre@movikids.app` / `movikids1` (o crea una cuenta nueva con el flujo HU-01 → 09 → 04/03 → 06).

## 30 HU core implementadas (Lista de HU)
| HU | Dónde probarla |
|---|---|
| 01 Registro | Inicio → Crear cuenta |
| 02 Login | Iniciar sesión (error genérico si falla) |
| 03 Código de vinculación | Perfil del niño → código de 4 dígitos, vence en 15 min, compartir / regenerar |
| 04 Perfil del niño | Apodo ≤ 20 caracteres, edad 4–9. Con «+ Añadir niño» se guardan varios niños (cada uno con su límite, tiempo, rachas y avisos) y se cambia de niño con el selector; no se repiten apodos |
| 06 Límite inicial | Paso "Elige el tiempo diario" (30 min–3 h, de 15 en 15) |
| 08 Modificar límite | Control de tiempo → aumentar / reducir |
| 09 Consentimiento | Aviso de privacidad antes del perfil; releer en Privacidad |
| 10 Informe diario | Inicio e Informes → Diario |
| 12 Aviso de 5 min | Vista del niño → "Avanzar a 5 minutos restantes" |
| 15 Pantalla de descanso | Vista del niño → "Terminar el tiempo" |
| 17 / 18 / 19 Racha, puntos, ánimo | Vista del niño e Informes → Rachas y puntos |
| 24 Invitar cuidador | Cuidadores (enlace, copiar, quitar con confirmación) |
| 25 Editar perfil | Configuración |
| 26 Pausa manual | Inicio → Pausar ahora → Reanudar |
| 27 Aviso al terminar sesión | Notificaciones (activable) |
| 28 Historial semanal | Informes → Semanal (gráfico con texto alternativo) |
| 29 «Un ratito más» | Inicio → Solicitud pendiente (el niño la crea desde su vista) |
| 31 Recuperar contraseña | Olvidé mi contraseña (misma respuesta exista o no la cuenta; enlace de un solo uso) |
| 32 Renovación diaria | Control de tiempo → Simular medianoche |
| 33 Eliminar perfil | Configuración → zona de riesgo (pide contraseña) |
| 35 Descanso nocturno | Horario de descanso |
| 38 Voz suave | Notificaciones (usa la voz del navegador si está disponible) |
| 39 Reglas del hogar | Reglas (máx. 3) |
| 40 Registrar cierre | Inicio e Informes → Cierres |
| 42 Actividades sin pantalla | Reglas (mín. 2 activas) |
| 44 Avisos por edad | Vista del niño: el texto cambia según 4–5, 6–7 y 8–9 años |
| 47 Datos guardados | Privacidad |
| 48 Cerrar sesión | Configuración / cabecera, con confirmación |

## Accesibilidad implementada
Enlace "Saltar al contenido", `lang="es"`, etiquetas `label` en todos los campos, mensajes de error con `role="alert"`
y estados con `role="status"`, foco visible, navegación completa por teclado, `<dialog>` nativo para confirmaciones,
texto alternativo en la mascota y en el gráfico semanal, contraste ≥ 4.5:1 y `prefers-reduced-motion`.

## Limitaciones
El estado vive en memoria (se reinicia al recargar). Las HU del niño se simulan en la "Vista del niño".
La mascota es un SVG de aproximación; reemplaza `assets/images/mascota.svg` por el arte exportado de Figma.
