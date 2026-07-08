# قانون نگارش فایل کامپوننت (ساختار، تایپ، ترتیب، کامنت)

این قانون تعیین می‌کند که **هر فایل کامپوننت چطور باید نوشته شود**: چند تا
کامپوننت داخلش باشد، تایپ‌هایش چه شکلی باشند، اجزای داخلش با چه ترتیبی بیایند، و
کجا حق کامنت‌نویسی داریم. هدف این است که همه‌ی فایل‌های کامپوننت پروژه یک شکل و
یک ریتم داشته باشند، طوری که هر کسی هر فایلی را باز کرد بداند دقیقاً کجای فایل
دنبال چه چیزی بگردد.

## چرا این قانون مهم است

وقتی هر کس هر جور دلش خواست یک فایل کامپوننت بنویسد — یکی سه تا کامپوننت را در
یک فایل بریزد، یکی تایپ‌هایش را `Props1` و `Data2` اسم بگذارد، یکی `useEffect` را
بالای همه چیز بنویسد و یکی پایین همه چیز — نتیجه‌اش این می‌شود:

- خواندن و پیدا کردن چیزها در فایل‌ها کند و پیش‌بینی‌ناپذیر می‌شود؛ هیچ «نقشه‌ی
  ذهنی» ثابتی برای فایل‌ها وجود ندارد.
- ری‌فکتور و جابه‌جایی کامپوننت‌ها سخت می‌شود، چون چند کامپوننت به هم چسبیده‌اند.
- تایپ‌های بی‌معنی باعث می‌شوند برای فهمیدن یک مقدار مجبور شوی کل مسیرش را دنبال
  کنی.
- کامنت‌های بیهوده کد را شلوغ می‌کنند و با تغییر کد، خیلی زود دروغ می‌شوند.

راه‌حل: **یک قالب ثابت و قابل‌پیش‌بینی برای هر فایل کامپوننت.**

---

## قانون ۱ — هر فایل فقط یک کامپوننت را تعریف می‌کند

هر فایل کامپوننت **دقیقاً یک** کامپوننت React را export می‌کند (کامپوننت اصلیِ
همان فایل). هرگز چند کامپوننت مستقل را در یک فایل تعریف نکن.

- اگر یک بخش از UI به‌قدری بزرگ یا مستقل شد که یک کامپوننت جدا می‌طلبد، یک
  **فایل جدا** (و در صورت نیاز پوشه‌ی جدا) برایش بساز، نه اینکه پایین همان فایل
  یک `function SecondThing()` دیگر تعریف کنی.
- ساختار پوشه‌بندی پروژه همین را می‌گوید: هر کامپوننت یک پوشه دارد که داخلش
  فایل کامپوننت (`xxx.tsx`) و فایل تایپش (`xxx.type.ts`) کنار هم‌اند. کامپوننت‌های
  فرعیِ یک feature در `_components/` همان روت colocate می‌شوند.

```
_components/
  customerForm/
    customerForm.tsx        ← فقط CustomerForm
    customerForm.type.ts
  customerRow/
    customerRow.tsx         ← فقط CustomerRow (نه داخل customerForm)
    customerRow.type.ts
```

```tsx
// ❌ بد — دو کامپوننت در یک فایل
export default function CustomerForm() { /* ... */ }
function CustomerRow({ customer }: { customer: Customer }) { /* ... */ }

// ✅ خوب — customerForm.tsx فقط CustomerForm را دارد،
//    و CustomerRow در فایل خودش customerRow/customerRow.tsx زندگی می‌کند
export default function CustomerForm() { /* ... */ }
```

**استثنای مجاز:** یک زیر-جزءِ کوچک و کاملاً بی‌state و مخصوصِ همان فایل که هیچ
جای دیگری استفاده نمی‌شود و صرفاً برای خواناتر شدن `return` جدا شده (مثلاً یک
`renderRow` که JSX برمی‌گرداند) اشکالی ندارد — ولی به‌محض اینکه state، prop
معنادار، یا استفاده‌ی دوباره پیدا کرد، باید به فایل خودش منتقل شود.

