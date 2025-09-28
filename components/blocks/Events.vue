<script setup lang="ts">
import { ref } from "vue";

const events = ref([]);

function addEvent(event) {
  events.value.push(event);
}

function removeEvent(event) {
  events.value = events.value.filter((e) => e !== event);
}
</script>
<template>
  <div class="border rounded-lg overflow-hidden shadow-sm dark:border-gray-700">
    <div class="bg-gray-100 p-2 border-b dark:bg-gray-900 dark:border-gray-700">
      <div class="text-sm font-medium">Events</div>
    </div>
    <div class="p-4">
      <div v-if="events.length === 0" class="text-sm text-gray-500">
        No events added.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="(event, index) in events"
          :key="index"
          class="flex justify-between items-center bg-white p-2 rounded shadow-sm dark:bg-gray-800"
        >
          <span>{{ event }}</span>
          <button
            @click="removeEvent(event)"
            class="text-red-500 hover:text-red-700"
            aria-label="Remove event"
          >
            &times;
          </button>
        </li>
      </ul>
      <div class="mt-4">
        <input
          v-model="newEvent"
          type="text"
          placeholder="Add new event"
          class="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
          @keyup.enter="
            addEvent(newEvent);
            newEvent = '';
          "
        />
      </div>
    </div>
  </div>
</template>
