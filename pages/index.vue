<script setup lang="ts">
import { useAuth } from "~/composables/useAuth";

import { ref, watchEffect } from "vue";
import { useRuntimeConfig } from "#app";
import { Pencil, Plus } from "lucide-vue-next";
import Wysiwyg from "../components/Wysiwyg/Wysiwyg.vue";
import Location from "../components/blocks/LocationMap.vue";
import Calendar from "../components/blocks/Calendar.vue";
import VueDraggableNext from "vuedraggable-es";

const config = useRuntimeConfig();
const { session, loading } = useAuth();

interface LocationType {
  latitude: number;
  longitude: number;
  address: string;
}

interface NoteBlock {
  id: number;
  text: string;
}

interface NoteType {
  id: number;
  title: string;
  content: NoteBlock[];
  createdAt: string;
  location: LocationType | null;
  position: number;
}

watchEffect(() => {
  if (!loading.value && !session.value) {
    navigateTo("/login");
  }
});
const notes = ref<NoteType[]>([]);
const newNote = ref<Pick<NoteType, "title" | "content">>({
  title: "",
  content: [{ id: Date.now(), text: "" }],
});
const newNoteLocation = ref<LocationType | null>(null);
const editingId = ref<number | null>(null);

async function loadNotes() {
  try {
    const data = await $fetch("/api/notes");
    notes.value = data
      .map((note: any) => {
        let parsedContent: NoteBlock[] = [];

        try {
          parsedContent = JSON.parse(note.content);
          if (!Array.isArray(parsedContent)) {
            parsedContent = [
              {
                id: Date.now(),
                text: String(parsedContent),
              },
            ];
          }
        } catch {
          parsedContent = note.content
            ? [{ id: Date.now(), text: note.content }]
            : [];
        }

        return {
          ...note,
          content: parsedContent,
          position: note.position ?? 0,
          location:
            note.latitude != null && note.longitude != null
              ? {
                  latitude: note.latitude,
                  longitude: note.longitude,
                  address: note.address,
                }
              : null, // Set to null instead of 0,0
        };
      })
      .sort((a: NoteType, b: NoteType) => a.position - b.position); // Sort by position
  } catch (err) {
    console.error("Failed to load notes:", err);
  }
}

loadNotes();

async function addNote() {
  const token = localStorage.getItem("token");

  // Set position as the last in the list
  const maxPosition = Math.max(...notes.value.map((n) => n.position), -1);

  await $fetch("/api/notes", {
    method: "POST",
    body: {
      title: newNote.value.title,
      content: JSON.stringify(newNote.value.content),
      latitude: newNoteLocation.value?.latitude ?? null,
      longitude: newNoteLocation.value?.longitude ?? null,
      address: newNoteLocation.value?.address ?? null,
      position: maxPosition + 1,
    },
    headers: { Authorization: `Bearer ${token}` },
  });

  newNote.value = {
    title: "",
    content: [{ id: Date.now(), type: "paragraph", text: "" }],
  };
  newNoteLocation.value = null;
  await loadNotes();
}

