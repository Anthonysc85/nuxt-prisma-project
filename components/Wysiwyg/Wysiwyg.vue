<script setup lang="ts">
import WysiwygToolbar from "./WysiwygToolbar.vue";
import { useWysiwyg } from "./useWysiwyg";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const { editor, activeStates, currentBlock, exec, toggleBlock, handleInput } =
  useWysiwyg(props.modelValue, emit);
</script>

<template>
  <WysiwygToolbar
    :activeStates="activeStates"
    @exec="exec"
    @toggleBlock="toggleBlock"
  />
  <div
    ref="editor"
    contenteditable="true"
    spellcheck="true"
    @input="handleInput"
    class="wysiwyg border-x-2 border-b-2 p-3 min-h-[150px] rounded-b-lg bg-slate-200 dark:bg-gray-800 border-slate-400 dark:border-gray-700"
  ></div>
</template>

<style src="./wysiwyg.css" />
