<script setup lang="ts">
import { useDark } from "@vueuse/core";
import Header from "../components/Header.vue";
const { session } = await useAuth();

if (!session.value) {
  await navigateTo("/login");
}

useDark();
</script>
<template>
  <div>
    <Header />
    <slot />
  </div>
</template>
