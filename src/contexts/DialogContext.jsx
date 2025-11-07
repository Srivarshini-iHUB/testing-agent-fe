import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { dialogDefaultController, setDialogController } from '../utils/dialogService'

const DialogContext = createContext(null)

const VARIANT_STYLES = {
  info: {
    icon: 'fa-circle-info',
    ring: 'ring-blue-500/20',
    accent: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    iconWrap: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
    confirm: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
  },
  success: {
    icon: 'fa-circle-check',
    ring: 'ring-emerald-500/20',
    accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    iconWrap: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
    confirm: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500',
  },
  warning: {
    icon: 'fa-triangle-exclamation',
    ring: 'ring-amber-500/20',
    accent: 'bg-gradient-to-r from-amber-500 to-orange-500',
    iconWrap: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
    confirm: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500',
  },
  danger: {
    icon: 'fa-circle-exclamation',
    ring: 'ring-rose-500/20',
    accent: 'bg-gradient-to-r from-rose-500 to-red-500',
    iconWrap: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300',
    confirm: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
  },
}

const noop = () => {}

const useDialogState = () => {
  const [dialogState, setDialogState] = useState(null)

  const closeDialog = useCallback(() => {
    setDialogState((prev) => {
      if (prev?.resolve) {
        prev.resolve(prev.type === 'confirm' ? false : undefined)
      }
      return null
    })
  }, [])

  const confirm = useCallback((options = {}) => {
    const normalized = typeof options === 'string' ? { message: options } : options

    return new Promise((resolve) => {
      setDialogState({
        type: 'confirm',
        title: normalized.title || 'Are you sure?',
        message: normalized.message || normalized.description || '',
        variant: normalized.variant || normalized.intent || 'warning',
        confirmText: normalized.confirmText || normalized.okText || 'Confirm',
        cancelText: normalized.cancelText || 'Cancel',
        resolve,
        allowOutsideClose: normalized.allowOutsideClose ?? false,
        destructive: normalized.variant === 'danger' || normalized.intent === 'danger',
      })
    })
  }, [])

  const alert = useCallback((options = {}) => {
    const normalized = typeof options === 'string' ? { message: options } : options

    return new Promise((resolve) => {
      setDialogState({
        type: 'alert',
        title: normalized.title || 'Heads up',
        message: normalized.message || normalized.description || '',
        variant: normalized.variant || normalized.intent || 'info',
        confirmText: normalized.confirmText || normalized.okText || 'Okay',
        resolve,
        allowOutsideClose: normalized.allowOutsideClose ?? true,
      })
    })
  }, [])

  const resolveDialog = useCallback((result) => {
    setDialogState((prev) => {
      if (!prev) return null
      if (prev.resolve) {
        prev.resolve(result)
      }
      return null
    })
  }, [])

  return { dialogState, confirm, alert, resolveDialog }
}

export const DialogProvider = ({ children }) => {
  const { dialogState, confirm, alert, resolveDialog } = useDialogState()

  useEffect(() => {
    setDialogController({ confirm, alert })
    return () => setDialogController(dialogDefaultController)
  }, [confirm, alert])

  const contextValue = useMemo(() => ({ confirm, alert }), [confirm, alert])

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {dialogState && createPortal(
        <DialogOverlay dialog={dialogState} onResolve={resolveDialog} />,
        document.body
      )}
    </DialogContext.Provider>
  )
}

export const useDialog = () => {
  const ctx = useContext(DialogContext)
  if (!ctx) {
    throw new Error('useDialog must be used within a DialogProvider')
  }
  return ctx
}

const DialogOverlay = ({ dialog, onResolve }) => {
  const variant = VARIANT_STYLES[dialog.variant] || VARIANT_STYLES.info

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onResolve(dialog.type === 'confirm' ? false : undefined)
      }
      if (event.key === 'Enter' && dialog.type === 'alert') {
        event.preventDefault()
        onResolve(undefined)
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [dialog, onResolve])

  const handleBackdropClick = () => {
    if (dialog.allowOutsideClose) {
      onResolve(dialog.type === 'confirm' ? false : undefined)
    }
  }

  const handleCancel = () => onResolve(false)
  const handleConfirm = () => onResolve(dialog.type === 'confirm' ? true : undefined)

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />
      <div className="relative w-full max-w-md animate-fadeIn">
        <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-4 ring-transparent transition-all dark:border-slate-700 dark:bg-slate-900 ${variant.ring}`}>
          <div className={`h-1 w-full ${variant.accent}`} />
          <div className="px-6 py-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-xl ${variant.iconWrap}`}>
                <i className={`fas ${variant.icon}`} aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {dialog.title}
                </h3>
                {dialog.message && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {dialog.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 px-6 pb-6 sm:flex-row sm:justify-end">
            {dialog.type === 'confirm' && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {dialog.cancelText || 'Cancel'}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variant.confirm}`}
            >
              {dialog.confirmText || 'Okay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

DialogOverlay.defaultProps = {
  dialog: null,
  onResolve: noop,
}


