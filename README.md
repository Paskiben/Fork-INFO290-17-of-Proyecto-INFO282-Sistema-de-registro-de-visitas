# Proyecto INFO282 - Aplicacion de creación y manejo de formularios.

Este proyecto es una **aplicación móvil** diseñada para gestionar y registrar las visitas a un lugar o instalación. El sistema permite a los usuarios registrar su entrada y salida, y facilita a los administradores gestionar las visitas en tiempo real.

A continuación, se proporcionará la información necesaria para ejecutar el proyecto tanto como **usuario final** como **desarrollador**.

---

## 🚀 Ejecutar como Usuario

### Android

1. **Descargar la Aplicación:**
   - Descarga la ultima version del archivo `.apk` desde [releases](https://github.com/Paskiben/Fork-INFO290-17-of-Proyecto-INFO282-Sistema-de-registro-de-visitas/releases).
   
2. **Instalar y Usar:**
   - Una vez descargado el archivo `.apk`, instala la aplicación en tu dispositivo Android.
   - Después de la instalación, abre la aplicación y comienza a registrar tus visitas.

### iOS

1. **Descargar la Aplicación:**
   - Descarga la ultima version del archivo `.tar.gz` desde [releases](https://github.com/Paskiben/Fork-INFO290-17-of-Proyecto-INFO282-Sistema-de-registro-de-visitas/releases).

2. **Instalar y Usar:**
   - Extrae e instala el archivo en tu dispositivo iOS. 
   - Ten en cuenta que en dispositivos iOS, la instalación desde fuentes externas requiere ciertos permisos, lo que puede dificultar el proceso para usuarios sin experiencia técnica.

> [!IMPORTANT] 
> Actualmente, iOS no admite directamente la instalación de aplicaciones por descarga de fuentes externas sin autorizar. Esto hace que sea imposible realizar la instalación en dispositivos base y sin conocimientos técnicos.

---

## 👨‍💻 Ejecutar como Desarrollador

### Requisitos Previos

1. **Clonar el Repositorio**  
   Primero, clona el repositorio en tu máquina local utilizando el siguiente comando (se debe instalar un cliente de git):
   ```bash
   git clone https://github.com/Paskiben/Fork-INFO290-17-of-Proyecto-INFO282-Sistema-de-registro-de-visitas.git
   ```
2. Instalar node.js para la ejecucion del proyecto: https://nodejs.org/en/.
3. Instalar Bun para la gestion de paquetes: https://bun.sh/docs/installation#installing.
4. Descargar expoGo en un dispositivo movil IOS o Android desde la correspondiente tienda de aplicaciones.

Para ejecutar, solo hay que moverse al directorio src y ejecutar lo siguiente:
```bash
bun install
bun start
```
De esa manera, el terminal ejecutará expo start y mostrará un codigo QR el cual al escanearlo desde un dispositivo movil,
abrirá expo go y ejecutara el proyecto en modo desarrollador. Mas de un dispositivo puede abrir el proyecto simultaneamente.

---

## Requerimientos
-- REVISAR
1. Al abrir la aplicacion, primero se necesit seleccionar un formulario con el que interactiar, para esto se debe pulsar el boton de "Formularios".
2. En la pantalla de "Formularios" vera listados las distintas platillas de formularios a seleccionar, se debe pulsar el nombre para seleccionarlo, o pulsar el boton "+" para crear uno nuevo.
3. Una vez seleccionada la plantilla de formulario sera llevado de vuelta al menu de inico. A continuacion debe darle al boton "Rellenar" para rellenar el formulario seleccionado.
4. Sera llevado a la pantalla de rellenar formularios, debera completar con los datos pedidos y darle al boton de "Guardar".


## Requisitos

### Funcionales
1. La app debe ser capaz de seleccionar un formulario guardado.
2. La app debe ser capaz de rellenar el formulario seleccionado y guardarlo en local.

### No funcionales
1. La app debe demorar menos de 2 segundos en cambiar de pantalla.
2. El sistema debe ser capaz de correr de manera offline.


## Especificaciones
1. La apliacion debera ser capaz de guardar plantillas de formularios en una base de datos local, luego mostrarlos en la pantalla de "Formularios".
2. La app debe ser capaz de recibir un formularios rellenado y guardarlo en una base de datos local, luego mostrarse en la pantalla de "Formularios Guardados".
3. La app debe tener demorarse menos de un segundo al momento de guardar y cargar archivos, por lo que se usara una base de datos local como SQLite.
4. El sistema es capaz de trabajar offline, por lo que las tecnologias seleccionadas no deben necesitar acceso a la nube.

---

## 📜 Licencia
Este proyecto está bajo la licencia Apache License 2.0. Puedes ver más detalles sobre la licencia en el archivo LICENSE.

Jest to expoGo testing automatization
