<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Left sidebar with navigation -->

    <CustomNav />
    <!-- Main content area -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="mx-auto bg-white rounded-lg shadow-md p-6">
        <RouterView />
        <!-- 404 -->
        <div v-if="$route.matched.length === 0">
          <h1 class="text-2xl font-bold text-gray-800">404 Not Found</h1>
          <p class="text-gray-600">
            The page you are looking for does not exist.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import CustomNav from "@/components/CustomNav.vue";
</script>
