# Murch Vision v1 — Demo Cheatsheet

Three narrated flows for live customer demos. Each flow lists the exact
key-press / click / expected UI response for every step so you can
follow on a laptop without losing your place.

## Бэлтгэл (30 секунд)

```bash
cd murch-ai-estimator
npm install   # first time only
npm run dev
```

Open **http://localhost:5173** → you should see:

- Splash: "MURCH VISION" logo fades in for ~1 second then disappears
- Toast (bottom): *"Демо өгөгдөл ачаалагдлаа — эхний төслөөр туршиж үзнэ үү"*
- `/projects` page with **3 project cards**:
  - **Бросс-С блок** · 16 давхар, 75 айл · `НООРОГ`
  - **Алтан бодь резиденс** · 12 давхар, 48 айл · `ХЯНАГДАЖ БУЙ` · ⚠ 3 modifications
  - **Үндэсний номын сан шинэчлэл** · 3 давхар · green `БАТАЛГААТАЙ` corner seal

> **Reset between demos**: open devtools → Application → Local Storage → `Clear site data`.
> Reloading the page triggers the splash again.

---

## Flow A — Захиалагчтай хэлэлцээ (Live price negotiation) · 90 секунд

Scenario: You are sitting across a table from the customer. They want to
negotiate the price of two line items in the CCTV section. You need to
show the changes clearly — with the original price visible — and print a
revised quote.

| # | Action | Expected UI response |
|---|--------|----------------------|
| 1 | Click **Бросс-С блок** card | Dashboard opens at `/projects/prj-bross-c/overview`. Эцсийн дүн: `608.0М ₮`. |
| 2 | Click **CCTV** tab | Section editor loads. Top-right: `1 өөрчлөлт хийсэн` chip — wait, fresh run has 0. Skip this line if 0. |
| 3 | Find row **"NVR бичлэгийн төхөөрөмж (48 суваг)"** — unit price field **3,800,000** | Current line total `3.8М₮`. |
| 4 | Click the **unit price** input, type **3500000**, press **Tab** | **Amber 3px bar** appears on the left of the row. Below the price input: `3,800,000 ↓ -8%` in green. Row total updates to `3.5М₮` with `↓ -8%` strikethrough. Toast: `Хадгалагдсан ✓`. Header total drops ~300K. |
| 5 | Find row **"Дотор камер 3MP, PoE, TCP/IP"** — qty **7** → type **5** | Amber bar, `7 → 5` strikethrough + `↓ -29%` red, row total drops. Toast fires. |
| 6 | Hover the row → **RotateCcw** icon appears on the right | Click it to revert. Toast `Анхны утгад буцаалаа`. Amber bar disappears, original 7 restored. |
| 7 | Press **Cmd+Z** (Ctrl+Z on Windows) | NVR edit undoes. Toast `Буцаасан`. Unit price back to 3,800,000. Амбер bar gone. |
| 8 | Press **Cmd+Shift+Z** to redo | Edit reapplied. Toast `Давтсан`. |
| 9 | Top-right: click **"Үнийн санал харах"** | Standalone `/quote` page. Amber disclosure: *"Анхааруулга. Энэхүү үнийн санал AI-ийн анхны үнэлгээнээс 1 өөрчлөлттэй..."*. Large `НООРОГ / DRAFT` watermark rotated 45° behind the document. |
| 10 | Click **"PDF татах"** (blue primary button) | Toast `PDF бэлтгэж байна…` → ~1s later `PDF татаж авлаа`. Download starts. Open the PDF: every page carries `Murch Vision · <docNo>` header, `Хуудас X / Y` footer, `НООРОГ` watermark. Cover → exec summary → 4 section tables → aux summary → terms + signatures. |

