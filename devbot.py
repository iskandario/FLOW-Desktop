#!/usr/bin/env python3
"""devbot — веб-разработчик за компом, пока вас нет.

После IDLE_SEC секунд простоя начинает рабочую сессию:
  * гуглит на русском («как отменить fetch запрос js»…) — печатает запрос
    в поле Google, листает выдачу, «переходит» на learn.javascript.ru, doka.guide,
    MDN, react.dev и т.п., читает, иногда возвращается к выдаче за вторым результатом;
    вкладки открываются в основном окне Arc (не в Little Arc);
  * открывает DevTools (⌥⌘I), смотрит, закрывает;
  * переключается между вкладками (⌃Tab);
  * пишет React/TypeScript-код в VS Code — посимвольно, с живым темпом,
    опечатками, паузами «на подумать», сохраняет файлы;
  * прыгает по файлам проекта через ⌘P и пересматривает код.

Как только вы двигаете мышь, кликаете или жмёте клавишу — сессия мгновенно
прекращается. Только стандартная библиотека Python, без зависимостей.

Запуск:   python3 devbot.py          (проверка сразу: python3 devbot.py --now)
Настройки (переменные окружения):
  IDLE_SEC=30  BROWSER=Arc  PROJECT=~/Projects/storefront-web
"""

import ctypes
import ctypes.util
import json
import math
import os
import random
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path

IDLE_SEC = float(os.environ.get("IDLE_SEC", 30))
MOUSE_STOP_PX = float(os.environ.get("MOUSE_STOP_PX", 150))  # на сколько надо сдвинуть мышь, чтобы остановить
BROWSER = os.environ.get("BROWSER", "Arc")
EDITOR = "Visual Studio Code"
EDITOR_PROCESS = "Code"
EDITOR_NAMES = {"Code", "Visual Studio Code"}
PROJECT = Path(os.environ.get("PROJECT", "~/Projects/storefront-web")).expanduser()

SEARCH_URL = os.environ.get("SEARCH_URL", "https://www.google.com/search?q=")

# Что «гуглит» разработчик и куда потом переходит из выдачи.
TOPICS = [
    ("react useEffect вызывается два раза",
     ["https://ru.react.dev/reference/react/useEffect",
      "https://ru.react.dev/learn/synchronizing-with-effects"]),
    ("как отменить fetch запрос js",
     ["https://learn.javascript.ru/fetch-abort",
      "https://developer.mozilla.org/ru/docs/Web/API/AbortController"]),
    ("tailwind обрезать текст в две строки",
     ["https://tailwindcss.com/docs/line-clamp"]),
    ("css grid auto-fill и auto-fit разница",
     ["https://doka.guide/css/grid-guide/",
      "https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/"]),
    ("typescript generic extends keyof пример",
     ["https://www.typescriptlang.org/docs/handbook/2/generics.html",
      "https://www.typescriptlang.org/docs/handbook/2/keyof-types.html"]),
    ("next js app router редирект на сервере",
     ["https://nextjs.org/docs/app/api-reference/functions/redirect"]),
    ("vite переменные окружения undefined",
     ["https://vite.dev/guide/env-and-mode"]),
    ("vitest как замокать fetch",
     ["https://vitest.dev/guide/mocking"]),
    ("Intl.NumberFormat рубли без копеек",
     ["https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat",
      "https://learn.javascript.ru/intl"]),
    ("debounce хук react typescript",
     ["https://learn.javascript.ru/task/debounce",
      "https://habr.com/ru/search/?q=debounce%20react"]),
    ("position sticky не работает",
     ["https://doka.guide/css/position/",
      "https://developer.mozilla.org/ru/docs/Web/CSS/position"]),
    ("flex элемент вылезает за контейнер min-width 0",
     ["https://doka.guide/css/flexbox-guide/",
      "https://css-tricks.com/flexbox-truncated-text/"]),
    ("cors ошибка fetch localhost",
     ["https://developer.mozilla.org/ru/docs/Web/HTTP/CORS",
      "https://learn.javascript.ru/fetch-crossorigin"]),
    ("useMemo когда использовать",
     ["https://ru.react.dev/reference/react/useMemo"]),
    ("git отменить последний коммит сохранить изменения",
     ["https://stackoverflow.com/questions/927358/how-do-i-undo-the-most-recent-local-commits-in-git"]),
    ("npm ERESOLVE unable to resolve dependency tree",
     ["https://stackoverflow.com/questions/64573177/unable-to-resolve-dependency-tree-error-when-installing-npm-packages"]),
    ("container queries css пример",
     ["https://developer.mozilla.org/ru/docs/Web/CSS/CSS_containment/Container_queries",
      "https://caniuse.com/css-container-queries"]),
    ("promise all или allsettled разница",
     ["https://learn.javascript.ru/promise-api"]),
    ("react hook form zod валидация",
     ["https://react-hook-form.com/get-started"]),
    ("next image lcp как ускорить",
     ["https://web.dev/articles/lcp",
      "https://nextjs.org/docs/app/api-reference/components/image"]),
    ("замыкания js простыми словами",
     ["https://learn.javascript.ru/closure"]),
    ("event loop микрозадачи макрозадачи",
     ["https://learn.javascript.ru/event-loop"]),
]

