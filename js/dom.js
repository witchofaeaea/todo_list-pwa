// Küçük DOM oluşturma yardımcısı:
//   h('button', { class: 'x', 'data-testid': 'y', disabled: true }, 'Metin')
// Nitelikler setAttribute ile yazılır; true → boş nitelik, false/null → yazılmaz.
// Çocuklar metin ya da düğüm olabilir; metinler her zaman güvenli metin düğümü olarak eklenir.

export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (name === 'class') node.className = value;
    else node.setAttribute(name, value === true ? '' : String(value));
  }
  node.append(...children.flat().filter(child => child != null && child !== false));
  return node;
}
