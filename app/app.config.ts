export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral',
      error: 'error'
    },
    button: {
      slots: {
        base: 'rounded-md cursor-pointer'
      }
    },
    card: {
      slots: {
        root: 'rounded-md glass-panel !ring-0 !border-none !shadow-none',
        header: '!border-none !ring-0 !shadow-none',
        footer: '!border-none !ring-0 !shadow-none'
      }
    },
    modal: {
      slots: {
        content: 'rounded-md glass-panel sm:rounded-md !ring-0 !border-none !shadow-none',
        overlay: 'bg-black/20 dark:bg-black/40'
      }
    },
    toast: {
      slots: {
        root: 'rounded-md glass-panel !ring-0 !border-none shadow-lg'
      }
    },
    dropdownMenu: {
      slots: {
        content: 'rounded-md glass-panel !ring-0 !border-none shadow-lg',
        itemLeadingIcon: 'text-inherit'
      }
    },
    dropdown: {
      slots: {
        content: 'rounded-md glass-panel !ring-0 !border-none shadow-lg',
        itemLeadingIcon: 'text-inherit'
      }
    },
    popover: {
      slots: {
        content: 'rounded-md glass-panel !ring-0 !border-none shadow-lg'
      }
    },
    table: {
      slots: {
        tr: '!border-none',
        th: '!border-none',
        td: '!border-none',
        separator: 'hidden'
      }
    },
    input: {
      slots: {
        base: '!bg-white/50 dark:!bg-black/20 !text-[var(--color-text-main)] !border !border-black/10 dark:!border-white/10 !ring-0 !outline-none !shadow-none',
        root: '!border-none !ring-0 !outline-none !shadow-none'
      }
    },
    selectMenu: {
      slots: {
        base: '!bg-white/50 dark:!bg-black/20 !text-[var(--color-text-main)] !border !border-black/10 dark:!border-white/10 !ring-0 !outline-none !shadow-none',
        content: 'rounded-md glass-panel !ring-0 !border-none shadow-lg'
      }
    },
    select: {
      slots: {
        base: '!bg-white/50 dark:!bg-black/20 !text-[var(--color-text-main)] !border !border-black/10 dark:!border-white/10 !ring-0 !outline-none !shadow-none'
      }
    },
    inputDate: {
      slots: {
        base: '!bg-white/50 dark:!bg-black/20 !text-[var(--color-text-main)] !border !border-black/10 dark:!border-white/10 !ring-0 !outline-none !shadow-none'
      }
    },
    textarea: {
      slots: {
        base: '!bg-white/50 dark:!bg-black/20 !text-[var(--color-text-main)] !border !border-black/10 dark:!border-white/10 !ring-0 !outline-none !shadow-none',
        root: '!border-none !ring-0 !outline-none !shadow-none'
      }
    },
    tabs: {
      slots: {
        list: '!bg-white/50 dark:!bg-black/20 !border !border-black/10 dark:!border-white/10 !ring-0 !shadow-none'
      }
    }
  }
})
