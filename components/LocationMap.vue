<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig } from "#app";
import { useDebounceFn } from "@vueuse/core";

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
  Array<{ place_name: string; center: [number, number] }>
>([]);
const loading = ref(false);
const searchContainer = ref<HTMLElement | null>(null);

let abortController: AbortController | null = null;

function openSearch() {
  showSearch.value = true;
  // Add click outside handler when search opens
  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 100);
}

async function fetchSuggestions(val: string) {
  if (!val) {
    suggestions.value = [];
    return;
  }

  if (abortController) abortController.abort(); // cancel previous
  abortController = new AbortController();

  loading.value = true;

  try {
    const userLongitude = props.modelValue?.longitude ?? -101.831;
    const userLatitude = props.modelValue?.latitude ?? 35.221;

    const res = await fetch(
      `/api/places?q=${encodeURIComponent(
        val
      )}&lat=${userLatitude}&lng=${userLongitude}`,
      { signal: abortController.signal }
    );

    const data = await res.json();

    // Map Google results to your suggestion format
    suggestions.value = (data.results || []).map((place: any) => ({
      place_name:
        place.name +
        (place.formatted_address ? ", " + place.formatted_address : ""),
      center: [place.geometry.location.lng, place.geometry.location.lat],
    }));
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("Failed to fetch suggestions", err);
    }
  } finally {
    loading.value = false;
  }
}

// debounce user typing
const debouncedFetch = useDebounceFn(fetchSuggestions, 300);

watch(search, (val) => {
  debouncedFetch(val);
});

function selectSuggestion(s: { place_name: string; center: [number, number] }) {
  const [longitude, latitude] = s.center;

  emit("update:modelValue", {
    latitude,
    longitude,
    address: s.place_name,
  });

  search.value = "";
  suggestions.value = [];
  showSearch.value = false; // Close the search after selection
  // Remove click outside handler when selection is made
  document.removeEventListener("click", handleClickOutside);
}

function closeSearch() {
  showSearch.value = false;
  suggestions.value = [];
  search.value = "";
  // Remove click outside handler when search closes
  document.removeEventListener("click", handleClickOutside);
}

function handleClickOutside(event: MouseEvent) {
  if (
    searchContainer.value &&
    !searchContainer.value.contains(event.target as Node)
  ) {
    closeSearch();
  }
}

onMounted(() => {
  // Event listener will be added when search opens
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="space-y-2 relative">
    <!-- Add Location button -->
    <div v-if="!showSearch && !props.modelValue?.latitude">
      <button
        @click="openSearch"
        class="px-3 py-1 bg-gray-800 text-white rounded hover:bg-cyan-500"
      >
        Add Location
      </button>
    </div>

    <!-- Show selected location when not searching -->
    <div
      v-if="
        !showSearch && props.modelValue?.latitude && props.modelValue.longitude
      "
      class="mt-2"
    >
      <div class="w-1/2">
        <img
          class="w-full h-48 border rounded object-cover"
          :src="`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${props.modelValue.longitude},${props.modelValue.latitude})/${props.modelValue.longitude},${props.modelValue.latitude},14/400x400?access_token=${config.public.mapboxToken}`"
          alt="Selected location map"
        />
        <div class="text-sm text-gray-700 dark:text-gray-300 mt-1">
          📍 {{ props.modelValue.address }}
        </div>
        <button
          @click="openSearch"
          class="mt-2 px-2 py-1 bg-gray-800 text-white rounded hover:bg-cyan-500 text-sm"
        >
          Change Location
        </button>
      </div>
    </div>

    <div v-if="showSearch" class="space-y-2 relative" ref="searchContainer">
      <!-- Search input with close button -->
      <div class="relative flex items-center gap-2">
        <input
          v-model="search"
          placeholder="Search location"
          class="border-3 rounded-2xl border-gray-500 px-2 py-1 w-full"
        />

        <button
          @click="closeSearch"
          class="px-2 py-1 bg-red-800 text-white rounded hover:bg-red-600 text-sm"
        >
          ✕
        </button>

        <div
          v-if="loading"
          class="absolute right-12 top-2 text-xs text-gray-500"
        >
          Loading…
        </div>

        <!-- Autocomplete suggestions -->
        <ul
          v-if="suggestions.length"
          class="absolute z-10 top-10 bg-white text-black dark:bg-gray-900 dark:text-gray-200 border w-full max-h-40 overflow-y-auto rounded shadow"
        >
          <li
            v-for="s in suggestions"
            :key="s.place_name"
            @click="selectSuggestion(s)"
            class="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            {{ s.place_name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
