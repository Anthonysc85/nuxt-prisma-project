<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from "reka-ui";

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>
<template>
  <SwitchRoot
    :model-value="modelValue"
    class="data-[state=checked]:bg-red-800 dark:bg-charcoal-light relative h-5 w-10 cursor-pointer rounded-full bg-gray-200 transition-colors"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SwitchThumb
      class="block h-4 w-4 translate-x-0.5 rounded-full bg-gray-800 transition-transform data-[state=checked]:translate-x-[22px]"
    />
  </SwitchRoot>
</template>
