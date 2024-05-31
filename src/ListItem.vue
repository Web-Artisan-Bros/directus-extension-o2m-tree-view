<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue'
import List from './List.vue'
import { useStores } from '@directus/extensions-sdk'
import { useDrawerStore } from './stores/drawer.js'

const props = defineProps<{
  item: any[];
  templateFields: string[];
  interfaceField: string;
  level: number;
}>()
const collection = inject('collection', ref())
const relationInfo = inject('relationInfo', ref())
const activeId = inject('activeId', ref())
const emits = defineEmits(['input'])

const availableStores = useStores()
const drawerStore = useDrawerStore()
const permissionsStore = availableStores.usePermissionsStore()

const open = ref(true)
const edits = ref({})

const text = computed(() => {
  return props.templateFields.map((field: string) => {
    return props.item[field]
  }).join(' ')
})

const permissions = computed(() => ({
  create: permissionsStore.hasPermission(collection.value, 'create'),
  update: permissionsStore.hasPermission(collection.value, 'update')
}))

const isActive = computed(() => props.item.id === activeId.value)

const hasChilds = computed(() => props.item[props.interfaceField].length > 0)

const toggleOpenState = () => {
  open.value = !open.value
}

function newChild () {
  drawerStore.addNewActive = true
  drawerStore.parentId = props.item.id
}

watch(() => activeId.value, () => {
  if (isActive.value) {
    open.value = true
  }
}, { immediate: true })


</script>

<template>
  <li :data-level="level">
    <RouterLink :to="`/content/${collection}/${item.id}`"
                :style="{
                  paddingLeft: `${(props.level * 14) + 4}px`
                }"
                :class="{active: isActive}">
      <span class="icon" :class="{'expandable': hasChilds, open}"
            @click.stop.prevent="toggleOpenState"
            v-tooltip="hasChilds ? 'Apri / Chiudi' : null">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"
             fill="currentColor"
             v-if="hasChilds">
          <path
              d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
        </svg>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"
             fill="currentColor"
             style="width: 6px; height: 6px"
             v-else>
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/>
        </svg>
      </span>

      {{ text }}

      <!--      <span class="icon on-hover" style="margin-left: 1rem"-->
      <!--            @click.prevent.stop="newChild">-->
      <!--        <v-icon-->
      <!--            v-if="permissions.create"-->
      <!--            v-tooltip="'Create new child'"-->
      <!--            class="add"-->
      <!--            name="add"-->
      <!--        />-->
      <!--      </span>-->
    </RouterLink>

    <List :templateFields="templateFields"
          :interface-field="interfaceField"
          :items="item[interfaceField]"
          :level="level+1"
          :open="open"
          v-if="hasChilds"
          @update:modelValue="emits('input', $event)"/>
  </li>

</template>

<style scoped>
li {
  a {
    display: flex;
    align-items: center;
    padding-top: 8px;
    padding-bottom: 8px;
    gap: .3rem;
    border-radius: 4px;
    transition: background-color .25s ease;
    color: var(--theme--foreground);

    &:hover {
      background-color: var(--theme--background-accent);

      .icon.on-hover {
        opacity: 1;
      }
    }

    &.active {
      color: var(--theme--foreground-accent);
      font-weight: bold;
    }

  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;

  svg {
    width: 12px;
    height: 12px;
    transition: transform .25s ease;
  }

  &.expandable {
    transition: background-color .25s ease;

    &:hover {
      background-color: var(--theme--background-subdued);
    }

    &.open svg {
      transform: rotate(90deg);
    }
  }

  &.on-hover {
    opacity: 0;
    transition: background-color .25s ease, opacity .25s ease-in-out;

    &:hover {
      background-color: var(--theme--background-subdued);
    }
  }

}
</style>