# Файлы проекта и код, который в них «пишется» — по порядку, кусками.
FILES = [
    ("src/hooks/useDebounce.ts",
     'import { useEffect, useState } from "react";\n',
     ['''
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
''']),
    ("src/lib/api.ts",
     'import type { Product } from "../types";\n',
     ['''
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
''', '''
export async function fetchJson<T>(path: string, init: RequestInit = {}, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: init.signal ?? controller.signal,
    });
    if (!res.ok) {
      throw new ApiError(res.status, await res.text());
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
''', '''
export function getProducts(query = "", page = 1) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  return fetchJson<{ items: Product[]; total: number }>(`/products?${params}`);
}
''']),
    ("src/lib/format.ts",
     "",
     ['''
const priceFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(amount: number, currency = "USD", locale = "en-US"): string {
  const key = `${locale}:${currency}`;
  let formatter = priceFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
    priceFormatters.set(key, formatter);
  }
  return formatter.format(amount / 100);
}
''', '''
export function formatRelative(date: Date, now = new Date()): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffDays = Math.round((date.getTime() - now.getTime()) / 86_400_000);
  if (Math.abs(diffDays) < 1) return "today";
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  return rtf.format(Math.round(diffDays / 30), "month");
}
''']),
    ("src/components/ProductCard.tsx",
     'import type { Product } from "../types";\nimport { formatPrice } from "../lib/format";\n',
     ['''
type ProductCardProps = {
  product: Product;
  onAddToCart: (id: string) => void;
};
''', '''
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const price = formatPrice(product.price, product.currency);

  return (
    <article className="rounded-xl border border-zinc-200 p-4 shadow-sm transition hover:shadow-md">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="aspect-square w-full rounded-lg object-cover"
        loading="lazy"
      />
      <h3 className="mt-3 line-clamp-2 text-sm font-medium">{product.title}</h3>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-semibold">{price}</span>
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
''']),
    ("src/components/SearchBar.tsx",
     'import { useEffect, useState } from "react";\nimport { useDebounce } from "../hooks/useDebounce";\n',
     ['''
type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export function SearchBar({ onSearch, placeholder = "Search products" }: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounced = useDebounce(value.trim(), 350);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <label className="relative block w-full max-w-md">
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-900 focus:outline-none"
      />
    </label>
  );
}
''']),
    ("src/hooks/useProducts.ts",
     'import { useEffect, useState } from "react";\nimport { getProducts } from "../lib/api";\nimport type { Product } from "../types";\n',
     ['''
type State =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; items: Product[]; total: number };

export function useProducts(query: string, page: number): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getProducts(query, page)
      .then(({ items, total }) => {
        if (!cancelled) setState({ status: "success", items, total });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ status: "error", error });
      });
    return () => {
      cancelled = true;
    };
  }, [query, page]);

  return state;
}
''']),
    ("src/styles/catalog.css",
     "/* Catalog page layout */\n",
     ['''
.catalog {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  container-type: inline-size;
}

.catalog__empty {
  grid-column: 1 / -1;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--color-muted);
}
''', '''
@container (max-width: 480px) {
  .catalog {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

.skeleton {
  border-radius: 0.75rem;
  background: linear-gradient(90deg, #f4f4f5 25%, #e4e4e7 50%, #f4f4f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}
''']),
    ("src/lib/format.test.ts",
     'import { describe, expect, it } from "vitest";\nimport { formatPrice, formatRelative } from "./format";\n',
     ['''
describe("formatPrice", () => {
  it("formats cents as dollars", () => {
    expect(formatPrice(1999)).toBe("$19.99");
  });

  it("supports other currencies", () => {
    expect(formatPrice(5000, "EUR", "de-DE")).toBe("50,00 €");
  });
});
''', '''
describe("formatRelative", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  it("returns today for the same day", () => {
    expect(formatRelative(new Date("2026-01-15T08:00:00Z"), now)).toBe("today");
  });

  it("returns days for recent dates", () => {
    expect(formatRelative(new Date("2026-01-12T12:00:00Z"), now)).toBe("3 days ago");
  });
});
''']),
]

