<script setup lang="ts">
import ListItem from './ListItem.vue'
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  items: any;
  templateFields: string[];
  interfaceField: string;
  level: number;
  open?: boolean;
  modelValue?: any;
}>()

const ul = ref<HTMLElement>()
const emits = defineEmits(['input', "update:modelValue"])

const value = computed<any[]>({
  get () {
    if (props.modelValue === undefined) return []
    return props.modelValue
  },
  set: (val) => {
    emits('update:modelValue', val)
  }
})

watch([() => props.open, ul], () => {
  if (!ul || !ul.value) return

  if (!props.open) {
    ul.value?.style.setProperty('--height', `${ul.value.scrollHeight}px`)
  }

  setTimeout(() => {
    ul.value?.style.setProperty('--height', props.open ? `${ul.value.scrollHeight}px` : '0px')
  })

  if (props.open) {
    setTimeout(() => {
      ul.value?.style.setProperty('--height', props.open ? 'auto' : '0px')
    }, 410)
  }
}, { immediate: true })

</script>

<template>
  <ul :class="{'collapsable': level > 0}" ref="ul">
    <ListItem v-for="(item) in items" :key="item.id"
              :item="item" :templateFields="templateFields" :interfaceField="interfaceField"
              :level="level"
              @input="value = $event"/>
  </ul>
</template>

<style scoped>
ul {
  --height: 0px;
  padding-left: 0;
  list-style: none;
  overflow: hidden;
  transition: height .3s ease-in-out;

  &.collapsable {
    height: var(--height);
  }
}
</style>