async function updateNote(note: NoteType) {
  try {
    const token = localStorage.getItem("token");

    await $fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      body: {
        title: note.title,
        content: JSON.stringify(note.content),
        latitude: note.location?.latitude ?? null,
        longitude: note.location?.longitude ?? null,
        address: note.location?.address ?? null,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    await loadNotes();
  } catch (err) {
    console.error("Failed to update note:", err);
  }
}

async function deleteNote(note: NoteType) {
  try {
    const token = localStorage.getItem("token");
    await $fetch(`/api/notes/${note.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await loadNotes();
  } catch (err) {
    console.error("Failed to delete note:", err);
  }
}

function startEditing(noteId: number) {
  editingId.value = noteId;
}

function cancelEditing() {
  editingId.value = null;
  loadNotes();
}

async function saveNote(note: NoteType) {
  await updateNote(note);
  editingId.value = null;
}

function deleteBlock(content: NoteBlock[], blockId: number) {
  const index = content.findIndex((block) => block.id === blockId);
  if (index !== -1 && content.length > 1) {
    content.splice(index, 1);
  }
}

function addBlock(content: NoteBlock[]) {
  content.push({ id: Date.now(), text: "" });
}

// --- Reorder notes ---
async function onDragEnd() {
  // Update positions based on current order
  const updates = notes.value.map((note, index) => ({
    id: note.id,
    position: index,
  }));

  try {
    const token = localStorage.getItem("token");
    await $fetch("/api/notes/reorder", {
      method: "POST",
      body: { updates },
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Failed to update note order:", err);
    // Reload notes if reorder fails
    await loadNotes();
  }
}
</script>

<template>
  <div v-if="session" class="px-4 py-12 dark:text-gray-200">
    <Calendar />

    <h1 class="pb-4 text-4xl font-semibold">Notes</h1>
    <form @submit.prevent="addNote" class="flex flex-col gap-3 mb-6">
      <input
        v-model="newNote.title"
        placeholder="Title"
        class="border-2 border-slate-400 dark:border-gray-700 rounded-2xl h-8 px-3 w-1/2 bg-slate-200 dark:bg-gray-800"
      />

      <div
        v-for="block in newNote.content"
        :key="block.id"
        class="mb-2 relative group"
      >
        <div class="flex items-start gap-2">
          <div class="flex-1">
            <Wysiwyg v-model="block.text" />
          </div>
          <!-- Delete block button (appears on hover) -->
          <button
            v-if="newNote.content.length > 1"
            type="button"
            @click="deleteBlock(newNote.content, block.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-8 p-1 text-cinnamon-red hover:text-red-700 rounded-full"
            title="Delete block"
          >
            ✕
          </button>
        </div>
      </div>
      <div class="flex items-center w-full my-6">
        <!-- Left border -->
        <div
          class="flex-grow border-t-2 border-gray-500 dark:border-gray-700 relative overflow-hidden"
        ></div>

        <!-- Button -->
        <button
          type="button"
          @click="addBlock(newNote.content)"
          class="mx-4 px-2 py-1 bg-gray-900 text-white rounded flex items-center gap-1 relative overflow-hidden"
        >
          <Plus :size="16" />
          <div class="shine"></div>
        </button>

        <!-- Right border -->
        <div
          class="flex-grow border-t-2 border-gray-500 dark:border-gray-700 relative overflow-hidden"
        ></div>
      </div>

      <Location v-model="newNoteLocation" />
      <button
        type="submit"
        class="px-4 py-2 w-fit bg-cyan text-white rounded hover:bg-cyan-500"
      >
        Add Note
      </button>
    </form>

    <!-- Notes List - Draggable -->
    <VueDraggableNext
      v-model="notes"
      @end="onDragEnd"
      handle=".drag-handle"
      class="gap-5 gap-y-8 grid md:grid-cols-2 list-none"
      :item-key="(note: NoteType) => note.id"
    >
      <template #item="{ element: note }">
        <li
          :key="note.id"
          class="rounded-2xl bg-gray-200 dark:bg-gray-950 border-white border dark:border-gray-700 p-0.5 h-fit"
        >
          <div
            class="note-content relative flex items-start gap-3 rounded-xl p-4 bg-slate-100 dark:bg-gray-900 border-white dark:border-gray-700 border h-96 overflow-y-scroll"
          >
            <div class="absolute top-2 right-3.5 flex gap-2">
              <!-- Edit button -->
              <button
                @click="startEditing(note.id)"
                v-if="editingId !== note.id"
                class="mt-1 p-1 text-gray-500 hover:text-gray-700"
              >
                <Pencil :size="16" />
              </button>
              <!-- Drag handle -->
              <div
                class="drag-handle cursor-move text-gray-500 hover:text-gray-300 mt-1"
                title="Drag to reorder"
              >
                ⋮⋮
              </div>
            </div>

            <div class="flex-1 px-3.5">
              <!-- View mode -->
              <div v-if="editingId !== note.id">
                <h3
                  class="font-semibold text-lg mb-2 text-gray-950 dark:text-gray-200"
                >
                  {{ note.title }}
                </h3>

                <!-- Render blocks -->
                <div v-for="block in note.content" :key="block.id" class="mb-2">
                  <div>
                    <div
                      class="wysiwyg text-gray-950 dark:text-gray-200"
                      v-html="block.text"
                    ></div>
                  </div>
                </div>

                <!-- Map preview -->
                <div v-if="note.location && note.location.address" class="pt-2">
                  <img
                    class="w-full h-48 border rounded object-cover"
                    :src="`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${note.location.longitude},${note.location.latitude})/${note.location.longitude},${note.location.latitude},14/600x400?access_token=${config.public.mapboxToken}`"
                    alt="Location map"
                  />
                  <div class="text-sm text-dark-950 dark:text-gray-200 mt-1">
                    📍 {{ note.location.address }}
                  </div>
                </div>
              </div>

              <!-- Edit mode -->
              <div v-else class="space-y-2">
                <input
                  v-model="note.title"
                  placeholder="Title"
                  class="border-2 border-gray-500 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl h-8 px-3 mb-3 w-full"
                />

                <!-- Block editor -->
                <div
                  v-for="block in note.content"
                  :key="block.id"
                  class="mb-2 relative group"
                >
                  <div class="flex items-start gap-2">
                    <div class="flex-1">
                      <Wysiwyg v-model="block.text" />
                    </div>
                    <!-- Delete block button (appears on hover) -->
                    <button
                      v-if="note.content.length > 1"
                      type="button"
                      @click="deleteBlock(note.content, block.id)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-6 p-1 text-cinnamon-red hover:text-red-700 rounded-full"
                      title="Delete block"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div class="flex items-center w-full my-6">
                  <!-- Left border -->
                  <div
                    class="flex-grow border-t-2 border-gray-500 dark:border-gray-700 relative overflow-hidden"
                  ></div>

                  <!-- Button -->
                  <button
                    type="button"
                    @click="addBlock(note.content)"
                    class="mx-4 px-2 py-1 bg-gray-950 text-white rounded flex items-center gap-1 relative overflow-hidden"
                  >
                    <Plus :size="16" />
                    <div class="shine"></div>
                  </button>

                  <!-- Right border -->
                  <div
                    class="flex-grow border-t-2 border-gray-500 dark:border-gray-700 relative overflow-hidden"
                  ></div>
                </div>
                <Location v-model="note.location" />
                <div class="flex items-center justify-between mt-4">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      @click="saveNote(note)"
                      class="px-3 py-1 bg-cyan text-white rounded hover:bg-cyan-500"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      @click="cancelEditing()"
                      class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <!-- Delete button -->
                  <button
                    type="button"
                    @click="deleteNote(note)"
                    class="px-2 py-1 bg-cinnamon-red text-white rounded hover:bg-red-600 self-start"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </template>
    </VueDraggableNext>
  </div>
  <div v-else>
    <p>Redirecting to login...</p>
  </div>
</template>

<style>
/* Common shimmer */
.shine {
  position: absolute;
  top: 0;
  left: -70%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg);
  pointer-events: none;
}

/* Trigger on hover of the parent element */
.flex-grow:hover .shine,
button:hover .shine {
  animation: shineSweep 0.8s forwards;
}

@keyframes shineSweep {
  0% {
    left: -50%;
  }
  100% {
    left: 120%;
  }
}
</style>
