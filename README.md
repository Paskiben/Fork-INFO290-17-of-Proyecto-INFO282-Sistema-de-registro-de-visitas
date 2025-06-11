# Proyecto INFO282 - Aplicacion de creación y manejo de formularios.

Este proyecto es una **aplicación móvil** diseñada para gestionar y registrar las visitas a un lugar o instalación. El sistema permite a los usuarios registrar su entrada y salida, y facilita a los administradores gestionar las visitas en tiempo real.

A continuación, se proporcionará la información necesaria para ejecutar el proyecto tanto como **usuario final** como **desarrollador**.

---

## 🚀 Ejecutar como Usuario

### Android

1. **Descargar la Aplicación:**
   - Descarga la ultima version del archivo `.apk` desde el [repositorio de builds](https://github.com/Kumblesoft/Proyecto-INFO282-Sistema-de-registro-de-visitas/tree/prod/builds) o desde [releases](https://github.com/Kumblesoft/Proyecto-INFO282-Sistema-de-registro-de-visitas/releases).
   
2. **Instalar y Usar:**
   - Una vez descargado el archivo `.apk`, instala la aplicación en tu dispositivo Android.
   - Después de la instalación, abre la aplicación y comienza a registrar tus visitas.

### iOS

1. **Descargar la Aplicación:**
   - Descarga la ultima version del archivo `.tar.gz` desde el [repositorio de builds](https://github.com/Kumblesoft/Proyecto-INFO282-Sistema-de-registro-de-visitas/tree/prod/builds) o desde [releases](https://github.com/Kumblesoft/Proyecto-INFO282-Sistema-de-registro-de-visitas/releases).

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
   git clone https://github.com/Kumblesoft/Proyecto-INFO282-Sistema-de-registro-de-visitas.git
   ```
4. Instalar node.js para la ejecucion del proyecto: https://nodejs.org/en/
5. Instalar Bun para la gestion de paquetes: https://bun.sh/docs/installation#installing
6. Descargar expoGo en un dispositivo movil IOS o Android desde la correspondiente tienda de aplicaciones.

Para ejecutar, solo hay que moverse al directorio src y ejecutar lo siguiente:
```bash
bun install
bun start
```
De esa manera, el terminal ejecutará expo start y mostrará un codigo QR el cual al escanearlo desde un dispositivo movil,
abrirá expo go y ejecutara el proyecto en modo desarrollador. Mas de un dispositivo puede abrir el proyecto simultaneamente.

---

## 📜 Licencia
Este proyecto está bajo la licencia Apache License 2.0. Puedes ver más detalles sobre la licencia en el archivo LICENSE.
