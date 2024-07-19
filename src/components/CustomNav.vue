<template>
  <nav class="w-64 bg-white shadow-md">
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800">Useful Stellar Tools</h1>
    </div>
    <ul class="mt-6">
      <li v-for="(item, index) in navItems" :key="index" class="mb-2">
        <router-link
          :to="item.path"
          active-class="bg-indigo-100"
          class="block px-6 py-2 text-gray-600 hover:bg-indigo-500 hover:text-white transition-colors duration-200"
        >
          {{ item.name }}
        </router-link>
      </li>

      <div class="block px-6 py-2 text-gray-600">
        <small>Network</small>
        <NetworkSwitch />
      </div>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from "vue";
import { useNetworkSwitch } from "@/composables/useNetworkSwitch";
import NetworkSwitch from "@/components/NetworkSwitch.vue";
const { network } = useNetworkSwitch();
const navItems = ref([
  { name: "Indexed Contract", path: "/" },
  { name: "Fee estimation", path: "/fee-estimation" },
  { name: "Fee simulation", path: "/fee-simulation" },
  { name: "Fee history", path: "/fee-history" },
]);
// props to show network
</script>
