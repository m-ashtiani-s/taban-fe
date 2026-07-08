# قانون سیستم آیکن (gulp + کامپوننت آیکن)

پروژه یک **سیستم مشخص برای آیکن‌ها** دارد که بر پایه‌ی gulp کار می‌کند و از فایل
SVG خام، یک کامپوننت React تولید می‌کند. این قانون می‌گوید: **هیچ‌وقت SVG را
به‌صورت inline داخل کامپوننت‌ها ننویس و هیچ‌وقت آیکن خالی/دست‌ساز نساز** — همیشه
از همین pipeline رد شو.

## چرا این قانون مهم است

اگر هر کس SVGها را مستقیم داخل JSX کپی کند یا هرجا یک `<svg>` دست‌ساز بزند:

- **رنگ/سایز/ضخامت خط ناهماهنگ** می‌شود؛ هر آیکن رفتار خودش را دارد و با
  `currentColor`/`stroke` سیستم هماهنگ نیست.
- **JSX شلوغ** می‌شود؛ ده‌ها خط path داخل کامپوننت‌های منطقی قاطی می‌شود.
- **بهینه‌سازی انجام نمی‌شود**؛ SVGهای خام سنگین و پر از attribute اضافی‌اند.
- **قابل‌استفاده‌ی مجدد نیستند**؛ همان آیکن در چند جا دوباره کپی می‌شود.

راه‌حل: **همه‌ی آیکن‌ها از طریق gulp به کامپوننت `IconXxx` تبدیل می‌شوند و از یک
نقطه‌ی واحد import می‌شوند.**

---

## این سیستم چطور کار می‌کند

سه بخش دارد:

1. **پوشه‌ی SVGهای خام:** `icons/icons-svg/` — فایل‌های `*.svg` خام اینجا
   گذاشته می‌شوند.
2. **تسک gulp:** `icons/gulpfile.js` — SVGها را minify می‌کند، attributeهای
   اضافی (fill/stroke/width/height/...) را حذف می‌کند، محتوای داخل `<svg>` را
   درون قالب `icons/icon-template.txt` می‌پیچد و برای هر آیکن یک فایل
   `.tsx` می‌سازد.
3. **خروجی تولیدشده (دست نزن):**
   - `src/app/_components/icon/src/*.tsx` — کامپوننت هر آیکن.
   - `src/app/_components/icon/icons.ts` — فایل barrel که همه را با نام
     `IconXxx` (PascalCase از روی اسم فایل) دوباره export می‌کند.

هر کامپوننت آیکن روی `BaseIcon` (در `src/app/_components/icon/base-icon.tsx`)
سوار است که مقادیر پیش‌فرض `color="currentColor"`، `width/height=24`،
`strokeWidth`، `viewBox` و... را می‌دهد و پراپ‌های `svgIcon` (یعنی
`SVGAttributes<SVGElement>`) را می‌پذیرد.

---

## روش درست افزودن و استفاده از آیکن

### افزودن یک آیکن جدید

1. فایل SVG را در `icons/icons-svg/` بگذار (مثلاً `arrow-line.svg`). اسم فایل را
   kebab-case انتخاب کن؛ همین اسم به `IconArrowLine` تبدیل می‌شود.
2. تسک gulp را اجرا کن (از داخل پوشه‌ی `icons/`):

   ```bash
   cd icons && npx gulp
   ```

3. حالا کامپوننت `IconArrowLine` در `icons.ts` در دسترس است.

### استفاده از آیکن

همیشه از barrel واحد import کن و مثل یک کامپوننت معمولی استفاده‌اش کن. چون روی
`currentColor` و `stroke` است، رنگ و سایز را با prop یا کلاس کنترل کن:

```tsx
import { IconArrowLine, IconUser } from "@/app/_components/icon/icons";

// سایز و چرخش و رنگ از بیرون کنترل می‌شوند (بدون دست‌زدن به خودِ SVG)
<IconArrowLine className="rotate-180" width={24} height={24} />
<IconUser className="stroke-neutral-600" />
```

---

## کارهای ممنوع

```tsx
// ❌ SVG خام inline داخل کامپوننت
<svg viewBox="0 0 24 24" ...>
	<path d="M12 2l3 7h7l-6 4 ..." />
</svg>

// ❌ ساختِ دستیِ یک کامپوننت آیکن به‌جای عبور از gulp
export const MyArrow = () => <svg>...</svg>;

// ❌ آیکن خالی / placeholder دست‌ساز
<span className="icon-placeholder" />
```

```tsx
// ✅ همیشه از کامپوننت تولیدشده استفاده کن
import { IconArrow } from "@/app/_components/icon/icons";
<IconArrow className="rotate-90" width={20} height={20} />
```

---

## چک‌لیست سخت‌گیرانه

هنگام کار با آیکن این‌ها را چک کن:

1. **هیچ `<svg>`ِ inline یا `<path>`ِ دستی داخل کامپوننت‌های منطقی نیست؟**
2. **آیکن مورد نیاز از `@/app/_components/icon/icons` (به شکل `IconXxx`) import
   شده؟**
3. **اگر آیکن جدید لازم بود، SVGاش در `icons/icons-svg/` گذاشته و gulp اجرا
   شده — نه اینکه دستی یک فایل tsx در `icon/src/` ساخته شود؟**
4. **فایل‌های تولیدشده (`icon/src/*.tsx` و `icon/icons.ts`) دستی ویرایش
   نشده‌اند؟** (این‌ها خروجی build‌اند و با اجرای دوباره‌ی gulp بازنویسی می‌شوند.)
5. **رنگ/سایز آیکن از بیرون (prop/className) کنترل شده، نه با hardcode داخل
   خودِ SVG؟**

---

## خلاصه‌ی یک‌خطی برای یادآوری سریع

> **آیکن جدید → SVG در `icons/icons-svg/` → اجرای gulp → استفاده از `IconXxx` از
> `@/app/_components/icon/icons`.** هیچ‌وقت SVG inline، آیکن دست‌ساز، یا آیکنِ
> خالی نساز؛ هر کدی که این pipeline را دور بزند باید در کد ریویو رد شود.
