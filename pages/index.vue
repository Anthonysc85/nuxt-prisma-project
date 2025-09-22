<script setup lang="ts">
import { ref } from "vue";
import { Pencil } from "lucide-vue-next";
import Header from "../components/Header.vue";

const notes = ref([]); // reactive array for notes
const newNote = ref({ title: "", content: "" });
const editingId = ref(null); // track which note is being edited

async function loadNotes() {
  try {
    const data = await $fetch("/api/notes");
    notes.value = data;
  } catch (err) {
    console.error("Failed to load notes:", err);
  }
}

// initial load
loadNotes();

async function addNote() {
  try {
    const token = localStorage.getItem("token"); // or from a cookie
    await $fetch("/api/notes", {
      method: "POST",
      body: newNote.value,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    newNote.value = { title: "", content: "" };
    await loadNotes(); // refresh
  } catch (err) {
    console.error("Failed to add note:", err);
  }
}

async function updateNote(note) {
  try {
    const token = localStorage.getItem("token");
    await $fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      body: note,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await loadNotes();
  } catch (err) {
    console.error("Failed to update note:", err);
  }
}

async function deleteNote(note) {
  try {
    const token = localStorage.getItem("token");
    await $fetch(`/api/notes/${note.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await loadNotes();
  } catch (err) {
    console.error("Failed to delete note:", err);
  }
}

function startEditing(noteId) {
  editingId.value = noteId;
}

function cancelEditing() {
  editingId.value = null;
  // Reload notes to revert any unsaved changes
  loadNotes();
}

async function saveNote(note) {
  await updateNote(note);
  editingId.value = null;
}
</script>

<template>
  <Header />
  <div class="px-4 py-6 dark:bg-gray-950 dark:text-gray-200">
    <h1 class="pb-4 text-4xl font-semibold">Notes</h1>
    <form @submit.prevent="addNote" class="flex flex-col gap-3">
      <input
        id="title"
        class="border-2 border-gray-500 rounded-2xl h-8 px-3 w-1/2"
        v-model="newNote.title"
        placeholder="Title"
      />
      <textarea
        id="note-content"
        class="border-2 border-gray-500 rounded-2xl px-3 h-56 w-full resize-y"
        v-model="newNote.content"
        placeholder="Content"
      ></textarea>
      <button
        type="submit"
        class="px-4 py-2 w-fit bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Note
      </button>
    </form>

    <ul class="gap-4 mt-6 flex flex-col">
      <li
        v-for="note in notes"
        :key="note.id"
        class="border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-start gap-3">
          <!-- Pencil icon for edit -->
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
              <p class="text-gray-700 whitespace-pre-wrap">
                {{ note.content }}
              </p>
            </div>

            <!-- Edit mode -->
            <div v-else class="space-y-2">
              <input
                class="border-2 border-gray-500 rounded-2xl h-8 px-3 w-full"
                v-model="note.title"
                placeholder="Title"
              />
              <textarea
                class="border-2 border-gray-500 rounded-2xl px-3 w-full resize-y"
                v-model="note.content"
                placeholder="Content"
                rows="3"
              ></textarea>
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="saveNote(note)"
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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

          <!-- Delete button (always visible) -->
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
