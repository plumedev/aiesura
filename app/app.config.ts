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
        content: 'rounded-md bg-[#DCE8E2] dark:bg-[#0C3C32] sm:rounded-md !ring-0 !border-none shadow-md',
        overlay: 'bg-black/30 backdrop-blur-[2.5px] dark:bg-black/50 backdrop-blur-[2.5px]'
      }
    },
    toast: {
      slots: {
        root: 'rounded-md toast-glass !ring-0 !border-none shadow-lg'
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
        root: 'relative inline-flex items-center',
        base: 'w-full h-9 rounded-md !bg-white/60 dark:!bg-black/25 !text-gray-900 dark:!text-white placeholder:!text-gray-400 dark:placeholder:!text-gray-500 placeholder:!font-normal !border !border-black/10 dark:!border-white/10 hover:!border-black/20 dark:hover:!border-white/20 focus:!border-black/30 dark:focus:!border-white/30 !ring-0 !outline-none !shadow-none !text-sm !leading-5 !font-normal transition-colors',
        leadingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5',
        trailingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5'
      }
    },
    selectMenu: {
      slots: {
        base: 'w-full h-9 rounded-md !bg-white/60 dark:!bg-black/25 !text-gray-900 dark:!text-white !border !border-black/10 dark:!border-white/10 hover:!border-black/20 dark:hover:!border-white/20 focus:!border-black/30 dark:focus:!border-white/30 !ring-0 !outline-none !shadow-none !text-sm !leading-5 !font-normal transition-colors',
        placeholder: '!text-gray-400 dark:!text-gray-500 !font-normal !text-sm',
        value: '!text-gray-900 dark:!text-white !font-normal !text-sm',
        leadingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5',
        trailingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5',
        content: 'rounded-md glass-panel !border !border-black/10 dark:!border-white/10 shadow-lg p-1',
        item: 'rounded-md !text-sm text-gray-900 dark:text-white data-highlighted:bg-black/5 dark:data-highlighted:bg-white/10 cursor-pointer'
      }
    },
    select: {
      slots: {
        root: 'relative inline-flex items-center',
        base: 'w-full h-9 rounded-md !bg-white/60 dark:!bg-black/25 !text-gray-900 dark:!text-white !border !border-black/10 dark:!border-white/10 hover:!border-black/20 dark:hover:!border-white/20 focus:!border-black/30 dark:focus:!border-white/30 !ring-0 !outline-none !shadow-none !text-sm !leading-5 !font-normal transition-colors',
        leadingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5',
        trailingIcon: 'shrink-0 !text-gray-400 dark:!text-gray-500 size-5',
        placeholder: '!text-gray-400 dark:!text-gray-500 !font-normal !text-sm',
        value: '!text-gray-900 dark:!text-white !font-normal !text-sm'
      }
    },
    inputDate: {
      slots: {
        base: 'w-full h-9 rounded-md !bg-white/60 dark:!bg-black/25 !text-gray-900 dark:!text-white !border !border-black/10 dark:!border-white/10 hover:!border-black/20 dark:hover:!border-white/20 focus:!border-black/30 dark:focus:!border-white/30 !ring-0 !outline-none !shadow-none !text-sm !leading-5 !font-normal transition-colors'
      }
    },
    textarea: {
      slots: {
        root: 'relative inline-flex items-center w-full',
        base: 'w-full rounded-md !bg-white/60 dark:!bg-black/25 !text-gray-900 dark:!text-white placeholder:!text-gray-400 dark:placeholder:!text-gray-500 placeholder:!font-normal !border !border-black/10 dark:!border-white/10 hover:!border-black/20 dark:hover:!border-white/20 focus:!border-black/30 dark:focus:!border-white/30 !ring-0 !outline-none !shadow-none !text-sm !leading-5 !font-normal transition-colors'
      }
    },
    calendar: {
      slots: {
        headCell: '!text-gray-500 dark:!text-gray-400 font-medium',
        cellTrigger: [
          'data-selected:!bg-[#0A332C] dark:data-selected:!bg-[#0A332C] data-selected:!text-white dark:data-selected:!text-white',
          'data-highlighted:!bg-[#0A332C]/30 dark:data-highlighted:!bg-[#0A332C]/60 data-highlighted:!text-white',
          'hover:not-data-selected:!bg-[#0A332C] dark:hover:not-data-selected:!bg-[#0A332C] hover:not-data-selected:!text-white dark:hover:not-data-selected:!text-white'
        ]
      }
    },
    tabs: {
      slots: {
        list: '!bg-white/50 dark:!bg-black/20 !border !border-black/10 dark:!border-white/10 !ring-0 !shadow-none'
      }
    }
  }
})