PROJECT_SCAFFOLD = {
    "package.json": json.dumps({
        "name": "storefront-web", "private": True, "version": "0.4.2", "type": "module",
        "scripts": {"dev": "vite", "build": "tsc -b && vite build", "test": "vitest"},
        "dependencies": {"react": "^19.0.0", "react-dom": "^19.0.0"},
        "devDependencies": {"typescript": "^5.6.0", "vite": "^6.0.0", "vitest": "^2.1.0",
                            "tailwindcss": "^4.0.0", "@vitejs/plugin-react": "^4.3.0"},
    }, indent=2) + "\n",
    "tsconfig.json": json.dumps({"compilerOptions": {
        "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
        "jsx": "react-jsx", "strict": True, "skipLibCheck": True}, "include": ["src"]},
        indent=2) + "\n",
    "README.md": "# storefront-web\n\nCatalog and cart UI for the storefront.\n\n```bash\nnpm run dev\n```\n",
    "src/types.ts": ("export type Product = {\n  id: string;\n  title: string;\n  price: number;\n"
                     "  currency: string;\n  imageUrl: string;\n};\n"),
}

# Настройки воркспейса: без автоскобок, автотегов и автоотступов, иначе код поедет.
VSCODE_SETTINGS = """{
  "editor.autoClosingBrackets": "never",
  "editor.autoClosingQuotes": "never",
  "editor.autoClosingOvertype": "never",
  "editor.autoSurround": "never",
  "editor.autoIndent": "none",
  "editor.formatOnType": false,
  "editor.formatOnSave": false,
  "editor.linkedEditing": false,
  "editor.quickSuggestions": {"other": false, "comments": false, "strings": false},
  "editor.suggestOnTriggerCharacters": false,
  "editor.acceptSuggestionOnEnter": "off",
  "editor.wordBasedSuggestions": "off",
  "editor.parameterHints.enabled": false,
  "editor.inlineSuggest.enabled": false,
  "html.autoClosingTags": false,
  "javascript.autoClosingTags": false,
  "typescript.autoClosingTags": false,
  "emmet.showExpandedAbbreviation": "never",
  "github.copilot.enable": {"*": false},
  "files.autoSave": "off"
}
"""

QWERTY_NEIGHBORS = {
    "a": "sqw", "b": "vnh", "c": "xvd", "d": "sfe", "e": "wrd", "f": "dgr",
    "g": "fht", "h": "gjy", "i": "uok", "j": "hku", "k": "jli", "l": "ko",
    "m": "nj", "n": "bmh", "o": "ipl", "p": "o", "q": "wa", "r": "eft",
    "s": "adw", "t": "rgy", "u": "yij", "v": "cbf", "w": "qes", "x": "zcs",
    "y": "tuh", "z": "xa",
    # ЙЦУКЕН — опечатки в русских запросах
    "й": "цф", "ц": "йуы", "у": "цкв", "к": "уеа", "е": "кнп", "н": "егр",
    "г": "ншо", "ш": "гщл", "щ": "шзд", "з": "щхж", "ф": "йыя", "ы": "фвц",
    "в": "ыау", "а": "впк", "п": "аре", "р": "пон", "о": "рлг", "л": "одш",
    "д": "лжщ", "ж": "дэз", "я": "чф", "ч": "яси", "с": "чмв", "м": "сиа",
    "и": "мтп", "т": "иьр", "ь": "тбо", "б": "ьюл",
}

