<script setup lang="ts">
import { ref } from "vue";

const { data: notes, refresh } = useFetch("/api/notes");
const newNote = ref({ title: "", content: "" });

async function addNote() {
  await $fetch("/api/notes", {
    method: "POST",
    body: newNote.value,
  });
  newNote.value = { title: "", content: "" };
  refresh();
}
</script>

<template>
  <div>
    <h1>Notes</h1>
    <form @submit.prevent="addNote">
      <input v-model="newNote.title" placeholder="Title" />
      <textarea v-model="newNote.content" placeholder="Content"></textarea>
      <button>Add Note</button>
    </form>

    <ul>
      <li v-for="note in notes" :key="note.id">
        <strong>{{ note.title }}</strong
        >: {{ note.content }}
      </li>
    </ul>
  </div>
</template>