---

## قانون ۲ — تایپ‌ها اسم واضح و معنادار دارند

هر تایپ/اینترفیس باید از روی اسمش معلوم باشد که چیست. اسم‌های مبهم، شماره‌دار، یا
بیش‌ازحد کوتاه ممنوع‌اند.

- Props هر کامپوننت: `XxxProps` (مثلاً `CustomerFormProps`).
- دامنه/موجودیت داده: اسم خودِ موجودیت (`Customer`, `Address`, `OrderItem`).
- Payload ارسالی به بک‌اند: `XxxPayload` (`CustomerPayload`, `UpdateUserPayload`).
- مقادیر فرم: `FormValues` یا `XxxFormValues`.
- گزینه‌های انتخابی/آپشن: `XxxOption` (`LocationOption`).

```ts
// ❌ بد
type Props = { a: string; b?: number };
type Data = { list: any[] };
type T2 = "create" | "edit";

// ✅ خوب
type CustomerFormProps = { mode: "create" | "edit"; customer?: Customer | null };
type LocationOption = { id: number; name: string };
type FormValues = { firstName?: string; lastName?: string; phoneNumber?: string };
```

- تایپ‌های مخصوص یک کامپوننت (مثل `Props`) در فایل تایپ کنار همان کامپوننت
  (`xxx.type.ts`) قرار می‌گیرند.
- تایپ‌های دامنه‌ای که در چند جا استفاده می‌شوند در `_types/` همان روت یا در
  `src/types/` سراسری قرار می‌گیرند.
- از `any` پرهیز کن؛ اگر واقعاً ناگزیر شدی، دلیلش باید روشن باشد.

---

## قانون ۳ — ترتیب ثابت اجزای داخل فایل کامپوننت

داخل بدنه‌ی هر کامپوننت، اجزا باید **دقیقاً با این ترتیب** بیایند. این ترتیب
غیرقابل‌مذاکره است تا هر فایلی قابل‌پیش‌بینی باشد:

1. **`useState`ها** — همه‌ی state‌های محلی کامپوننت اول تعریف می‌شوند.
2. **Storeها** — انتخاب از store‌های zustand (مثل `useNotificationStore`,
   `useCartStore`).
3. **هوک‌هایی که به‌عنوان متغیر استفاده می‌شوند** — مثل `useRouter`,
   `useReadSearchParams`, `useUpdateSearchParams`, `useRef`.
4. **هوک `useApi`** — تعریف درخواست‌ها (هوکی که request می‌سازد).
5. **`useEffect`ها** — تمام افکت‌ها اینجا.
6. **مقادیر مشتق‌شده / محاسبه‌شده** — متغیرهایی که از state/props ساخته می‌شوند
   (مثل `provinceOptions = ...`).
7. **فانکشن‌ها / هندلرها** — `formValidator`, `submitHandler`, `onChangeX` و... .
8. **`return` (JSX)** — رندر.

```tsx
export default function CustomerForm({ mode, customer }: CustomerFormProps) {
	// 1) useState
	const [formValues, setFormValues] = useState<FormValues>({});
	const [formErrors, setFormErrors] = useState<FormErrors[]>([]);

	// 2) stores
	const showNotification = useNotificationStore((s) => s.showNotification);

	// 3) هوک‌های متغیری (router, searchParams, ref, ...)
	const router = useRouter();
	const isInitialMount = useRef<boolean>(true);

	// 4) useApi
	const { fetchDataResult: executeSubmit, loading: submitLoading } = useApi(
		async (payload: CustomerPayload) => await CustomerEndpoints.createCustomer(payload),
	);

	// 5) useEffect
	useEffect(() => {
		/* ... */
	}, []);

	// 6) مقادیر مشتق‌شده
	const isEdit = mode === "edit";

	// 7) فانکشن‌ها
	const submitHandler = async () => {
		/* ... */
	};

	// 8) JSX
	return <div>{/* ... */}</div>;
}
```