**Talking points:**
- *"Таны нэрийг эцсийн дүн 608.0М ₮-өөс 607.7М ₮ руу бууруулаад байна"*
- *"Анхны AI үнэлгээнээс өөр болсон мөрүүд улаан шугамтай харагдана"*
- *"Дээрх PDF-ийг одоо шууд авч явна уу — инженер баталгаажуулсны дараа watermark арилна"*

---

## Flow B — Инженерийн хяналт (Engineer review ceremony) · 60 секунд

Scenario: Sales made the edits. Now the engineer reviews, approves, and
cryptographically signs the quote.

| # | Action | Expected UI response |
|---|--------|----------------------|
| 1 | From the project dashboard, click **"БАТЛУУЛАХ"** in the top bar | `/approval` page opens. Current role is `Борлуулалт` · Б.Нарантуяа. Status pill: `НООРОГ`. Submission form with engineer dropdown. |
| 2 | Select **Ц.Батбаяр · 2024-CE-0341** from dropdown, type note *"Маргааш өглөө хүртэл хянаж өгнө үү"*, click **"Хянуулахаар илгээх"** | Toast `Хянуулахаар илгээлээ`. Page re-renders: amber pill `ХЯНАГДАЖ БУЙ`, clock icon pulsing, note shown, history panel right side gets first entry. |
| 3 | Click the role switcher (top-right), pick **Ц.Батбаяр · 2024-CE-0341** | Role pill turns blue `ИНЖЕНЕР Ц.Батбаяр`. Toast: `Ц.Батбаяр (Инженер) болж нэвтэрлээ`. Main panel now shows totals preview + Зөвшөөрөх / Буцаах buttons. |
| 4 | Review the totals mini-preview | Shows Үндсэн материал, Ажлын хөлс, Туслах материал, Эцсийн дүн. Button `Бүрэн харах →` links back to overview. |
| 5 | Click green **"Зөвшөөрөх"** | Status pill turns emerald `ЗӨВШӨӨРӨГДСӨН`. Main panel now shows "Гарын үсгээр баталгаажуулах" CTA. |
| 6 | Click **"Гарын үсгээр баталгаажуулах"** (blue) | `PinModal` opens: 4 separate digit boxes, autofocus on first. Below boxes: `Ц.Батбаяр · Лиценз 2024-CE-0341`. |
| 7 | Type **1**, **2**, **3**, **4** | Each digit auto-advances to the next box. After 4th digit, button `Гарын үсэг зурах` becomes active. |
| 8 | Click **"Гарын үсэг зурах"** (or press Enter) | Toast `Цахим гарын үсэг баталгаажлаа`. Status pill turns blue `ГАРЫН ҮСЭГ БҮХИЙ`. Full-size green **БАТЛАГДСАН** seal renders with engineer name, license, expiry, timestamp, approval record ID. |
| 9 | Navigate back to any BOQ section | All qty/unitPrice inputs are now **read-only and grey**. |
| 10 | Click a field and type | Toast: *"Энэ төсөл баталгаажсан — засварлахын тулд шинэ хувилбар үүсгэнэ үү"*. |
| 11 | Go back to `/approval`, switch role to **Админ Т.Отгонбаяр**, click **"Шинэ хувилбар үүсгэх"** | Navigates to `/projects/prj-bross-c-rev-b/overview`. Code is `ЗП-25-12-229-REV-B`. Status is Ноорог. All items editable again. |
| 12 | Open `/quote` on the signed original | Large **БАТЛАГААЖСАН** seal rendered on the cream paper. No DRAFT watermark. Bold AI-disclosure footer at the bottom. |

**Talking points:**
- *"Инженерийн PIN бол ceremonial — production-д FIDO2 буюу Mongolian e-sign card-тай холбогдоно"*
- *"Гарын үсэг зурсан эцэст энэ BOQ гаж боломжгүй"*
- *"Заавал засвар шаардвал revision үүсгэж, audit trail хадгалагдана"*

---

## Flow C — Нийлүүлэгч харьцуулалт (Supplier comparison) · 60 секунд

