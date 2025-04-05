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
1. La app debe ser capaz de seleccionar un formulario guardado.
2. La app debe ser capaz de rellenar el formulario seleccionado y guardarlo en local.
3. La app debe guardar las plantillas de formulario y sus respuestas correspondientes en una base de datos local.
4. La app debe avisar al usuario cuando cometa errores al momento de rellenar un formulario.


## Requisitos

### Funcionales
1. La app debe ser capaz de seleccionar una plantilla de formulario almacenada en una base de datos local al momento de ser seleccionada desde la pantalla de "Formularios".
2. La aplicacion debe ser capaz de interpretar las propiedades de una platilla guardada y presentarla de forma visual para que el usuario la rellene posteriormente.
3. La aplicacion debe revisar que la data ingresada por el usuario cumpla con las restricciones correspondientes a la casilla antes de guardarla.

### No funcionales
1. La app debe demorar menos de 1 segundo al cambiar de pantalla para dar una experiencia fluida al usuario.
2. El sistema debe ser capaz de correr de manera offline para habilitar el uso de la aplicacion en zonas remotas o de baja covertura.


## Especificaciones
1. La apliacion debera ser capaz de guardar plantillas de formularios en una base de datos local, enviando un pop up en caso de haber un error. Luego debe poder ser visualizada en la pantalla de "Formularios".
2. La app debe ser capaz de guardar la informacion de un formularios rellenado en los campos indicados y guardarlo en una base de datos local, luego mostrarse en la pantalla de "Formularios Guardados".
3. Al momento de pulsar botones o moverse por pantallas la aplicacion debe demorarse menos de un segundo en realizar cada accion.
4. El sistema es capaz de trabajar offline, por lo que las tecnologias seleccionadas no deben necesitar acceso a la nube.

---

## Testing

Se crearon dos test automatisados, uno para la funcion de añadir archivos a la base de datos, y otro para la eliminacion

+ Los archivos para el testing estan en la carpeta src/__tests__/

+ Para correr todos los test a la vez puede usar
`bun run jest --config=jest.config.js`

+ Para correr un test en particular usar
`bun run jest --config=jest.config.js <test_name.js>`

---

## 📜 Licencia
Este proyecto está bajo la licencia Apache License 2.0. Puedes ver más detalles sobre la licencia en el archivo LICENSE.

Jest to expoGo testing automatization