# ---------------------------------------------------------------- CoreGraphics

cg = ctypes.CDLL(ctypes.util.find_library("CoreGraphics"))
cf = ctypes.CDLL(ctypes.util.find_library("CoreFoundation"))


class CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]


class CGSize(ctypes.Structure):
    _fields_ = [("w", ctypes.c_double), ("h", ctypes.c_double)]


class CGRect(ctypes.Structure):
    _fields_ = [("origin", CGPoint), ("size", CGSize)]


def _sig(fn, restype, *argtypes):
    fn.restype, fn.argtypes = restype, list(argtypes)


vp = ctypes.c_void_p
_sig(cg.CGEventCreate, vp, vp)
_sig(cg.CGEventGetLocation, CGPoint, vp)
_sig(cg.CGEventCreateMouseEvent, vp, vp, ctypes.c_uint32, CGPoint, ctypes.c_uint32)
_sig(cg.CGEventCreateScrollWheelEvent2, vp, vp, ctypes.c_uint32, ctypes.c_uint32,
     ctypes.c_int32, ctypes.c_int32, ctypes.c_int32)
_sig(cg.CGEventCreateKeyboardEvent, vp, vp, ctypes.c_uint16, ctypes.c_bool)
_sig(cg.CGEventKeyboardSetUnicodeString, None, vp, ctypes.c_ulong, ctypes.POINTER(ctypes.c_uint16))
_sig(cg.CGEventSetFlags, None, vp, ctypes.c_uint64)
_sig(cg.CGEventPost, None, ctypes.c_uint32, vp)
_sig(cg.CGEventSourceSecondsSinceLastEventType, ctypes.c_double, ctypes.c_int32, ctypes.c_uint32)
_sig(cg.CGMainDisplayID, ctypes.c_uint32)
_sig(cg.CGDisplayBounds, CGRect, ctypes.c_uint32)
_sig(cf.CFRelease, None, vp)
_sig(cg.CGSessionCopyCurrentDictionary, vp)
_sig(cf.CFStringCreateWithCString, vp, vp, ctypes.c_char_p, ctypes.c_uint32)
_sig(cf.CFDictionaryGetValue, vp, vp, vp)
_sig(cf.CFBooleanGetValue, ctypes.c_bool, vp)

HID_STATE = 1
ANY_EVENT = 0xFFFFFFFF
EV_MOUSE_MOVED, EV_LEFT_DOWN, EV_RIGHT_DOWN, EV_KEY_DOWN = 5, 1, 3, 10
CMD, OPT, CTRL, SHIFT = 0x100000, 0x80000, 0x40000, 0x20000
KEY_RETURN, KEY_DELETE, KEY_ESC, KEY_TAB = 36, 51, 53, 48
KEY_DOWN, KEY_UP = 125, 126
KEY_S, KEY_W, KEY_T, KEY_I, KEY_P = 1, 13, 17, 34, 35


def _post(event):
    cg.CGEventPost(0, event)
    cf.CFRelease(event)


def mouse_pos():
    e = cg.CGEventCreate(None)
    p = cg.CGEventGetLocation(e)
    cf.CFRelease(e)
    return p.x, p.y


def seconds_since(event_type=ANY_EVENT):
    return cg.CGEventSourceSecondsSinceLastEventType(HID_STATE, event_type)


def screen():
    r = cg.CGDisplayBounds(cg.CGMainDisplayID())
    return r.size.w, r.size.h


def front_app():
    out = subprocess.run("lsappinfo info -only name \"$(lsappinfo front)\"",
                         shell=True, capture_output=True, text=True).stdout
    return out.split("=", 1)[-1].strip().strip('"')


def window_rect(process):
    """Позиция и размер переднего окна приложения: (x, y, w, h) или None."""
    script = (f'tell application "System Events" to tell process "{process}" '
              'to get {position, size} of front window')
    out = subprocess.run(["osascript", "-e", script], capture_output=True, text=True).stdout
    try:
        x, y, w, h = (float(v) for v in out.replace(" ", "").split(","))
        return x, y, w, h
    except ValueError:
        return None


