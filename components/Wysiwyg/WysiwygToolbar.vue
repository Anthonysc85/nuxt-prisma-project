<script setup lang="ts">
import {
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "reka-ui";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  ListOrdered,
  TextQuote,
  CodeXml,
} from "lucide-vue-next";

const props = defineProps<{ activeStates: Record<string, boolean> }>();
const emit = defineEmits<{
  (e: "exec", command: string): void;
  (e: "toggleBlock", tag: "blockquote" | "pre"): void;
}>();
</script>

<template>
  <ToolbarRoot
    class="flex px-[10px] py-2 w-full !min-w-max rounded-t-lg bg-gray-900 border-t-2 border-x-2 shadow-2xl border-slate-400 dark:border-gray-700"
  >
    <!-- Formatting buttons -->
    <ToolbarToggleGroup type="multiple" aria-label="Text formatting">
      <ToolbarToggleItem
        :class="activeStates.bold ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'bold')"
      >
        <Bold class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.italic ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'italic')"
      >
        <Italic class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.underline ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'underline')"
      >
        <Underline class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.strikethrough ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'strikeThrough')"
      >
        <Strikethrough class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-gray-200 mx-[10px]" />

    <!-- Lists & Links -->
    <ToolbarToggleGroup type="multiple" aria-label="Lists & Links">
      <ToolbarToggleItem
        :class="activeStates.unorderedList ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'insertUnorderedList')"
      >
        <List class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.orderedList ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'insertOrderedList')"
      >
        <ListOrdered class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.link ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('exec', 'createLink')"
      >
        <Link class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>

    <ToolbarSeparator class="w-[1px] bg-gray-200 mx-[10px]" />

    <!-- Block toggles -->
    <ToolbarToggleGroup type="multiple" aria-label="Blocks">
      <ToolbarToggleItem
        :class="activeStates.blockquote ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('toggleBlock', 'blockquote')"
      >
        <TextQuote class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>

      <ToolbarToggleItem
        :class="activeStates.code ? 'bg-gray-800 text-white' : ''"
        class="w-8 h-full rounded hover:bg-gray-800"
        @click="$emit('toggleBlock', 'pre')"
      >
        <CodeXml class="w-[15px] h-[15px] mx-auto text-gray-200" />
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  </ToolbarRoot>
</template>
