<script setup lang="ts">
import { ref } from "vue";
import { useRuntimeConfig } from "#app";
import { Pencil } from "lucide-vue-next";
import Location from "../components/LocationMap.vue";

const config = useRuntimeConfig();

// --- Types ---
interface LocationType {
  latitude: number;
  longitude: number;
  address: string;
}

interface NoteBlock {
  id: number;
  type: "paragraph" | "list";
  text: string;
}

interface NoteType {
  id: number;
  title: string;
  content: NoteBlock[];
  createdAt: string;
  location: LocationType | null;
}

// --- Refs ---
const notes = ref<NoteType[]>([]);
const newNote = ref<Pick<NoteType, "title" | "content">>({
  title: "",
  content: [{ id: Date.now(), type: "paragraph", text: "" }],
});
const newNoteLocation = ref<LocationType | null>(null);
const editingId = ref<number | null>(null);

// --- Load notes from API ---
async function loadNotes() {
  try {
    const data = await $fetch("/api/notes");
    notes.value = data.map((note: any) => {
      let parsedContent: NoteBlock[] = [];

      try {
        parsedContent = JSON.parse(note.content);
        if (!Array.isArray(parsedContent)) {
          parsedContent = [
            { id: Date.now(), type: "paragraph", text: String(parsedContent) },
          ];
        }
      } catch {
        parsedContent = note.content
          ? [{ id: Date.now(), type: "paragraph", text: note.content }]
          : [];
      }

      return {
        ...note,
        content: parsedContent,
        location:
          note.latitude != null && note.longitude != null
            ? {
                latitude: note.latitude,
                longitude: note.longitude,
                address: note.address,
              }
            : { latitude: 0, longitude: 0, address: "" },
      };
    });
  } catch (err) {
    console.error("Failed to load notes:", err);
  }
}

// Initial load
loadNotes();

// --- Add note ---
async function addNote() {
  const token = localStorage.getItem("token");

  await $fetch("/api/notes", {
    method: "POST",
    body: {
      title: newNote.value.title,
      content: JSON.stringify(newNote.value.content),
      latitude: newNoteLocation.value?.latitude ?? null,
      longitude: newNoteLocation.value?.longitude ?? null,
      address: newNoteLocation.value?.address ?? null,
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

// --- Update note ---
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

// --- Delete note ---
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

// --- Editing helpers ---
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
</script>

<template>
  <div class="px-4 py-6 dark:bg-gray-950 dark:text-gray-200">
    <h1 class="pb-4 text-4xl font-semibold">Notes</h1>

    <!-- Add New Note -->
    <form @submit.prevent="addNote" class="flex flex-col gap-3 mb-6">
      <input
        v-model="newNote.title"
        placeholder="Title"
        class="border-2 border-gray-500 rounded-2xl h-8 px-3 w-1/2"
      />

      <!-- Block editor for new note -->
      <div v-for="block in newNote.content" :key="block.id" class="mb-2">
        <select
          v-model="block.type"
          class="border-2 border-gray-500 rounded-2xl px-2 py-1 mb-3"
        >
          <option id="paragraph" class="dark:text-gray-200" value="paragraph">
            Paragraph
          </option>
          <option id="list" class="dark:text-gray-200" value="list">
            List
          </option>
        </select>
        <textarea
          v-model="block.text"
          rows="2"
          class="border-2 border-gray-500 rounded-2xl px-3 w-full resize-y h-32"
          placeholder="Write here..."
        ></textarea>
      </div>
      <button
        type="button"
        @click="
          newNote.content.push({ id: Date.now(), type: 'paragraph', text: '' })
        "
        class="px-3 py-1 bg-green-600 text-white rounded w-fit"
      >
        + Add Block
      </button>

      <Location v-model="newNoteLocation" />

      <button
        type="submit"
        class="px-4 py-2 w-fit bg-cyan-500/50 text-white rounded hover:bg-cyan-500"
      >
        Add Note
      </button>
    </form>

    <!-- Notes List -->
    <ul class="gap-4 flex flex-col">
      <li
        v-for="note in notes"
        :key="note.id"
        class="border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <!-- Edit button -->
          <button
            @click="startEditing(note.id)"
            v-if="editingId !== note.id"
            class="mt-1 p-1 text-gray-500 hover:text-gray-700"
          >
            <Pencil :size="16" />
          </button>

          <div class="flex-1">
            <!-- View mode -->
            <div v-if="editingId !== note.id">
              <h3 class="font-semibold text-lg mb-2">{{ note.title }}</h3>

              <!-- Render blocks -->
              <div v-for="block in note.content" :key="block.id" class="mb-2">
                <p
                  v-if="block.type === 'paragraph'"
                  class="whitespace-pre-wrap"
                >
                  {{ block.text }}
                </p>
                <ul
                  v-else-if="block.type === 'list'"
                  class="list-disc list-inside"
                >
                  <li v-for="(item, i) in block.text.split('\n')" :key="i">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <!-- Map preview -->
              <div v-if="note.location && note.location.address" class="mt-2">
                <img
                  class="w-1/2 h-48 border rounded object-cover"
                  :src="`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${note.location.longitude},${note.location.latitude})/${note.location.longitude},${note.location.latitude},14/600x400?access_token=${config.public.mapboxToken}`"
                  alt="Location map"
                />
                <div class="text-sm text-gray-700 dark:text-gray-200 mt-1">
                  📍 {{ note.location.address }}
                </div>
              </div>
            </div>

            <!-- Edit mode -->
            <div v-else class="space-y-2">
              <input
                v-model="note.title"
                placeholder="Title"
                class="border-2 border-gray-500 rounded-2xl h-8 px-3 w-full"
              />

              <!-- Block editor -->
              <div v-for="block in note.content" :key="block.id" class="mb-2">
                <select
                  v-model="block.type"
                  class="border-2 rounded-2xl border-gray-500 px-2 py-1 mb-1"
                >
                  <option
                    class="dark:text-gray-200"
                    id="paragraph"
                    value="paragraph"
                  >
                    Paragraph
                  </option>
                  <option class="dark:text-gray-200" id="list" value="list">
                    List
                  </option>
                </select>
                <textarea
                  v-model="block.text"
                  rows="2"
                  class="border-2 border-gray-500 rounded-2xl px-3 w-full h-32 resize-y"
                  placeholder="Write here..."
                ></textarea>
              </div>
              <button
                type="button"
                @click="
                  note.content.push({
                    id: Date.now(),
                    type: 'paragraph',
                    text: '',
                  })
                "
                class="px-3 py-1 bg-green-600 text-white rounded"
              >
                + Add Block
              </button>

              <Location v-model="note.location" />

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="saveNote(note)"
                  class="px-3 py-1 bg-cyan-500/50 text-white rounded hover:bg-cyan-500"
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
            </div>
          </div>

          <!-- Delete button -->
          <button
            type="button"
            @click="deleteNote(note)"
            class="px-2 py-1 bg-red-800 text-white rounded hover:bg-red-600 self-start"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
