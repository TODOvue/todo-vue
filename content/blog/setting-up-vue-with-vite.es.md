---
title: "¿Cómo crear tu primer proyecto con Vue usando Vite?"
description: "Una guía paso a paso para configurar un entorno de desarrollo moderno con Vue.js y Vite."
date: 2025-12-24T00:00:00-05:00
updatedAt: 2026-01-21T00:00:00-05:00
readingTime: 5
tags:
  - tag: "Vite"
    color: "#646CFF"
  - tag: "Básico"
    color: "#35495e"
  - tag: "Guías"
    color: "#42b983"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1766607505/setting_up_vue_with_vite_crikmp.png
coverAlt: Logo de Vue.js con el logo de Vite de fondo
coverCaption: "Configura tu entorno de desarrollo con Vue y Vite en minutos"
locale: es

schemaOrg:
  - type: "BlogPosting"
    headline: "¿Cómo crear tu primer proyecto con Vue usando Vite?"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2025-12-24T00:00:00-05"
---

# Guía: Creando tu primer proyecto con Vue y Vite

En esta guía aprenderás a configurar un entorno de desarrollo moderno. **Vite** es una herramienta que reemplaza al antiguo Vue CLI, ofreciendo una velocidad de carga casi instantánea durante el desarrollo.

## Resumen de la solución

Para completar este proyecto, seguiremos estos pasos:

1. **Preparación**: Verificación de herramientas necesarias (Node.js).
2. **Andamiaje**: Uso del comando `npm create vite` para generar la estructura.
3. **Instalación**: Configuración de las dependencias del proyecto.
4. **Ejecución**: Lanzamiento del servidor de desarrollo local.
5. **Exploración**: Breve explicación de la estructura de archivos generada.

## Requisitos previos

Antes de empezar, asegúrate de tener instalado **Node.js** (versión 18 o superior). Puedes verificarlo abriendo una terminal y escribiendo:

```bash [bash]
node -v
```

## Paso 1: Inicializar el proyecto

Abre tu terminal en la carpeta donde quieras guardar tu proyecto y ejecuta el siguiente comando:

```bash [npm]
npm create vite@latest mi-primer-proyecto-vue
```
```bash [pnpm]
pnpm create vite mi-primer-proyecto-vue
```
```bash [yarn]
yarn create vite mi-primer-proyecto-vue
```
```bash [bun]
bun create vite mi-primer-proyecto-vue
```

> **Nota:** `mi-primer-proyecto-vue` es el nombre de la carpeta que se creará. Puedes cambiarlo por el que prefieras.

## Paso 2: Configuración del asistente

Una vez ejecutado el comando, la terminal te hará unas preguntas interactivas. Sigue estas opciones para un proyecto estándar:

1. **Select a framework:** Usa las flechas del teclado para seleccionar `Vue`.
2. **Select a variant:** Selecciona `JavaScript` (o `TypeScript` si prefieres tipado fuerte, pero para empezar recomendamos JavaScript).

## Paso 3: Instalación de dependencias

Vite crea la estructura de archivos, pero no instala las librerías automáticamente para ahorrar tiempo. Debes entrar a la carpeta e instalarlas manualmente:

Entra a la carpeta del proyecto

```bash [bash]
cd mi-primer-proyecto-vue
```

Instala todas las librerías necesarias

```bash [npm]
npm install
```
```bash [pnpm]
pnpm install
```
```bash [yarn]
yarn install
```
```bash [bun]
bun install
```

Este proceso creará la carpeta `node_modules`, que contiene todo el código necesario para que Vue funcione.

## Paso 4: Ejecutar el servidor de desarrollo

¡Ya estás listo! Ahora inicia el servidor para ver tu aplicación en el navegador:

```bash [npm]
npm run dev
```
```bash [pnpm]
pnpm dev
```
```bash [yarn]
yarn dev
```
```bash [bun]
bun run dev
```

La terminal te mostrará una URL (normalmente `http://localhost:5173/`). Abre ese enlace en tu navegador y verás la página de bienvenida de Vue.

## Paso 5: Estructura del proyecto

Aquí tienes una descripción de los archivos más importantes que verás en tu editor de código:

* **`index.html`**: El punto de entrada principal. Vite lo usa para montar la aplicación.
* **`src/main.js`**: El archivo JavaScript que inicializa la instancia de Vue y la conecta con el HTML.
* **`src/App.vue`**: El componente raíz de tu aplicación. Todo lo que escribas aquí se verá en pantalla.
* **`src/components/`**: Carpeta donde guardarás tus propios componentes reutilizables.
* **`vite.config.js`**: Archivo de configuración de Vite.

## Ejemplo de un componente básico

Para empezar a programar, puedes abrir el archivo `src/App.vue` y reemplazar su contenido con este código sencillo para entender cómo funciona la reactividad:

```vue [Composition API]
<template>
  <div>
    <h1>{{ mensaje }}</h1>
    <button @click="incrementar">Contador: {{ contador }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Definimos una variable reactiva
const mensaje = "¡Hola desde mi app con Vite!";
const contador = ref(0);

// Función para cambiar el estado
const incrementar = () => {
  contador.value++;
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
```

```vue [Options API]
<template>
  <div>
    <h1>{{ mensaje }}</h1>
    <button @click="incrementar">Contador: {{ contador }}</button>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      mensaje: '¡Hola desde mi app con Vite!',
      contador: 0
    };
  },
  methods: {
    incrementar() {
      this.contador++;
    }
  }
};
</script>

<style scoped>
h1 {
  color: #42b983;
}
button {
  padding: 10px 20px;
  cursor: pointer;
}
</style>
```

### Explicación del código:

* **`<template>`**: Contiene el HTML. Usamos `{{ }}` para mostrar variables.
* **`<script setup>`**: Es la forma moderna de escribir lógica en Vue 3. Usamos `ref` para que Vue sepa que cuando el valor cambie, debe actualizar la pantalla.
* **`<style scoped>`**: Aquí va el CSS, y el atributo `scoped` asegura que los estilos solo afecten a este componente.
