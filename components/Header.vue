<script setup lang="ts">
import { useDark } from "@vueuse/core";
import { ChevronDownIcon, MoonIcon } from "lucide-vue-next";
import UISwitch from "./ui/UISwitch.vue";
const isDark = useDark();
</script>
<template>
  <div
    class="bg-gray-800 w-full h-12 flex justify-end items-center px-4 space-x-4"
  >
    <div class="flex items-center text-gray-200">
      <MoonIcon :size="16" class="text-gray-200 mr-2" />
      Dark Mode
    </div>
    <UISwitch v-model="isDark" @click.stop />
  </div>
</template>