### یوتیل‌ها را از فایل کامپوننت بیرون بکش

اگر فانکشنی به state/props کامپوننت وابسته نیست (یک تابع خالص است — گرفتن ورودی،
دادن خروجی، بدون دست‌زدن به state)، آن را داخل کامپوننت رها نکن. یک فایل جداگانه
در پوشه‌ی **`_utils/`** همان روت بساز و از آنجا import کن.

```
routes/customers/
  _components/customerForm/customerForm.tsx
  _utils/
    buildCustomerPayload.ts   ← تابع خالص، بدون state
    validateNationalId.ts
```

- فانکشن‌های وابسته به state (هندلرهایی مثل `submitHandler` که `setState` صدا
  می‌زنند) داخل کامپوننت می‌مانند (مطابق قانون ۳، بخش ۷).
- فانکشن‌های خالص و قابل‌استفاده‌ی مجدد → `_utils/`.

---

## قانون ۴ — کامنت‌نویسی بیهوده ممنوع

کد باید خودش گویا باشد. کامنت فقط وقتی مجاز است که **بدون آن، فهمِ کد واقعاً سخت
باشد** — مثلاً یک workaround غیرشهودی، یک محدودیت سمت بک‌اند، یا دلیلِ یک تصمیم
غیرعادی («چرا»، نه «چه»).

```tsx
// ❌ بد — کامنت چیزی به کد اضافه نمی‌کند
// state برای نگه‌داری نام
const [name, setName] = useState("");
// حلقه روی آیتم‌ها
items.map((item) => <Row key={item.id} />);

// ✅ خوب — کامنت دلیلِ غیرشهودی را توضیح می‌دهد
// بک‌اند صفحه را ۱-based می‌فرستد ولی کامپوننت جدول ۰-based است
const apiPage = page - 1;
```

- کامنت «چه‌کاری» (که خود کد هم می‌گویدش) ننویس؛ فقط «چرایی» غیرواضح را بنویس.
- به‌جای کامنتِ توضیحی، اسم متغیر/فانکشن را گویاتر کن.
- کدِ مرده را کامنت نکن که «شاید بعداً لازم شود» — پاکش کن (git تاریخچه دارد).

---

## چک‌لیست سخت‌گیرانه

هنگام نوشتن یا ریویو کردن یک فایل کامپوننت این‌ها را چک کن:

1. **فایل فقط یک کامپوننت export می‌کند؟** (قانون ۱)
2. **همه‌ی تایپ‌ها اسم واضح و معنادار دارند؟ هیچ `Props`ِ بدون prefix، هیچ
   `T1/Data2`، هیچ `any`ِ بی‌دلیل؟** (قانون ۲)
3. **ترتیب اجزا رعایت شده؟** useState → stores → هوک‌های متغیری → useApi →
   useEffect → مقادیر مشتق‌شده → فانکشن‌ها → JSX. (قانون ۳)
4. **فانکشن‌های خالص در `_utils/` قرار گرفته‌اند، نه داخل کامپوننت؟** (قانون ۳)
5. **هیچ کامنت بیهوده‌ای (توضیح «چه») در فایل نیست؛ فقط «چرا»ی غیرواضح کامنت
   شده؟** (قانون ۴)

---

## خلاصه‌ی یک‌خطی برای یادآوری سریع

> **یک فایل = یک کامپوننت؛ تایپ‌ها اسم معنادار؛ ترتیب ثابت
> (state → store → hook → useApi → effect → derived → fn → JSX)؛ یوتیل خالص در
> `_utils/`؛ کامنت فقط برای «چرا»ی غیرواضح.** هر فایل کامپوننتی که این‌ها را نقض
> کند باید در کد ریویو رد شود.
