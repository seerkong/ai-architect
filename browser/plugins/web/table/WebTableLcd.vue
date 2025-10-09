<template>
  <div class="web-table-container">
    <table ref="tableRef" class="web-table" v-bind="{ ...$props, ...$attrs }">
      <thead v-if="showHeader">
        <tr>
          <th v-if="selectable" class="select-column">
            <input 
              type="checkbox" 
              :checked="isAllSelected" 
              @change="toggleSelectAll"
              class="select-all-checkbox"
            />
          </th>
          <th 
            v-for="column in columns" 
            :key="column.prop || column.label"
            :class="getColumnClass(column)"
            :style="getColumnStyle(column)"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(row, rowIndex) in data" 
          :key="getRowKey(row, rowIndex)"
          :class="getRowClass(row, rowIndex)"
          @click="selectRow(row, rowIndex)"
        >
          <td v-if="selectable" class="select-column">
            <input 
              type="checkbox" 
              :checked="isRowSelected(row)"
              @change="toggleRowSelection(row)"
              class="row-checkbox"
            />
          </td>
          <td 
            v-for="column in columns" 
            :key="column.prop || column.label"
            :class="getCellClass(column, row)"
            :style="getCellStyle(column, row)"
          >
            <slot 
              :name="`$${column.prop}`" 
              :row="row" 
              :column="column" 
              :rowIndex="rowIndex"
            >
              {{ getCellValue(row, column) }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  rowKey: String,
  selected: Array,
  selectable: {
    type: Boolean,
    default: false
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: false
  },
  border: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:selected', 'select', 'select-all'])

const tableRef = ref()
const selectedRows = ref(props.selected || [])

const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedRows.value.length === props.data.length
})

function getRowKey(row, index) {
  return props.rowKey ? row[props.rowKey] : index
}

function isRowSelected(row) {
  const key = props.rowKey ? row[props.rowKey] : row
  return selectedRows.value.some(selected => {
    const selectedKey = props.rowKey ? selected[props.rowKey] : selected
    return selectedKey === key
  })
}

function toggleRowSelection(row) {
  const key = props.rowKey ? row[props.rowKey] : row
  const index = selectedRows.value.findIndex(selected => {
    const selectedKey = props.rowKey ? selected[props.rowKey] : selected
    return selectedKey === key
  })
  
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(row)
  }
  
  emit('update:selected', selectedRows.value)
  emit('select', selectedRows.value)
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = [...props.data]
  }
  
  emit('update:selected', selectedRows.value)
  emit('select-all', selectedRows.value)
}

function selectRow(row, rowIndex) {
  if (props.selectable) {
    toggleRowSelection(row)
  }
}

function getColumnClass(column) {
  return [
    'table-column',
    column.className,
    {
      'is-sortable': column.sortable,
      'is-center': column.align === 'center',
      'is-right': column.align === 'right'
    }
  ]
}

function getColumnStyle(column) {
  return {
    width: column.width,
    minWidth: column.minWidth,
    ...column.style
  }
}

function getRowClass(row, rowIndex) {
  return [
    'table-row',
    {
      'is-selected': isRowSelected(row),
      'is-stripe': props.stripe && rowIndex % 2 === 1
    }
  ]
}

function getCellClass(column, row) {
  return [
    'table-cell',
    column.cellClassName,
    {
      'is-center': column.align === 'center',
      'is-right': column.align === 'right'
    }
  ]
}

function getCellStyle(column, row) {
  return {
    ...column.cellStyle
  }
}

function getCellValue(row, column) {
  if (column.formatter) {
    return column.formatter(row, column, row[column.prop], row)
  }
  return row[column.prop]
}

// 监听selected属性变化
watchEffect(() => {
  selectedRows.value = props.selected || []
})
</script>

<style scoped>
.web-table-container {
  width: 100%;
  overflow: auto;
}

.web-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: 14px;
  color: #606266;
  background-color: #fff;
}

.web-table th,
.web-table td {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  text-align: left;
}

.web-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
  padding: 12px 8px;
}

.web-table td {
  padding: 12px 8px;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.table-row.is-selected {
  background-color: #ecf5ff;
}

.table-row.is-stripe {
  background-color: #fafafa;
}

.table-row.is-stripe:hover {
  background-color: #f5f7fa;
}

.select-column {
  width: 50px;
  text-align: center;
}

.select-all-checkbox,
.row-checkbox {
  cursor: pointer;
}

.table-column.is-center,
.table-cell.is-center {
  text-align: center;
}

.table-column.is-right,
.table-cell.is-right {
  text-align: right;
}

.table-column.is-sortable {
  cursor: pointer;
  user-select: none;
}

.table-column.is-sortable:hover {
  color: #409eff;
}
</style>