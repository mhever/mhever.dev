export function parseMarkdown(text: string): string {
  // Escape HTML to prevent injection
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold and italic
  s = s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Consecutive "- …" lines → <ul><li>…</li></ul>
  s = s.replace(/((?:(?:^|\n)- .+)+)/g, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  })

  // Remaining newlines → <br>
  s = s.replace(/\n/g, '<br>')

  return s
}
