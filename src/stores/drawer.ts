import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDrawerStore = defineStore('drawerStore', () => {
  const _addNewActive = ref(false)
  const edits = ref({
    create: [],
    update: []
  })
  const parentId = ref()
  
  const addNewActive = computed({
    get: () => _addNewActive.value,
    set: (value) => {
      if (!value) {
        setTimeout(() => {
          parentId.value = null
        }, 100)
      }
      
      _addNewActive.value = value
    }
  })
  
  function addEdits (data: Record<string, any>) {
    const key = Object.keys(data)[0]
    
    if (!edits.value[key]) {
      edits.value[key] = []
    }
    
    edits.value[key].push(data[key])
  }
  
  return {
    addNewActive,
    edits,
    parentId,
    addEdits
  }
})