def on_screen():
    """Наша ли сессия сейчас на экране (при нескольких залогиненных пользователях)."""
    info = cg.CGSessionCopyCurrentDictionary()
    if not info:
        return False
    key = cf.CFStringCreateWithCString(None, b"kCGSSessionOnConsoleKey", 0x08000100)
    value = cf.CFDictionaryGetValue(info, key)
    result = bool(value) and bool(cf.CFBooleanGetValue(value))
    cf.CFRelease(key)
    cf.CFRelease(info)
    return result


def log(msg):
    print(time.strftime("[%H:%M:%S]"), msg, flush=True)


# ---------------------------------------------------------------- бот

class UserReturned(Exception):
    pass


class Skip(Exception):
    """Не удалось выполнить занятие (окно не вышло вперёд) — берём другое."""


class Bot:
    def __init__(self):
        self.w, self.h = screen()
        self.last_pos = mouse_pos()
        self.last_key_t = 0.0
        self.session_t = 0.0
        self.tabs_open = 0

    # --- контроль: вернулся ли человек

    def check(self):
        # Наши события мыши доходят до системы с задержкой — если позиция ещё не
        # совпала, ждём и перепроверяем, прежде чем решить, что двигали вы.
        # Мелкие сдвиги (ладонь на трекпаде, случайное касание) — не повод
        # останавливаться: просто принимаем новую позицию курсора.
        for wait in (0.08, 0.15, 0):
            x, y = mouse_pos()
            moved = math.hypot(x - self.last_pos[0], y - self.last_pos[1])
            if moved <= 20:
                break
            if not wait:
                if moved < MOUSE_STOP_PX:
                    log(f"курсор сдвинулся на {moved:.0f} px — продолжаю")
                    self.last_pos = (x, y)
                    break
                raise UserReturned(f"мышь сдвинули на {moved:.0f} px")
            time.sleep(wait)
        now = time.monotonic()
        if seconds_since(EV_KEY_DOWN) + 0.4 < now - max(self.last_key_t, self.session_t):
            raise UserReturned("клавиатура")

    def check_screen(self):
        if not on_screen():
            raise UserReturned("на экране другой пользователь")

    def sleep(self, lo, hi=None):
        end = time.monotonic() + (random.uniform(lo, hi) if hi else lo)
        while time.monotonic() < end:
            self.check()
            time.sleep(min(0.15, max(0, end - time.monotonic())))

    def activate(self, app, names):
        """Выводит приложение вперёд и ждёт, пока оно станет активным."""
        for _ in range(3):
            subprocess.run(["osascript", "-e", f'tell application "{app}" to activate'],
                           capture_output=True)
            for _ in range(10):
                self.sleep(0.3)
                if front_app() in names:
                    return
        raise Skip(f"{app} не вышел на передний план")

    def ensure_front(self, names):
        if front_app() not in names:
            raise Skip("активное окно сменилось")

    # --- мышь

    def _move(self, x, y):
        x = max(2, min(self.w - 2, x))
        y = max(2, min(self.h - 2, y))
        _post(cg.CGEventCreateMouseEvent(None, EV_MOUSE_MOVED, CGPoint(x, y), 0))
        self.last_pos = (x, y)

    def glide(self, x, y):
        """Перемещение по кривой Безье с разгоном/торможением и дрожанием."""
        self.check()
        x0, y0 = self.last_pos
        dist = math.hypot(x - x0, y - y0)
        if dist < 2:
            return
        bend = random.uniform(-0.25, 0.25) * dist
        nx, ny = -(y - y0) / dist, (x - x0) / dist
        cx, cy = (x0 + x) / 2 + nx * bend, (y0 + y) / 2 + ny * bend
        steps = max(10, int(dist / random.uniform(9, 16)))
        for i in range(1, steps + 1):
            t = i / steps
            t = t * t * (3 - 2 * t)
            px = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x
            py = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y
            jitter = 0.6 if i < steps else 0
            self._move(px + random.uniform(-jitter, jitter), py + random.uniform(-jitter, jitter))
            time.sleep(random.uniform(0.006, 0.016))
        if random.random() < 0.3:  # небольшой «перелёт» и поправка
            self._move(x + random.uniform(-3, 3), y + random.uniform(-3, 3))
            time.sleep(0.05)
            self._move(x, y)

    def glide_into_window(self, process):
        """Курсор — в случайную точку внутри окна приложения (над контентом)."""
        rect = window_rect(process)
        if rect:
            x, y, w, h = rect
            self.glide(x + w * random.uniform(0.35, 0.75), y + h * random.uniform(0.35, 0.7))
        else:
            self.glide(random.uniform(0.3, 0.7) * self.w, random.uniform(0.3, 0.7) * self.h)

    def drift(self):
        """Мышь лениво сдвигается, как при чтении."""
        x, y = self.last_pos
        self.glide(x + random.uniform(-120, 120), y + random.uniform(-60, 60))

    # --- скролл

    def scroll(self, pixels):
        """Скролл колёсиком: >0 — вниз, <0 — вверх (≈40 px на щелчок)."""
        self.check()
        direction = -1 if pixels > 0 else 1
        ticks = max(1, round(abs(pixels) / 40))
        while ticks > 0:
            step = min(ticks, random.choice([1, 1, 2]))
            _post(cg.CGEventCreateScrollWheelEvent2(None, 1, 1, direction * step, 0, 0))
            ticks -= step
            time.sleep(random.uniform(0.03, 0.09))
        self.check()

    def read(self, names, chunks=(4, 11)):
        """Читает текущую страницу/файл: скролл порциями, паузы, мышь гуляет."""
        for _ in range(random.randint(*chunks)):
            self.check_screen()
            self.ensure_front(names)
            if random.random() < 0.15:
                self.scroll(-random.randint(120, 400))
            else:
                self.scroll(random.randint(180, 650))
            for _ in range(random.randint(1, 3)):
                self.sleep(1.5, 5)
                if random.random() < 0.5:
                    self.drift()

    # --- клавиатура

    def key(self, code, flags=0):
        for down in (True, False):
            e = cg.CGEventCreateKeyboardEvent(None, code, down)
            if flags:
                cg.CGEventSetFlags(e, flags)
            _post(e)
            time.sleep(random.uniform(0.02, 0.05))
        self.last_key_t = time.monotonic()

    def char(self, ch):
        if ch == "\n":
            return self.key(KEY_RETURN)
        units = ch.encode("utf-16-le")
        buf = (ctypes.c_uint16 * (len(units) // 2)).from_buffer_copy(units)
        for down in (True, False):
            e = cg.CGEventCreateKeyboardEvent(None, 0, down)
            cg.CGEventKeyboardSetUnicodeString(e, len(buf), buf)
            _post(e)
            time.sleep(random.uniform(0.015, 0.04))
        self.last_key_t = time.monotonic()

    def type_line(self, line, wpm, typos=0.025):
        base = 60 / (wpm * 5)
        for i, ch in enumerate(line):
            self.check()
            low = ch.lower()
            if low in QWERTY_NEIGHBORS and random.random() < typos:
                self.char(random.choice(QWERTY_NEIGHBORS[low]))
                time.sleep(random.uniform(0.15, 0.5))
                self.key(KEY_DELETE)
                time.sleep(random.uniform(0.08, 0.2))
            self.char(ch)
            delay = random.gauss(base, base * 0.35)
            if ch in " ([{,.:=<>" or (i and line[i - 1] == " "):
                delay *= random.uniform(1.1, 1.8)
            time.sleep(max(0.03, delay))

    # --- браузер (Arc управляется через AppleScript — вкладки в основном окне,
    #     а не в Little Arc, куда Arc отправляет ссылки из других программ)

    def arc(self, script):
        r = subprocess.run(["osascript", "-e", f'tell application "{BROWSER}"\n{script}\nend tell'],
                           capture_output=True, text=True)
        return r.stdout.strip()

    def focus_browser(self):
        """Arc вперёд, поверх — самое большое (основное) окно."""
        self.drift()  # пока AppleScript думает, мышь не стоит как вкопанная
        if self.arc("count windows") in ("", "0"):
            self.arc("make new window")
            self.sleep(1, 1.5)
        subprocess.run(["osascript", "-e", f'''
tell application "System Events" to tell process "{BROWSER}"
  set best to missing value
  set bestArea to 0
  repeat with w in windows
    set {{ww, hh}} to size of w
    if ww * hh > bestArea then
      set bestArea to ww * hh
      set best to w
    end if
  end repeat
  if best is not missing value then perform action "AXRaise" of best
end tell'''], capture_output=True)
        self.activate(BROWSER, {BROWSER})

    def wait_loaded(self, limit=10):
        end = time.monotonic() + limit
        self.sleep(0.8)
        while time.monotonic() < end and self.arc("loading of active tab of front window") == "true":
            self.sleep(0.4)
        self.sleep(0.5, 1.2)

    def new_tab(self, url):
        self.arc(f'tell front window to make new tab with properties {{URL:"{url}"}}')
        self.wait_loaded()

    def go_to(self, url):
        """Переход по ссылке в текущей вкладке — как клик по результату."""
        self.arc(f'set URL of active tab of front window to "{url}"')
        self.wait_loaded()

    def search(self):
        query, urls = random.choice(TOPICS)
        log(f"ищу «{query}»")
        self.focus_browser()
        self.new_tab(SEARCH_URL + urllib.parse.quote_plus(query))
        self.glide_into_window(BROWSER)
        log("смотрю выдачу")
        self.read({BROWSER}, chunks=(1, 3))
        for n, url in enumerate(random.sample(urls, len(urls))):
            if n:
                if random.random() < 0.5:
                    break
                log("назад к выдаче")
                self.arc("tell active tab of front window to go back")
                self.wait_loaded()
                self.read({BROWSER}, chunks=(1, 2))
            self.glide_into_window(BROWSER)  # «навёл и кликнул»
            log(f"читаю {url}")
            self.go_to(url)
            self.read({BROWSER}, chunks=(5, 12))
        if random.random() < 0.6:  # закрываем свою вкладку, чтобы не копились
            self.ensure_front({BROWSER})
            self.key(KEY_W, CMD)

    def devtools(self):
        log("смотрю DevTools")
        self.focus_browser()
        self.key(KEY_I, CMD | OPT)
        self.sleep(1.5, 3)
        self.glide_into_window(BROWSER)
        for _ in range(random.randint(2, 4)):
            self.ensure_front({BROWSER})
            self.drift()
            self.scroll(random.choice([-1, 1]) * random.randint(80, 300))
            self.sleep(2, 5)
        self.ensure_front({BROWSER})
        self.key(KEY_I, CMD | OPT)

    def switch_tab(self):
        log("переключаю вкладку")
        self.focus_browser()
        self.key(KEY_TAB, CTRL | (SHIFT if random.random() < 0.3 else 0))
        self.sleep(1, 2)
        self.glide_into_window(BROWSER)
        self.read({BROWSER}, chunks=(2, 6))

    # --- редактор

    def progress(self):
        state = PROJECT / ".devbot-state.json"
        try:
            return json.loads(state.read_text())
        except (OSError, ValueError):
            return {"file": 0, "part": 0}

    def save_progress(self, p):
        (PROJECT / ".devbot-state.json").write_text(json.dumps(p))

    def open_editor(self, path):
        subprocess.run(["open", "-a", EDITOR, str(PROJECT)])
        self.sleep(1, 2)
        subprocess.run(["open", "-a", EDITOR, str(path)])
        self.sleep(1.5, 3)
        self.activate(EDITOR, EDITOR_NAMES)
        self.glide_into_window(EDITOR_PROCESS)

    def code(self):
        p = self.progress()
        if p["file"] >= len(FILES):  # всё написано — начинаем проект заново
            for rel, header, _ in FILES:
                (PROJECT / rel).write_text(header)
            p = {"file": 0, "part": 0}
        rel, header, parts = FILES[p["file"]]
        path = PROJECT / rel
        if p["part"] == 0:
            path.write_text(header)
        log(f"пишу код: {rel}")
        self.open_editor(path)
        self.key(KEY_DOWN, CMD)  # в конец файла
        self.sleep(0.3, 0.8)
        wpm = random.uniform(40, 65)
        snippet = parts[p["part"]].strip("\n")
        self.key(KEY_RETURN)
        for n, line in enumerate(snippet.split("\n")):
            self.ensure_front(EDITOR_NAMES)
            if n:
                self.key(KEY_RETURN)
            self.type_line(line, wpm)
            if random.random() < 0.12:
                log("думаю…")
                self.sleep(4, 12)
                if random.random() < 0.4:
                    self.drift()
            else:
                self.sleep(0.2, 1.4)
        self.key(KEY_RETURN)
        self.sleep(0.5, 1.5)
        self.ensure_front(EDITOR_NAMES)
        self.key(KEY_S, CMD)
        log("сохранил")
        p["part"] += 1
        if p["part"] >= len(parts):
            p = {"file": p["file"] + 1, "part": 0}
        self.save_progress(p)

    def review(self):
        """Открывает файл проекта в VS Code и читает его."""
        rel = random.choice(FILES)[0]
        log(f"читаю код: {rel}")
        self.open_editor(PROJECT / rel)
        self.key(KEY_UP, CMD)  # в начало файла
        self.sleep(1, 2)
        self.read(EDITOR_NAMES, chunks=(3, 7))

    # --- сессия

    def session(self):
        self.session_t = time.monotonic()
        self.last_pos = mouse_pos()
        log("вы отошли — начинаю работать")
        activities = [self.search, self.review, self.switch_tab, self.devtools]
        weights = [60, 20, 12, 8]
        try:
            while True:
                self.check_screen()
                activity = random.choices(activities, weights)[0]
                try:
                    activity()
                except Skip as why:
                    log(f"пропускаю: {why}")
                self.sleep(2, 7)
        except UserReturned as why:
            log(f"стоп — вы вернулись ({why})")


def accessibility_ok():
    x, y = mouse_pos()
    _post(cg.CGEventCreateMouseEvent(None, EV_MOUSE_MOVED, CGPoint(x + 1, y), 0))
    time.sleep(0.1)
    moved = abs(mouse_pos()[0] - x) >= 0.5
    _post(cg.CGEventCreateMouseEvent(None, EV_MOUSE_MOVED, CGPoint(x, y), 0))
    return moved


def setup_project():
    for rel, text in PROJECT_SCAFFOLD.items():
        f = PROJECT / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        if not f.exists():
            f.write_text(text)
    for rel, header, parts in FILES:  # файлы сразу с готовым кодом — чтобы было что читать
        f = PROJECT / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        full = header + "".join(parts)
        if not f.exists() or len(f.read_text()) < len(full):
            f.write_text(full)
    (PROJECT / ".vscode").mkdir(exist_ok=True)
    (PROJECT / ".vscode" / "settings.json").write_text(VSCODE_SETTINGS)


def main():
    if not accessibility_ok():
        sys.exit("Нет доступа к управлению компьютером. Откройте «Системные настройки → "
                 "Конфиденциальность и безопасность → Универсальный доступ» и включите "
                 "приложение, из которого запускаете скрипт (Terminal / iTerm), затем "
                 "перезапустите его.")
    setup_project()

    caffeinate = subprocess.Popen(["caffeinate", "-di", "-w", str(os.getpid())])
    bot = Bot()
    log(f"devbot (веб-разработчик) запущен: простой {IDLE_SEC:.0f} с → работа. "
        f"Проект: {PROJECT}. Ctrl+C — выход.")
    # В тестовом режиме после остановки бот возвращается к работе уже через 5 с.
    idle_needed = 5 if "--now" in sys.argv else IDLE_SEC
    try:
        if "--now" in sys.argv:  # проверка: старт через 5 с, без ожидания простоя
            log("тестовый запуск через 5 с — уберите руки от мыши и клавиатуры")
            time.sleep(5)
            bot.session()
            log(f"продолжу после {idle_needed:.0f} с без мыши и клавиатуры")
        shown = -1
        away = False
        while True:
            if not on_screen():  # на экране другой пользователь — ждём своей очереди
                if not away:
                    log("на экране другой пользователь — жду, пока переключатся сюда")
                    away = True
                time.sleep(3)
                continue
            if away:
                log("эта сессия снова на экране")
                away = False
            idle = seconds_since()
            if idle >= idle_needed:
                log(f"нет ввода с мыши и клавиатуры уже {idle:.0f} с")
                bot.session()
                log(f"продолжу после {idle_needed:.0f} с без мыши и клавиатуры")
                shown = -1
            elif idle_needed > 10 and int(idle) // 10 != shown and idle >= 10:
                shown = int(idle) // 10
                log(f"жду: {idle:.0f}/{idle_needed:.0f} с без движения")
            time.sleep(1)
    except KeyboardInterrupt:
        log("выход")
    finally:
        caffeinate.terminate()


if __name__ == "__main__":
    main()
