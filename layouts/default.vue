<script setup lang="ts">
import { useDark } from "@vueuse/core";
import Header from "~/components/Header.vue";

useDark();
</script>

<template>
  <div class="dark:bg-gray-950 dark:text-gray-200 min-h-screen">
    <Header />
    <slot />
  </div>
</template>
