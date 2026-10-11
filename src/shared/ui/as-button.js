export const asButton = (open) => ({
  tabIndex: 0,
  role: 'button',
  onClick: open,
  onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open() } },
})
