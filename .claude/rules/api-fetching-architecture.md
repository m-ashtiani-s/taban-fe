# قانون معماری فچ / ارتباط با بک‌اند (سه‌لایه‌ای)

این قانون **عمومی** است و به هیچ پروژه‌ی خاصی وابسته نیست. هدفش این است که هر بار
که قرار است کدی نوشته شود که با یک API ارتباط برقرار می‌کند (چه در این پروژه، چه
در هر پروژه‌ی دیگری که همین الگو در آن پیاده شده)، دقیقاً همان سه لایه‌ی زیر
رعایت شود و هیچ کامپوننتی مستقیماً سراغ شبکه نرود.

## چرا این قانون مهم است

وقتی هر کامپوننت آزاد باشد که هرجور دلش خواست فچ کند (یکی `axios` مستقیم صدا کند،
یکی `fetch` خام بزند، یکی خودش try/catch بنویسد)، نتیجه‌اش این می‌شود:

- هندل کردن خطا (پیام‌ها، کد‌های وضعیت، ۴۰۱/۴۰۴/۵۰۲ و...) در ده جای مختلف با
  رفتار متفاوت پیاده می‌شود.
- تغییر یک چیز مشترک (مثلاً هدر Authorization، base URL، timeout، رفتار retry،
  یا حتی افزودن یک قانون امنیتی جدید) یعنی گشتن در کل کدبیس.
- تست‌نویسی و mock کردن شبکه عملاً غیرممکن می‌شود چون هیچ نقطه‌ی ورودی واحدی
  برای mock کردن وجود ندارد.
- کامپوننت‌ها با state مربوط به loading/error/data شلوغ می‌شوند و منطق UI با
  منطق شبکه قاطی می‌شود.

راه‌حل: **سه لایه‌ی مجزا با مسئولیت مشخص**، که هرکدام فقط کار خودشان را انجام
می‌دهند و هیچ‌کدام وارد حریم لایه‌ی دیگر نمی‌شوند.

---

## معماری کلی (بالا به پایین)

```
Component  →  TanStack Query (useQuery/useMutation)  →  Endpoint module  →  HTTP client (transport)
   |                    |                                     |                      |
  فقط UI          state: loading/error/data              فقط تعریف request     فقط ارسال درخواست
 (شرط رندر درجا)  (نرمال‌سازی خطا با withMappedError)       (url/method/params)   (auth header, base url,
                                                                                 error normalization)
```

> جزئیات کامل استانداردِ لایه‌ی ۳ (React Query) در اسکیل `data-fetching` است؛ این
> فایل فقط اصولِ لایه‌ای و مرزهای بین لایه‌ها را می‌گوید.

### لایه‌ی ۱ — Transport Client (پایین‌ترین لایه)

یک و فقط یک wrapper سراسری روی ابزار HTTP (axios، fetch، یا هرچی) که:

- یک‌بار برای همیشه `baseURL`، `timeout`، و هدرهای پیش‌فرض را تنظیم می‌کند.
- با یک **interceptor** توکن/session را به‌صورت خودکار به هر درخواست تزریق
  می‌کند — کامپوننت‌ها و endpoint‌ها هرگز خودشان authorization header
  نمی‌سازند.
- یک تابع عمومی خیلی نازک بیرون می‌دهد (مثلاً `httpClient.call<T>(config)`)
  که ورودی‌اش `{ method, url, params, data, headers, ... }` است و خروجی‌اش یک
  نوع `Response<T>` یکدست است.
- **هیچ منطق مربوط به یک feature خاص اینجا نباید باشد.** این لایه چیزی درباره‌ی
  "کارت خرید" یا "پروفایل کاربر" نمی‌داند و نباید بداند.

```ts
// httpClient.ts — تنها نقطه‌ای که مستقیم axios/fetch صدا زده می‌شود
const axiosClient = axios.create({ baseURL: API_URL, timeout: 30000 });

axiosClient.interceptors.request.use((config) => {
  config.headers.authorization = getStoredToken();
  return config;
});

export const httpClient = {
  call: async <T>(config: RequestConfig): Promise<Response<T>> => {
    const res = await axiosClient.request(config);
    return new Response(res.data, res.status);
  },
};
```

### لایه‌ی ۲ — Endpoint Modules (تعریف هر request)

هر گروه از عملیات مرتبط با یک دامنه/feature (کاربر، کارت خرید، پاسپورت، سفارش،
...) در یک آبجکت جمع می‌شود. هر تابع در این آبجکت:

- فقط `httpClient.call(...)` را با `method` و `url` و `params`/`data` مناسب
  صدا می‌زند.
- **هیچ state ندارد** — نه `loading`، نه `try/catch` برای نمایش خطا به کاربر،
  نه هیچ چیز UI-محور.
