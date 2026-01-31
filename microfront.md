# Микрофронтенд проект: React + Vue

## Используемый подход: Module Federation

В проекте используется **Module Federation** через `@originjs/vite-plugin-federation`.

```
React-MF (3001)  ──► exposes: ./Counter ──► remoteEntry.js
                                                │
Vue-MF (3002)    ──► exposes: ./Counter ──► remoteEntry.js
                                                │
                                                ▼
Host (3000)      ◄── remotes: { reactMf, vueMf } ◄── загружает в runtime
```

### Признаки Module Federation в проекте:

| Признак | Описание |
|---------|----------|
| `remoteEntry.js` | Точка входа для каждого микрофронтенда |
| `exposes` | Что экспортирует микрофронтенд |
| `remotes` | Откуда host загружает модули |
| `shared` | Общие зависимости (React, Vue) |
| Динамический импорт | `import('reactMf/Counter')` |

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    HOST (порт 3000)                         │
│                   Shell / Контейнер                         │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │                     │    │                     │        │
│  │   React Counter     │    │    Vue Counter      │        │
│  │   (загружен из      │    │   (загружен из      │        │
│  │    порта 3001)      │    │    порта 3002)      │        │
│  │                     │    │                     │        │
│  └─────────────────────┘    └─────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
          ▲                            ▲
          │ remoteEntry.js             │ remoteEntry.js
          │                            │
┌─────────┴─────────┐        ┌─────────┴─────────┐
│   REACT-MF        │        │     VUE-MF        │
│   (порт 3001)     │        │   (порт 3002)     │
│                   │        │                   │
│ exposes:          │        │ exposes:          │
│  ./Counter        │        │  ./Counter        │
└───────────────────┘        └───────────────────┘
```

## Структура проекта

```
microFront/
├── host/              # Shell-контейнер (React)
│   ├── src/
│   │   ├── App.jsx         # Главный компонент
│   │   ├── VueWrapper.jsx  # Мост React → Vue
│   │   └── main.jsx
│   ├── vite.config.js      # Конфиг с remotes
│   └── package.json
│
├── react-mf/          # React микрофронтенд
│   ├── src/
│   │   ├── Counter.jsx     # Экспортируемый компонент
│   │   └── App.jsx
│   ├── vite.config.js      # Конфиг с exposes
│   └── package.json
│
├── vue-mf/            # Vue микрофронтенд
│   ├── src/
│   │   ├── Counter.vue     # Экспортируемый компонент
│   │   └── App.vue
│   ├── vite.config.js      # Конфиг с exposes
│   └── package.json
│
└── package.json       # Корневые скрипты
```

## Ключевые конфигурации

### React микрофронтенд (`react-mf/vite.config.js`)

```js
federation({
  name: 'reactMf',
  filename: 'remoteEntry.js',    // Точка входа для загрузки
  exposes: {
    './Counter': './src/Counter.jsx'  // Что экспортируем
  },
  shared: ['react', 'react-dom']  // Общие зависимости
})
```

### Vue микрофронтенд (`vue-mf/vite.config.js`)

```js
federation({
  name: 'vueMf',
  filename: 'remoteEntry.js',
  exposes: {
    './Counter': './src/Counter.vue'
  },
  shared: ['vue']
})
```

### Host (`host/vite.config.js`)

```js
federation({
  name: 'host',
  remotes: {
    reactMf: 'http://localhost:3001/assets/remoteEntry.js',
    vueMf: 'http://localhost:3002/assets/remoteEntry.js'
  },
  shared: ['react', 'react-dom', 'vue']  // Все общие зависимости
})
```

## Как происходит загрузка

```
1. Пользователь открывает localhost:3000 (Host)
                    │
                    ▼
2. Host рендерит App.jsx
                    │
                    ▼
3. React.lazy(() => import('reactMf/Counter'))
   React.lazy(() => import('./VueWrapper'))
                    │
                    ▼
4. Браузер запрашивает:
   - http://localhost:3001/assets/remoteEntry.js
   - http://localhost:3002/assets/remoteEntry.js
                    │
                    ▼
5. remoteEntry.js возвращает манифест модулей
                    │
                    ▼
6. Браузер загружает нужные чанки (Counter.js)
                    │
                    ▼
7. Компоненты рендерятся в Host
```

## Shared зависимости

```
┌──────────────────────────────────────────────┐
│              Shared Dependencies             │
│  ┌────────┐  ┌───────────┐  ┌─────┐         │
│  │ React  │  │ React-DOM │  │ Vue │         │
│  └────┬───┘  └─────┬─────┘  └──┬──┘         │
│       │            │           │             │
│       ▼            ▼           ▼             │
│   Одна копия используется всеми модулями    │
└──────────────────────────────────────────────┘
```

**Зачем нужны shared зависимости?**

Без `shared` каждый микрофронтенд грузил бы свою копию React/Vue:
- Увеличивает размер бандла
- Ломает реактивность (разные инстансы)
- Конфликты версий

## VueWrapper — мост между React и Vue

```jsx
// host/src/VueWrapper.jsx
import * as Vue from 'vue'

