<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">Welcome to EV Charging Station Finder</h1>
      <p class="text-lg text-gray-600 mb-6">
        Find and manage electric vehicle charging stations near you.
      </p>
      <div class="flex gap-4">
        <a
          href="/login"
          class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Get Started
        </a>
        <a
          href="https://vuejs.org/"
          target="_blank"
          rel="noopener"
          class="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          Learn More
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
