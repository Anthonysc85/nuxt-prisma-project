<script setup lang="ts">
import { ref } from "vue";
import { Pencil } from "lucide-vue-next";

const notes = ref([]); // reactive array for notes
const newNote = ref({ title: "", content: "" });

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
</script>

<template>
  <div>
    <h1>Notes</h1>
    <form @submit.prevent="addNote" class="flex gap-3">
      <input
        class="border-2 border-gray-500 rounded-2xl h-8 px-3"
        v-model="newNote.title"
        placeholder="Title"
      />
      <textarea
        class="border-2 border-gray-500 rounded-2xl px-3"
        v-model="newNote.content"
        placeholder="Content"
      ></textarea>
      <button
        type="submit"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Add Note
      </button>
    </form>

    <ul class="gap-4 mt-6 flex flex-col">
      <li v-for="note in notes" :key="note.id">
        <input
          class="border-2 border-gray-500 rounded-2xl h-8 px-3"
          v-model="note.title"
        />
        <textarea
          class="border-2 border-gray-500 rounded-2xl px-3"
          v-model="note.content"
        />
        <button
          type="button"
          @click="updateNote(note)"
          class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save
        </button>
        <button
          type="button"
          @click="deleteNote(note)"
          class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      </li>
    </ul>
  </div>
</template>
