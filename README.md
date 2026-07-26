<div align="center">

  <h1>Manual Interactivo de Ciberseguridad</h1>
  <p><em>Plataforma educativa tipo Single Page Application (SPA) para Ciberseguridad, Auditoría y Hacking Ético.</em></p>
</div>

<hr />

Entorno de aprendizaje interactivo diseñado para la enseñanza de Ciberseguridad y Auditoría de Sistemas. Desarrollado con React y Tailwind CSS, este manual digital ofrece una experiencia de usuario inmersiva (UI/UX premium) con temas que van desde la Gestión de Riesgos hasta el Hacking Ético. Incluye un sistema de progreso en tiempo real sincronizado en la nube y un panel administrativo para el docente.

## 🚀 Ficha Técnica

- 🛡️ **Enfoque:** Educación en Ciberseguridad, Auditoría y Hacking Ético.
- 💻 **Stack Tecnológico:** React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
- ☁️ **Infraestructura:** Firebase Hosting & Firebase Realtime Database.
- 🎨 **Diseño UI/UX:** Interfaz adaptativa, soporte Nativo para Modo Oscuro/Claro, animaciones fluidas y diseño Responsive (Mobile-first).
- ⚙️ **Características Principales:** 
  - Módulos interactivos divididos en "Teoría" y "Laboratorio Táctico".
  - Sincronización en tiempo real del progreso del estudiante.
  - Glosario técnico integrado con casos de uso prácticos.
  - Panel de Control (Admin) para visibilidad de clases en vivo.

## 🔐 Cuentas de Acceso (Firebase)
Aquí tienes registradas las cuentas de prueba configuradas en Firebase para desarrollo local y testing:

- **Cuenta de Profesor (Vista de Dashboard / Notas / Panel de Control):**
  - **Usuario:** `profesor@unsm.edu.pe`
  - **Contraseña:** `[Configurada en Firebase Authentication]`

- **Cuenta de Estudiante (Vista normal e individual):**
  - **Usuario:** `alumnos@unsm.edu.pe`
  - **Contraseña:** `[Configurada en Firebase Authentication]`

## ⌨️ Leyenda de Instrucciones del Prontuario

El sistema renderiza los comandos en la pestaña "Prontuario" dependiendo de prefijos específicos en el campo `description`. Aquí la leyenda de su clasificación visual:

| Prefijo en `description` | Globo / Etiqueta | Comportamiento del Bloque de Código | Uso Principal |
| :--- | :--- | :--- | :--- |
| `(NOTA)` | 🟡 `📋 Instrucción Manual` | Se **oculta** completamente la caja negra de código. | Para clics, uso de herramientas gráficas o pasos manuales. |
| `(URL)` | 🔵 `Navegador Web` | Se muestra, pero **sin el prefijo `$`**. | Para enlaces que el alumno debe pegar en el navegador. |
| `(TECLADO)` | 🟣 `Atajo de Teclado` | Se muestra, pero **sin el prefijo `$`**. | Para combinaciones de teclas (ej. `Ctrl + C`). |
| *(En el texto)* `(Post-explotación)` | ⚪ *Sin globo especial* | Cambia el prefijo `$` por **`meterpreter >`**. | Para los laboratorios de explotación y Metasploit. |
| *Ninguno (Por defecto)* | ⚪ *Sin globo especial* | Muestra el prefijo estándar **`$`**. | Para comandos normales de terminal Kali Linux. |
