<script setup lang="ts">
import { useDark } from "@vueuse/core";
import Header from "../components/Header.vue";

useDark();
</script>
<template>
  <div>
    <Header />
    <slot />
  </div>
</template>