Scenario: Customer wants to know if we can get the same materials
cheaper. Show the supplier catalog in action.

| # | Action | Expected UI response |
|---|--------|----------------------|
| 1 | Top bar: click **"Нийлүүлэгч"** | `/projects/prj-bross-c/suppliers` loads. Hero: `Боломжит хэмнэлт ~54.8M ₮`. Table of every BOQ row with cheapest catalog match + potential savings. |
| 2 | Click the **NVR бичлэгийн төхөөрөмж (48 суваг)** row | Right drawer opens. Pinned gray section at top: `Одоогийн үнэ 3,800,000 ₮ / 1 ш × 3,800,000 = 3,800,000 ₮`. |
| 3 | Below the pinned row: 5 alternatives sorted by price ASC | Rank 1 gets `ХАМГИЙН ХЯМД` badge and a **blue primary** "Энэ үнийг авах" button. Each row: price, savings delta in green (`−1,016,237₮ (−26.7%)`), freshness dot, stock badge, manufacturer, warranty. |
| 4 | Click **primary blue "Энэ үнийг авах"** on rank 1 | Toast: `Үнэ шинэчлэгдлээ: 3,800,000 → 2,783,763 ₮ (-1,016,237)`. Row updates, amber bar appears. Change log gets auto-note `"Нийлүүлэгч сонгов: МикроТех Монгол ХХК"`. Side-panel `Боломжит хэмнэлт` decreases. |
| 5 | Close drawer. Click **"Бүгдийг хамгийн хямд үнэд шилжүүлэх"** (top-right, emerald) | Confirm modal: `N мөрийг` · `Хэмнэх дүн −X ₮` in huge emerald. |
| 6 | Click **"Шилжүүлэх"** | Every matched row gets the cheapest price applied. Header final total drops ~50M. Toast: `Нийт X ₮ хэмнэгдлээ`. |
| 7 | Press **Cmd+K** | Global search modal opens. Type **"ВВГ"**. 3 result groups appear simultaneously: Төслүүд (none), Каталог (5 cable matches with Nexans / Дэд станц), BOQ (current project's cable items). |
| 8 | Arrow down to a BOQ hit, press **Enter** | Navigates to `/projects/prj-bross-c/section/electrical` with that BOQ item in view. |
| 9 | Navigate to `/catalog` via top bar | Global catalog browser: 231 материал · 4 нийлүүлэгч. Sidebar category tree (CCTV / Drone / Цахилгаан / Гэрэлтүүлэг / Кабель / Туслах). Search, supplier filter, stock filter. |

**Talking points:**
- *"Улаанбаатарын Q1 2026 зах зээлийн үнийн сангаас автомат тулгана"*
- *"Бөөнөөр сольсон ч мөр бүрт өөрчлөлтийн түүх үлдэнэ — ямар нь аль үнэд шилжсэнийг дараа харах боломжтой"*
- *"Caталог дундаас брэнд, бэлэн байгаа эсэх, үнэ хэр шинэ эсэхээр шүүнэ"*

---

## Keyboard reference (printable)

| Keys | Action |
|---|---|
| `Cmd/Ctrl+K` | Global search |
| `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z` | Undo / redo (BOQ edits only) |
| `/` | Focus section search |
| `Tab` / `Shift+Tab` | Move between editable fields |
| `↑` / `↓` on qty | ±1, Shift ±10, Alt ±100 |
| `↑` / `↓` on unitPrice | ±100, Shift ±1000, Alt ±10000 |
| `Esc` | Close modal/drawer/search |
| `Enter` in PIN modal | Submit when 4 digits entered |

## Known edge cases

- Editing a signed project rate-limits the lock toast to once per 10 seconds (by design — doesn't spam when users click around).
- Global search catalog hits navigate to `/catalog` but don't open the specific drawer (Phase 8 follow-up, not planned).
- Revision cloning carries the source's current values as the new baseline — the new project's change log is empty.
