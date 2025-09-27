<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDark } from "@vueuse/core";
import { ChevronDownIcon, MoonIcon } from "lucide-vue-next";
import UISwitch from "./ui/UISwitch.vue";

const isDark = useDark();
const userEmail = ref<string>("");

onMounted(async () => {
  try {
    const data = await $fetch("/api/auth/session");
    userEmail.value = data.email;
  } catch (err) {
    console.error("Failed to load user session:", err);
  }
});

const logout = async () => {
  await $fetch("/api/auth/signout", { method: "POST" });
  await navigateTo("/login");
};
</script>

<template>
  <div
    class="bg-gray-800 w-full h-12 flex justify-end items-center px-4 space-x-4"
  >
    <div class="text-gray-200 mr-4">{{ userEmail }}</div>
    <button
      @click="logout"
      class="text-gray-200 hover:bg-gray-700 px-3 py-1 rounded-md text-sm font-medium"
    >
      Logout
    </button>
    <div class="flex items-center text-gray-200">
      <MoonIcon :size="16" class="text-gray-200 mr-2" />
      Dark Mode
    </div>
    <UISwitch v-model="isDark" @click.stop />
  </div>
</template>
