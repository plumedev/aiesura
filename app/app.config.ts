export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral'
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
        content: 'rounded-md glass-panel sm:rounded-md !ring-0 !border-none !shadow-none'
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
        base: '!bg-[var(--color-bg-app)] !text-[var(--color-text-main)] !border !border-black/10 dark:!border-transparent !ring-0 !outline-none !shadow-none',
        root: '!border-none !ring-0 !outline-none !shadow-none'
      }
    }
  }
})
