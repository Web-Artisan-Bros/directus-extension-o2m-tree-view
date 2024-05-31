<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, onUpdated, provide, ref, toRefs, watch } from 'vue'
import { getFieldsFromTemplate, useApi, useItems, useStores } from '@directus/extensions-sdk'
import { useRelationO2M } from './composables/use-relation-02m'
import { addRelatedPrimaryKeyToFields } from './utils/add-related-primary-key-to-fields'
import { adjustFieldsForDisplays } from './utils/adjust-fields-for-displays'
import { useI18n } from 'vue-i18n'
import List from './List.vue'
import { useDrawerStore } from './stores/drawer.js'

const props = withDefaults(
    defineProps<{
      value?: (number | string | Record<string, any>)[] | Record<string, any>;
      displayTemplate?: string;
      disabled?: boolean;
      collection: string;
      field: string;
      loading?: boolean;
      primaryKey: string | number;
      enableCreate?: boolean;
      enableSelect?: boolean;
      filter?: any | null;
    }>(),
    {
      disabled: false,
      enableCreate: true,
      enableSelect: true,
      filter: null,
      displayTemplate: undefined
    }
)
const { collection, field, primaryKey } = toRefs(props)
const api = useApi()
const relationsO2MState = useRelationO2M(collection, field)
const drawerStore = useDrawerStore()
const { t } = useI18n()
const values = inject('values', ref<Record<string, any>>({}))
const items = ref({})
const emits = defineEmits(['input'])

provide('collection', props.collection)
provide('activeId', computed(() => +props.primaryKey))
provide('relationInfo', relationsO2MState.relationInfo)

const edits = []
const _value = computed<ChangesItem>({
  get () {
    if (Array.isArray(props.value)) {
      return {
        create: [],
        update: [],
        delete: []
      }
    }

    return props.value as ChangesItem
  },
  set: (val) => {
    debugger
    emit('input', val)
  }
})

const openNewElDialog = ref(false)

const template = computed(() => {
  const relationInfo = relationsO2MState.relationInfo

  return (
      props.displayTemplate ||
      relationInfo.value?.relatedCollection?.meta?.display_template ||
      `{{${relationInfo.value?.relatedPrimaryKeyField.field}}}`
  )
})

const fields = computed(() => {
  const relationInfo = relationsO2MState.relationInfo

  if (!relationInfo.value) return []

  const displayFields = adjustFieldsForDisplays(
      getFieldsFromTemplate(template.value),
      relationInfo.value.relatedCollection.collection
  )

  return addRelatedPrimaryKeyToFields(relationInfo.value?.relatedCollection.collection ?? '', displayFields)
})

const getRootElement = async (id: number) => {
  const resp = await api.get(`items/${collection.value}/${id}`)

  const parentField = relationsO2MState.relationInfo.value.relation.field
  const data = resp.data.data

  if (data[parentField]) {
    return getRootElement(data[parentField])
  }

  return data
}

const fetchData = async (id: number) => {
  const depth = 5
  const fields = ['*']

  for (let i = 1; i <= depth; i++) {
    const concat = []

    while (concat.length < i) {
      concat.push(field.value)
    }

    fields.push(`${concat.join('.')}.*`)
  }

  const resp = await api.get(`items/${collection.value}/${id}`, {
    params: {
      fields
    }
  })

  return resp.data.data
}

const onUpdate = (item: any) => {
  item[relationsO2MState.relationInfo.value.reverseJunctionField.field] = drawerStore.parentId

  drawerStore.addEdits({ create: item })

  emits('input', drawerStore.edits)
}

const toggleNewItemDrawer = (value: boolean) => {
  drawerStore.addNewActive = value
}

watch(() => props.primaryKey, async (value) => {
  if (primaryKey.value === '+') {
    return
  }
  const root = await getRootElement(primaryKey.value)

  items.value = [await fetchData(root.id)]
}, {
  immediate: true
})

watch(() => drawerStore.addNewActive, (value) => {
  openNewElDialog.value = value
})

watch(() => props.loading, (value) => {
  // quando loading diventa true, resetto gli edits
  if (value) {
    drawerStore.edits = {}
  }
})
</script>

<template>
  <div>
    <div class="actions">
      <v-button v-if="enableCreate" @click="toggleNewItemDrawer">{{ t('create_new') }}</v-button>
    </div>

    <List :items="items" :templateFields="fields" :interfaceField="field" :level="0"></List>

    <drawer-item
        :active="openNewElDialog"
        :collection="collection"
        :primary-key="'+'"
        :edits="{}"
        :circular-field="relationsO2MState.relationInfo.value.reverseJunctionField.field"
        @update:active="toggleNewItemDrawer"
        @input="onUpdate"
    />
  </div>
</template>

<style scoped>
.actions {
  margin-bottom: 2rem;
  margin-top: 1rem;
}
</style>
