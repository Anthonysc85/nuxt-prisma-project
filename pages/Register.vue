<script setup lang="ts">
import { ref } from "vue";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = "";

  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
      },
    });

    // Registration successful, redirect to notes
    await navigateTo("/notes");
  } catch (err: any) {
    error.value = err.data?.message || "Registration failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2
          class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white"
        >
          Create an account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="submit">
        <div>
          <input
            v-model="email"
            type="email"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <input
            v-model="password"
            type="password"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>

        <div v-if="error" class="text-red-600 dark:text-red-400 text-sm">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? "Creating account..." : "Register" }}
          </button>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/login"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Already have an account? Sign in
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>