export default function VueCounterWrapper() {
  const containerRef = useRef(null)

  useEffect(() => {
    // 1. Загружаем Vue компонент из микрофронтенда
    import('vueMf/Counter').then((module) => {
      // 2. Создаём Vue приложение
      const app = Vue.createApp(module.default)
      // 3. Монтируем в React DOM-элемент
      app.mount(containerRef.current)
    })
  }, [])

  // React рендерит пустой div, Vue заполняет его
  return <div ref={containerRef} />
}
```

## Принципы микрофронтендов

| Принцип | Реализация в проекте |
|---------|---------------------|
| **Независимый деплой** | Каждый модуль на своём порту, свой `package.json` |
| **Технологическая свобода** | React + Vue работают вместе |
| **Изоляция** | Каждый модуль в своей папке со своим кодом |
| **Runtime интеграция** | Module Federation загружает код в браузере |
| **Shared state** | Можно добавить через events/props |

## Запуск проекта

### Установка зависимостей

```bash
# В корне проекта
cd react-mf && npm install
cd ../vue-mf && npm install
cd ../host && npm install
```

### Сборка (порядок важен!)

```bash
# 1. Сначала собрать микрофронтенды
cd react-mf && npm run build
cd ../vue-mf && npm run build

# 2. Потом собрать host
cd ../host && npm run build
```

### Запуск серверов

```bash
# Терминал 1 - React микрофронтенд
cd react-mf && npm run preview

# Терминал 2 - Vue микрофронтенд
cd vue-mf && npm run preview

# Терминал 3 - Host
cd host && npm run preview
```

### URL адреса

| Приложение | URL | Описание |
|------------|-----|----------|
| Host | http://localhost:3000 | Главное приложение |
| React MF | http://localhost:3001 | React отдельно |
| Vue MF | http://localhost:3002 | Vue отдельно |

## Module Federation vs другие подходы

| Подход | Плюсы | Минусы |
|--------|-------|--------|
| **Module Federation** | Runtime загрузка, shared deps, нативная интеграция | Сложная настройка |
| **iframe** | Полная изоляция, простота | Нет shared state, проблемы с UX |
| **Web Components** | Стандарт браузера | Ограниченная поддержка фреймворков |
| **Build-time** | Простота | Нет независимого деплоя |

## Добавление нового микрофронтенда

1. Создать папку с новым приложением
2. Настроить `vite.config.js` с `exposes`
3. Добавить remote в `host/vite.config.js`
4. Создать wrapper если нужен (для не-React фреймворков)
5. Пересобрать и перезапустить

## Коммуникация между микрофронтендами

### Проблема

При переключении вкладок данные (счётчики) сбрасываются, потому что компоненты **размонтируются**:

```jsx
{(activeTab === 'all' || activeTab === 'react') && (
  <ReactCounter />
)}
```

Когда `activeTab` меняется — компонент удаляется из DOM и создаётся заново с начальным состоянием.

### Способы коммуникации

#### 1. Custom Events (Browser API)

```js
// React отправляет
window.dispatchEvent(new CustomEvent('counter:change', { detail: { count: 5 } }))

// Vue слушает
window.addEventListener('counter:change', (e) => {
  console.log(e.detail.count) // 5
})
```

**Плюсы:** Просто, нативно, без зависимостей
**Минусы:** Нет типизации, сложно отслеживать

#### 2. Shared State в Window

```js
// Общее хранилище
window.__SHARED_STATE__ = { count: 0 }

// React меняет
window.__SHARED_STATE__.count = 5

// Vue читает
const count = window.__SHARED_STATE__.count
```

**Плюсы:** Очень просто
**Минусы:** Нет реактивности, нужно вручную обновлять UI

#### 3. Props через Host

```
Host (хранит state)
  ├── ReactCounter (получает count, onChange)
  └── VueCounter (получает count, onChange)
```

```jsx
// Host
const [count, setCount] = useState(0)
<ReactCounter count={count} onChange={setCount} />
<VueCounter count={count} onChange={setCount} />
```

**Плюсы:** Чистая архитектура, React-way
**Минусы:** Тесная связь с Host

#### 4. Event Bus (Pub/Sub)

```js
// shared/eventBus.js
const listeners = {}

export const emit = (event, data) => {
  listeners[event]?.forEach(fn => fn(data))
}

export const on = (event, fn) => {
  listeners[event] = listeners[event] || []
  listeners[event].push(fn)
}
```

```js
// React
emit('counter:update', 5)

// Vue
on('counter:update', (count) => { ... })
```

**Плюсы:** Слабая связанность
**Минусы:** Сложнее дебажить

#### 5. localStorage + Storage Event

```js
// React пишет
localStorage.setItem('count', '5')

// Vue слушает изменения
window.addEventListener('storage', (e) => {
  if (e.key === 'count') {
    console.log(e.newValue) // '5'
  }
})
```

**Плюсы:** Персистентность, работает между вкладками
**Минусы:** Только строки, не работает в одной вкладке

#### 6. URL / Query Params

```
http://localhost:3000?count=5
```

**Плюсы:** Shareable, bookmarkable
**Минусы:** Только для простых данных

### Сравнение способов

| Способ | Сложность | Реактивность | Изоляция |
|--------|-----------|--------------|----------|
| Custom Events | Низкая | Нет | Высокая |
| Window object | Низкая | Нет | Низкая |
| Props через Host | Средняя | Да | Средняя |
| Event Bus | Средняя | Нет | Высокая |
| localStorage | Низкая | Частичная | Высокая |
| URL params | Низкая | Нет | Высокая |

Самый популярный подход — **Custom Events** или **Event Bus** для слабой связанности между микрофронтендами.

## Полезные ссылки

- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Micro Frontends](https://micro-frontends.org/)
