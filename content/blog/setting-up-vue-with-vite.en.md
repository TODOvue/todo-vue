---
title: "How to create your first project with Vue using Vite?"
description: "A step-by-step guide to setting up a modern development environment with Vue.js and Vite."
date: 2025-12-24T00:00:00-05:00
updatedAt: 2026-01-21T00:00:00-05:00
readingTime: 5
tags:
  - tag: "Vite"
    color: "#646CFF"
  - tag: "Basics"
    color: "#35495e"
  - tag: "Guides"
    color: "#42b983"
cover: https://res.cloudinary.com/denj4fg7f/image/upload/v1766607505/setting_up_vue_with_vite_crikmp.png
coverAlt: Vue.js logo with Vite logo in the background
coverCaption: "Set up your development environment with Vue and Vite in minutes"
locale: en

schemaOrg:
  - type: "BlogPosting"
    headline: "How to create your first project with Vue using Vite?"
    author:
      type: "Person"
      name: "TODOvue"
    datePublished: "2025-12-24T00:00:00-05"
---

# Guide: Creating your first project with Vue and Vite

In this guide you will learn how to set up a modern development environment. **Vite** is a tool that replaces the old Vue CLI, offering almost instant loading speed during development.

## Solution Overview

To complete this project, we will follow these steps:

1. **Preparation**: Verification of necessary tools (Node.js).
2. **Scaffolding**: Using the `npm create vite` command to generate the structure.
3. **Installation**: Setting up project dependencies.
4. **Execution**: Launching the local development server.
5. **Exploration**: Brief explanation of the generated file structure.

## Prerequisites

Before you start, make sure you have **Node.js** installed (version 18 or higher). You can verify this by opening a terminal and typing:

```bash
node -v

```

## Step 1: Initialize the project

Open your terminal in the folder where you want to save your project and run the following command:

```bash
npm create vite@latest my-first-vue-project

```

> **Note:** `my-first-vue-project` is the name of the folder that will be created. You can change it to whatever you prefer.

## Step 2: Wizard Configuration

Once you run the command, the terminal will ask you some interactive questions. Follow these options for a standard project:

1. **Select a framework:** Use the keyboard arrows to select `Vue`.
2. **Select a variant:** Select `JavaScript` (or `TypeScript` if you prefer strong typing, but for beginners we recommend JavaScript).

## Step 3: Installing dependencies

Vite creates the file structure, but doesn't install the libraries automatically to save time. You need to enter the folder and install them manually:

```bash
# Enter the project folder
cd my-first-vue-project

# Install all the necessary libraries
npm install

```

This process will create the `node_modules` folder, which contains all the code needed for Vue to work.

## Step 4: Run the development server

You're ready! Now start the server to see your application in the browser:

```bash
npm run dev

```

The terminal will show you a URL (usually `http://localhost:5173/`). Open that link in your browser and you'll see the Vue welcome page.

## Step 5: Project structure

Here's a description of the most important files you'll see in your code editor:

* **`index.html`**: The main entry point. Vite uses it to mount the application.
* **`src/main.js`**: The JavaScript file that initializes the Vue instance and connects it with the HTML.
* **`src/App.vue`**: The root component of your application. Everything you write here will be displayed on screen.
* **`src/components/`**: Folder where you'll save your own reusable components.
* **`vite.config.js`**: Vite configuration file.

## Example of a basic component

To start programming, you can open the `src/App.vue` file and replace its content with this simple code to understand how reactivity works:

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="increment">Counter: {{ counter }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define a reactive variable
const message = "Hello from my app with Vite!";
const counter = ref(0);

// Function to change the state
const increment = () => {
  counter.value++;
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

### Code explanation:

* **`<template>`**: Contains the HTML. We use `{{ }}` to display variables.
* **`<script setup>`**: This is the modern way to write logic in Vue 3. We use `ref` so that Vue knows that when the value changes, it should update the screen.
* **`<style scoped>`**: This is where the CSS goes, and the `scoped` attribute ensures that the styles only affect this component.
