const defaultController = {
  alert: (options) => {
    const { title, description, message } = normalizeOptions(options)
    const text = description || message || title || ''
    window.alert(text)
    return Promise.resolve()
  },
  confirm: (options) => {
    const { title, description, message } = normalizeOptions(options)
    const text = description || message || title || 'Are you sure?'
    const result = window.confirm(text)
    return Promise.resolve(result)
  },
}

let controller = defaultController

function normalizeOptions(opts) {
  if (!opts) {
    return {}
  }

  if (typeof opts === 'string') {
    return { title: opts }
  }

  return opts
}

export const setDialogController = (nextController) => {
  controller = nextController ? { ...defaultController, ...nextController } : defaultController
}

export const dialog = {
  alert: (options) => controller.alert(normalizeOptions(options)),
  confirm: (options) => controller.confirm(normalizeOptions(options)),
}

export const dialogDefaultController = defaultController


