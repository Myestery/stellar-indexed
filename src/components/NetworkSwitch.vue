<template>
  <label for="toggleFour" class="flex cursor-pointer select-none items-center">
    <div class="relative">
      <input
        type="checkbox"
        id="toggleFour"
        class="sr-only"
        :checked="isMainnet"
        ref="input"
      />
      <div
        @click="toggleNetwork"
        :class="{
          'box block h-8 w-14 rounded-full': true,
          'bg-[#14B8A6]': isMainnet,
          'bg-[#E5E7EB]': !isMainnet,
          'border border-[#E5E7EB]': !isMainnet,
        }"
      ></div>
      <div
        @click="toggleNetwork"
        :class="{
          'dot absolute top-1 flex h-6 w-6 items-center justify-center rounded-full transition': true,
          'left-1': !isMainnet,
          'right-1': isMainnet,
          'bg-white': isMainnet,
          'bg-gray-500': !isMainnet,
        }"
      ></div>
    </div>
    <span class="ml-2"> {{ network }}</span>
  </label>
</template>

<script setup>
import { useNetworkSwitch } from "@/composables/useNetworkSwitch";
const { isMainnet, toggleNetwork, network } = useNetworkSwitch();
</script>
