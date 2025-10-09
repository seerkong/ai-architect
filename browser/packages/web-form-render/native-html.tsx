import { createVNode, resolveDynamicComponent } from 'vue'
import { createFormRender } from './createFormRender'
import { showOpt, solveOptions } from './utils'

// 原生HTML表单组件
const NativeForm = 'form'
const NativeFormItem = 'div' // 使用div包装表单项

// 原生HTML表单属性
const formProps = {
  action: String,
  method: String,
  enctype: String,
  target: String,
  autocomplete: String,
  novalidate: Boolean,
  name: String
}

// 原生HTML表单项属性
const formItemProps = {
  label: String,
  prop: String,
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean
}

const { FormRender, FormItemRender, formRenderProps, formItemRenderProps } = createFormRender({
  Form: NativeForm,
  formName: 'WebFormRender',
  formProps: formProps,
  FormItem: NativeFormItem,
  formItemName: 'WebFormItemRender',
  formItemProps: formItemProps,
  Input: (item) => {
    const { type, el } = item
    const is = el?.is || type || 'input'
    
    if (!item.options) {
      // 处理原生HTML输入组件
      if (is === 'input' || is === 'text' || is === 'password' || is === 'email' || is === 'number' || is === 'tel' || is === 'url') {
        return createVNode('input', { type: type || 'text', ...el })
      } else if (is === 'textarea') {
        return createVNode('textarea', el)
      } else if (is === 'select') {
        return createVNode('select', el)
      } else {
        return createVNode(resolveDynamicComponent(is), el)
      }
    }
    
    const options = solveOptions(item.options)!
    
    if (type == 'select' || is == 'select') {
      return (
        <select {...el}>
          {options.map(opt => <option value={opt.value}>{showOpt(opt)}</option>)}
        </select>
      )
    }
    else if (type == 'checkbox-group' || is == 'checkbox-group') {
      return (
        <div class="checkbox-group">
          {options.map(opt => (
            <label class="checkbox-item">
              <input type="checkbox" value={opt.value} {...el} />
              <span>{showOpt(opt)}</span>
            </label>
          ))}
        </div>
      )
    }
    else if (type == 'radio-group' || is == 'radio-group') {
      return (
        <div class="radio-group">
          {options.map(opt => (
            <label class="radio-item">
              <input type="radio" value={opt.value} {...el} />
              <span>{showOpt(opt)}</span>
            </label>
          ))}
        </div>
      )
    }
    else {
      return createVNode(resolveDynamicComponent(is), { options, ...el })
    }
  },
  fields: {
    modelValue: (item) => ({
      input: 'value',
      textarea: 'value',
      select: 'value'
    }[item.is!] || 'value')
  }
})

export const WebFormRender = FormRender
export const WebFormItemRender = FormItemRender

export {
  formRenderProps,
  formItemRenderProps
}

export default WebFormRender
