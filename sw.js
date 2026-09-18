const CACHE_NAME = 'defba-cache-v31';
// Список файлов для кэширования (все, что нужно для работы игры)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './music.mp3',
  './music2.mp3',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // Если у тебя есть другие картинки, добавь их сюда
];

// Установка: кэшируем все файлы
self.addEventListener('install', (event) => {
  console.log('[SW] Установка Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Кэширование файлов');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Активируем нового SW сразу, не дожидаясь закрытия вкладок
        return self.skipWaiting();
      })
  );
});

// Активация: удаляем старые кэши
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Берём контроль над всеми открытыми страницами
      return self.clients.claim();
    })
  );
});

// Перехват запросов: стратегия Cache First (сначала кэш)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Если есть в кэше — возвращаем его
        if (cachedResponse) {
          return cachedResponse;
        }
        // Если нет — идём в интернет
        return fetch(event.request);
      })
  );
});
