import { Extension } from '@tiptap/core'

import type { TableCellOptions } from '../cell/index.ts'
import { TableCell } from '../cell/index.ts'
import type { TableHeaderOptions } from '../header/index.ts'
import { TableHeader } from '../header/index.ts'
import type { TableRowOptions } from '../row/index.ts'
import { TableRow } from '../row/index.ts'
import type { TableWithCustomAttributesOptions } from '../table/table-with-custom-attributes.ts'
import { TableWithCustomAttributes } from '../table/table-with-custom-attributes.ts'

export interface TableKitWithCustomAttributesOptions {
  /**
   * If set to false, the table extension will not be registered
   * @example table: false
   */
  table: Partial<TableWithCustomAttributesOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableCell: false
   */
  tableCell: Partial<TableCellOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableHeader: false
   */
  tableHeader: Partial<TableHeaderOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableRow: false
   */
  tableRow: Partial<TableRowOptions> | false
}

/**
 * The table kit with custom attributes support is a collection of table editor extensions.
 * It extends the original TableKit to support custom attributes like x-id.
 *
 * It's a good starting point for building your own table in Tiptap with custom attributes.
 */
export const TableKitWithCustomAttributes = Extension.create<TableKitWithCustomAttributesOptions>({
  name: 'tableKitWithCustomAttributes',

  addExtensions() {
    const extensions = []

    if (this.options.table !== false) {
      extensions.push(TableWithCustomAttributes.configure(this.options.table))
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCell.configure(this.options.tableCell))
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options.tableHeader))
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options.tableRow))
    }

    return extensions
  },
})
