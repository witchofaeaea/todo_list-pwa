// Giriş noktası: listenin dışındaki kontrolleri (ekleme formu, arama, filtreler,
// alt çubuk) bağlar ve görünümü duruma abone eder.

/*
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ GELİŞTİRME NOTLARI — yeni kod eklerken                                     │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │ 1. Yeni bir js/ ya da css/ dosyası eklediysen:                             │
 * │    - sw.js içindeki ASSETS listesine ekle, yoksa uygulama çevrimdışıyken   │
 * │      o dosya yüklenmez ve sayfa bozulur.                                  │
 * │    - CSS ise index.html'e <link rel="stylesheet"> olarak da ekle.          │
 * │                                                                            │
 * │ 2. Herhangi bir dosyayı değiştirip yayınlamadan önce sw.js içindeki        │
 * │    CACHE_NAME sürümünü artır (v2 → v3), böylece telefonlar yenisini alır.  │
 * │                                                                            │
 * │ 3. Göreve yeni bir alan eklersen (ör. etiketler, notlar):                  │
 * │    todo-model.js içindeki normalizeTodo()'ya varsayılan değeriyle ekle.    │
 * │    Telefonda eski formatta kayıtlı görevler bu sayede bozulmadan yüklenir. │
 * │                                                                            │
 * │ 4. Görevleri değiştiren her işlem store.js'teki fonksiyonlardan geçmeli;   │
 * │    DOM'u elle değiştirme. Liste her değişiklikte baştan çizildiği için     │
 * │    satırlara dinleyici ekleme; list-controller.js'te data-action ile yakala.│
 * │                                                                            │
 * │ 5. Yeni etkileşimli öğelere (düğme, alan) data-testid ver; Playwright      │
 * │    testleri bu adlarla öğe buluyor. Var olan adları değiştirme.            │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

import * as store from './store.js';
import { render } from './view.js';
import { visibleTodos, doneIds } from './selectors.js';
import { initListController } from './list-controller.js';
import { removeWithUndo } from './actions.js';
import { initToast } from './toast.js';
import { initPwa } from './pwa.js';
import { DEFAULT_PRIORITY } from './todo-model.js';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const dueInput = document.getElementById('todo-due');
const prioritySelect = document.getElementById('todo-priority');
const formError = document.getElementById('form-error');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter');
const toggleAll = document.getElementById('toggle-all');
const clearDone = document.getElementById('clear-done');
const list = document.getElementById('todo-list');

function showError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

// --- Yeni görev formu ---

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showError('Görev boş olamaz.');
    input.focus();
    return;
  }
  showError('');
  store.addTodo({
    text,
    due: dueInput.value || null,
    priority: prioritySelect.value
  });
  input.value = '';
  dueInput.value = '';
  prioritySelect.value = DEFAULT_PRIORITY;
  input.focus();
});

input.addEventListener('input', () => {
  if (!formError.hidden) showError('');
});

// --- Arama ve filtreler ---

searchInput.addEventListener('input', () => store.setQuery(searchInput.value));

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => store.setFilter(btn.dataset.filter));
});

// --- Alt çubuk ---

// Görünen (filtre + aramaya uyan) görevlerin hepsini tamamla / geri al
toggleAll.addEventListener('click', () => {
  const visible = visibleTodos(store.getState());
  const allDone = visible.every(t => t.done);
  store.setDone(visible.map(t => t.id), !allDone);
});

clearDone.addEventListener('click', () => {
  const ids = doneIds(store.getState());
  removeWithUndo(ids, ids.length === 1 ? 'Görev silindi' : `${ids.length} görev silindi`);
});

// --- Başlat ---

initListController(list);
initToast();
initPwa();

store.subscribe(render);
render(store.getState());

// Uygulama ertesi gün tekrar açıldığında "Bugün/Gecikti" etiketleri güncellensin
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') store.refresh();
});