- امضای ورودی/خروجی تایپ‌شده دارد (اگر TypeScript است) تا کامپوننت بالادستی
  بداند دقیقاً چه چیزی می‌فرستد و چه چیزی پس می‌گیرد.
- نامش با الگوی `XxxEndpoints` (یا معادل آن در زبان پروژه) و اکشن‌هایش فعل+اسم
  هستند: `getCart`, `addToCart`, `removeCartItem`, `uploadFile`.

```ts
export const CartEndpoints = {
  getCart: async () => {
    const res = await httpClient.call<Res<Cart>>({ method: "GET", url: "v1/user/cart" });
    return res?.data;
  },
  addToCart: async (payload: AddItemPayload) => {
    const res = await httpClient.call<Res<Cart>>({ method: "POST", url: "v1/user/cart", data: payload });
    return res?.data;
  },
};
```

**کجا این فایل‌ها را بگذاریم؟**

- اگر یک endpoint در چند feature/صفحه استفاده می‌شود → در یک ماژول مشترک و
  سراسری (مثلاً `api/` یا `services/` در ریشه‌ی سورس).
- اگر یک endpoint فقط مخصوص یک صفحه/feature خاص است → کنار همان feature،
  colocate شده (مثلاً `features/cart/api.ts` یا `routes/cart/_api/endpoint.ts`،
  بسته به ساختار پوشه‌بندی پروژه).
- **هیچ‌وقت یک endpoint را در دو جای مختلف دوباره تعریف نکن.** اگر می‌بینی
  داری چیزی را کپی می‌کنی، یعنی جایش اشتباه انتخاب شده — آن را به یک ماژول
  مشترک ببر.

### لایه‌ی ۳ — Data-fetching (پل بین UI و Endpoint)

نقش این لایه: گرفتن یک تابع از لایه‌ی Endpoint و مدیریت وضعیتِ `loading`/`data`/خطا
به‌صورت **نرمال‌شده و یکدست**. **در این پروژه این لایه دقیقاً TanStack Query (React
Query) است** و مستقیم در همان کامپوننتی که داده را مصرف می‌کند نوشته می‌شود — نه پشت
یک هوک سفارشی. جزئیات کامل در اسکیل `data-fetching`؛ اینجا فقط اصولِ لایه‌ای:

- **خواندن داده → `useQuery`** (اعلانی؛ با mount و تغییر `queryKey` اجرا می‌شود).
- **انجام یک کار (POST/PUT/DELETE/دانلود) → `useMutation`** (دستوری؛ فقط با
  `mutate()`/`mutateAsync()`). فعل HTTP ملاک نیست؛ نقشِ عملیات ملاک است.
- **نرمال‌سازی خطا در یک تابع مرکزی واحد است: `mapError`.** هر `queryFn`/`mutationFn`
  باید در `withMappedError` پیچیده شود تا خطای خام به `ResultError` نگاشت و **دوباره
  throw** شود (React Query موفقیت/شکست را از throw شدن promise تشخیص می‌دهد، نه از
  فیلد `success`). این تابع مرکزی مسئول تشخیص ۴۰۱ → پاک‌کردن session → ریدایرکت
  لاگین، تبدیل کدهای HTTP (۴۰۴/۵۰۲/۵۰۳/timeout/network) به پیام فارسی، و استخراج
  خطای اعتبارسنجی است.
- **توست خطا سراسری و opt-in است:** `meta: { showNotification: true }` روی کوئری/
  میوتیشن. هرگز توست را داخل `queryFn`/`withMappedError` نگذار.

```ts
// خواندن — مستقیم در کامپوننت
const cartQuery = useQuery({
  queryKey: ["cart", "detail"],
  queryFn: () => withMappedError(() => CartEndpoints.getCart()),
  meta: { showNotification: true },
});

// انجام کار — میوتیشن
const { mutate: addToCart, isPending } = useMutation({
  mutationFn: (payload: AddItemPayload) => withMappedError(() => CartEndpoints.addToCart(payload)),
  meta: { showNotification: true },
});
```

> ⚠️ هوک قدیمی `useApi` **حذف شده** و دیگر در هیچ کدی استفاده نمی‌شود. کد جدید فقط با
> `useQuery`/`useMutation` نوشته می‌شود. برای فچ imperative (مثلاً داده برای منطق نه
> رندر، یا لیستِ accumulate) از `queryClient.fetchQuery(...)` استفاده کن.

### لایه‌ی ۴ (کامپوننت) — فقط مصرف‌کننده

کامپوننت `useQuery`/`useMutation` را **مستقیم** می‌نویسد و بر اساس فلگ‌هایش
(`isPending`/`isFetching`/`error`/`data`، یا `isPending` میوتیشن) رندر می‌کند؛
شرط‌های loading/error/data **درجا و صریح** در JSX (خطا قبل از data چک می‌شود).
کامپوننت هرگز:
- مستقیم `httpClient` یا `axios`/`fetch` را import نمی‌کند.
- خودش try/catch برای خطای شبکه نمی‌نویسد (مگر جایی که عمداً با
  `mutateAsync`/`fetchQuery` نتیجه را دستی هندل می‌کند).
