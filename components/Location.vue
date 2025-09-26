<script setup lang="ts">
import { ref, nextTick } from "vue";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();

const props = defineProps<{
  modelValue: {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;
}>();

const emit = defineEmits<{
  (
    e: "update:modelValue",
    value: { latitude: number; longitude: number; address: string }
  ): void;
}>();

const showSearch = ref(false);
const search = ref("");
const suggestions = ref<
  Array<{ display_name: string; lat: string; lon: string }>
>([]);

// Show search input
function openSearch() {
  showSearch.value = true;
}

// Fetch autocomplete suggestions from Nominatim
async function fetchSuggestions() {
  if (!search.value) {
    suggestions.value = [];
    return;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search.value
      )}&limit=5`
    );
    const data = await res.json();
    suggestions.value = data;
  } catch (err) {
    console.error("Failed to fetch suggestions", err);
  }
}

// User selects a suggestion
function selectSuggestion(s: {
  display_name: string;
  lat: string;
  lon: string;
}) {
  const latitude = Number(s.lat);
  const longitude = Number(s.lon);

  emit("update:modelValue", { latitude, longitude, address: s.display_name });
  search.value = s.display_name;
  suggestions.value = [];
}
</script>

<template>
  <div class="space-y-2 relative">
    <!-- Add Location button -->
    <button
      v-if="!showSearch"
      @click="openSearch"
      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add Location
    </button>

    <div v-if="showSearch" class="space-y-2">
      <!-- Search input -->
      <div class="relative">
        <input
          v-model="search"
          @input="fetchSuggestions"
          placeholder="Search location"
          class="border px-2 py-1 rounded w-full"
        />

        <!-- Autocomplete suggestions -->
        <ul
          v-if="suggestions.length"
          class="absolute z-10 bg-white text-black dark:bg-gray-900 dark:text-gray-200 border w-full max-h-40 overflow-y-auto rounded shadow"
        >
          <li
            v-for="s in suggestions"
            :key="s.lat + s.lon"
            @click="selectSuggestion(s)"
            class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            {{ s.display_name }}
          </li>
        </ul>
      </div>

      <!-- Map preview -->
      <div
        v-if="props.modelValue?.latitude && props.modelValue.longitude"
        class="mt-2"
      >
        <img
          class="w-full h-48 border rounded object-cover"
          :src="`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${props.modelValue.longitude},${props.modelValue.latitude})/${props.modelValue.longitude},${props.modelValue.latitude},14/400x400?access_token=${config.public.mapboxToken}`"
          alt="Selected location map"
        />
        <div class="text-sm text-gray-700 mt-1">
          📍 {{ props.modelValue.address }}
        </div>
      </div>
    </div>
  </div>
</template>
