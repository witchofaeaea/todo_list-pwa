// Tutamaçtan (⠿) sürükleyerek sıralama. Pointer olaylarıyla yazıldı, böylece
// fare, dokunmatik ekran ve kalem aynı kodla çalışır (HTML5 drag&drop dokunmatikte çalışmaz).
//
// Sürükleme sırasında satır DOM'da canlı olarak yer değiştirir; bırakınca yeni sıra
// onDrop(ids) ile bildirilir. İptal olursa onCancel() çağrılır ve liste yeniden çizilir.

export function enableDragReorder(list, { onDrop, onCancel }) {
  let drag = null;

  const currentOrder = () => [...list.children].map(li => li.dataset.id);

  list.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-action="drag"]');
    if (!handle || event.button !== 0) return;

    event.preventDefault(); // metin seçimini ve sayfa kaydırmayı engelle
    handle.setPointerCapture(event.pointerId);

    const item = handle.closest('.todo-item');
    drag = { item, pointerId: event.pointerId, startOrder: currentOrder().join() };
    item.classList.add('dragging');
    list.classList.add('is-dragging');
  });

  list.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;

    // İmlecin altında kalan ilk satırın (orta noktasına göre) önüne yerleştir.
    const others = [...list.children].filter(li => li !== drag.item);
    const before = others.find(li => {
      const rect = li.getBoundingClientRect();
      return event.clientY < rect.top + rect.height / 2;
    });

    if (before) {
      if (drag.item.nextElementSibling !== before) list.insertBefore(drag.item, before);
    } else if (list.lastElementChild !== drag.item) {
      list.appendChild(drag.item);
    }
  });

  function finish(event, cancelled) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.item.classList.remove('dragging');
    list.classList.remove('is-dragging');

    const order = currentOrder();
    const changed = order.join() !== drag.startOrder;
    drag = null;

    if (cancelled) onCancel();
    else if (changed) onDrop(order);
  }

  list.addEventListener('pointerup', event => finish(event, false));
  list.addEventListener('pointercancel', event => finish(event, true));
}