- هدر Authorization یا base URL را نمی‌داند.
- `useQuery`/`useMutation` را پشت یک هوک سفارشی یا کامپوننتِ wrapper (مثل
  `<QueryBoundary>`) قایم نمی‌کند — کوئری همان‌جا در کامپوننت زندگی می‌کند.

---

## قوانین سخت‌گیرانه (چک‌لیست)

هنگام نوشتن یا ریویو کردن کدی که با بک‌اند حرف می‌زند، این‌ها را چک کن:

1. **هیچ کامپوننتی مستقیماً `axios`/`fetch`/`XMLHttpRequest` صدا نمی‌زند.**
   همیشه با `useQuery`/`useMutation` که از پشت لایه‌ی Endpoint (لایه‌ی ۲) رد
   می‌شود؛ و کوئری/میوتیشن پشت هیچ هوک سفارشی یا wrapper قایم نمی‌شود.
2. **هر endpoint دقیقاً یک‌بار تعریف می‌شود.** قبل از نوشتن یک تابع جدید در
   لایه‌ی Endpoint، جست‌وجو کن که آیا از قبل چیزی مشابه (همان url/method) وجود
   دارد یا نه.
3. **منطق نرمال‌سازی خطا فقط در یک جا زندگی می‌کند** (`mapError`)، و هر
   `queryFn`/`mutationFn` در `withMappedError` پیچیده می‌شود. هیچ کامپوننت یا
   endpoint دیگری نباید دوباره منطق تشخیص ۴۰۱/۵۰۲/timeout را از نو بنویسد،
   و `endpoints.ts` باید کاملاً از مفاهیم React Query (queryKey/useQuery) پاک بماند.
4. **توکن/session فقط در لایه‌ی transport تزریق می‌شود** (interceptor)، نه در
   endpoint و نه در کامپوننت.
5. **آپلود فایل هم از همین مسیر رد می‌شود** — یعنی حتی برای `multipart/form-data`
   باز هم از همان `httpClient.call` و از پشت همان هوک عبور می‌کند، نه یک مسیر
   جداگانه‌ی دستی.
6. **نام‌گذاری یکدست:** `XxxEndpoints.actionName` برای لایه‌ی ۲، فعل+اسم برای
   نام اکشن‌ها (`getX`, `createX`, `updateX`, `deleteX`, `activateX`).
7. اگر یک endpoint در حال تکرار در چند فایل است، این یک **بوی بد کد** است —
   باید به لایه‌ی مشترک منتقل شود، نه اینکه هرجا دوباره نوشته شود.

---

## استثناهای مجاز (این‌ها نقض قانون نیستند)

- **Server-side rendering / Server Components** که مستقیم به یک منبع داده‌ی
  جدا و بدون‌نیاز-به-auth (مثلاً یک CMS عمومی، یک API عمومی سوم‌شخص) با
  `fetch` خام و کش‌گذاری native فریم‌ورک (مثل `next: { revalidate }`) وصل
  می‌شوند — به شرطی که این منبع داده کاملاً از بک‌اند اصلی و احراز-هویت‌شده‌ی
  اپ جدا باشد.
- **Route Handlers / API Routes خودِ فرانت‌اند** (مثلاً یک پروکسی سمت سرور که
  فقط برای مخفی‌کردن یک کلید API یا دور زدن CORS نوشته شده) — این‌ها خودشان
  در واقع بخشی از "بک‌اند" محسوب می‌شوند، نه کامپوننت UI، پس مجازند مستقیم
  فچ کنند.

اگر شک داری که یک مورد استثناست یا نه، سؤال کلیدی این است: *"آیا این کد به
بک‌اند اصلی و احراز-هویت‌شده‌ی خودِ اپلیکیشن وصل می‌شود؟"* اگر بله → باید از
هر سه لایه رد شود. اگر نه (منبع داده‌ی عمومی/جدا) → استثناست.

---

## خلاصه‌ی یک‌خطی برای یادآوری سریع

> **کامپوننت (`useQuery`/`useMutation`) → Endpoint (request) → httpClient (transport+auth).**
> نرمال‌سازی خطا در `mapError`، اعمال‌شده با `withMappedError` دورِ هر
> `queryFn`/`mutationFn`. هوک قدیمی `useApi` حذف شده. هر کدی که این زنجیره را دور
> بزند، کوئری را پشت wrapper قایم کند، یا لایه‌ای را قاطی لایه‌ی دیگر کند، باید در
> کد ریویو رد شود.
