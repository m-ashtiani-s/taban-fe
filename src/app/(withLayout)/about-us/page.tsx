import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/app/_components/common/reveal/reveal";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconTranslate } from "@/app/_components/icon/icons";
import CountUp from "./_components/countUp/countUp";
import { aboutValues, milestones } from "./_constants/content";

export const metadata: Metadata = {
    title: "درباره رسمی‌یاب",
    description:
        "با رسمی‌یاب آشنا شوید؛ دارالترجمه‌ی رسمی آنلاین با بیش از ۱۰ سال تجربه، شبکه‌ای از مترجمان رسمی قوه قضائیه و هزاران ترجمه‌ی موفق در سراسر کشور.",
    alternates: { canonical: "/about-us" },
    openGraph: {
        title: "درباره رسمی‌یاب",
        description: "دارالترجمه‌ی رسمی آنلاین با بیش از ۱۰ سال تجربه و شبکه‌ای از مترجمان رسمی.",
        url: "/about-us",
        type: "website",
    },
};

const stats = [
    { to: 10, prefix: "+", suffix: "", label: "سال تجربه" },
    { to: 5000, prefix: "+", suffix: "", label: "ترجمه‌ی موفق" },
    { to: 25, prefix: "+", suffix: "", label: "زبان زنده‌ی دنیا" },
    { to: 98, prefix: "", suffix: "٪", label: "رضایت مشتریان" },
];

export default function AboutUsPage() {
    return (
        <div className="bg-suppliment">
            {/* ── Hero ── */}
            <section className="relative bg-primary overflow-hidden">
                <img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0 opacity-40 pointer-events-none" />
                <img src="/images/footer/pattern2.svg" alt="" className="w-[420px] absolute left-0 top-0 opacity-40 pointer-events-none" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 text-white/[0.03] text-[180px] font-extrabold select-none pointer-events-none leading-none whitespace-nowrap max-lg:hidden peyda">
                    رسمی‌یاب
                </div>

                <div className="container max-lg:px-4 relative z-10 flex flex-col items-center text-center gap-6 pt-28 pb-20">
                    <Reveal y={16}>
                        <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                            <span className="h-px w-8 bg-secondary" />
                            داستان ما
                            <span className="h-px w-8 bg-secondary" />
                        </span>
                    </Reveal>
                    <Reveal y={16} delay={0.1}>
                        <h1 className="peyda text-[52px] max-xl:text-[42px] max-lg:text-3xl font-extrabold leading-tight">
                            <span className="text-white">ترجمه‌ی رسمی، </span>
                            <span className="text-secondary">ساده و مطمئن</span>
                        </h1>
                    </Reveal>
                    <Reveal y={16} delay={0.2}>
                        <p className="text-white/55 max-w-2xl leading-loose text-base">
                            رسمی‌یاب یک دارالترجمه‌ی رسمی آنلاین است؛ جایی که تجربه‌ی مترجمان رسمی قوه قضائیه با
                            تکنولوژی روز ترکیب شده تا ترجمه‌ی مدارک شما سریع، دقیق و بدون دردسر انجام شود.
                        </p>
                    </Reveal>
                    <Reveal y={16} delay={0.3}>
                        <div className="flex items-center gap-3 pt-2 max-sm:flex-col">
                            <TabanButton
                                variant="contained"
                                isLink
                                href="/new-order"
                                className="font-semibold !border-none rounded-xl flex items-center gap-2 !bg-secondary"
                            >
                                <IconTranslate stroke="black" strokeWidth={0} className="fill-white" />
                                شروع ترجمه آنلاین
                            </TabanButton>
                            <TabanButton
                                variant="bordered"
                                isLink
                                href="/contact-us"
                                className="font-semibold rounded-xl !border-white/30 !text-white hover:!bg-white/10"
                            >
                                تماس با ما
                            </TabanButton>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="relative z-20 -mt-12">
                <div className="container max-lg:px-4">
                    <Reveal>
                        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 grid grid-cols-4 max-md:grid-cols-2 divide-x divide-x-reverse divide-neutral-100">
                            {stats.map((s) => (
                                <div key={s.label} className="flex flex-col items-center justify-center gap-1 py-8 max-md:py-6">
                                    <span className="peyda text-primary font-extrabold text-3xl max-lg:text-2xl">
                                        <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                                    </span>
                                    <span className="text-neutral-500 text-sm">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Story ── */}
            <section className="py-24 max-lg:py-16">
                <div className="container max-lg:px-4">
                    <div className="flex items-center gap-16 max-lg:flex-col max-lg:gap-10">
                        <Reveal className="w-full flex flex-col gap-5">
                            <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                                <span className="h-px w-8 bg-secondary" />
                                ما که هستیم؟
                            </span>
                            <h2 className="peyda text-3xl max-lg:text-2xl font-bold text-primary leading-snug">
                                از یک دفتر کوچک تا <span className="text-secondary">دارالترجمه‌ی آنلاین</span>
                            </h2>
                            <p className="text-neutral-600 leading-8">
                                مسیر ما با یک باور ساده شروع شد: ترجمه‌ی رسمی نباید پیچیده، کند یا پر از رفت‌وآمد باشد.
                                سال‌ها تجربه در ترجمه‌ی اسناد حقوقی، تحصیلی و هویتی به ما نشان داد که مردم به چیزی
                                فراتر از یک مهر نیاز دارند؛ آن‌ها به آرامش خاطر نیاز دارند.
                            </p>
                            <p className="text-neutral-600 leading-8">
                                امروز رسمی‌یاب با شبکه‌ای از مترجمان رسمی قوه قضائیه و یک سامانه‌ی آنلاین کامل، تمام
                                مراحل ثبت سفارش تا تحویل مدرک را در بستری شفاف و قابل پیگیری انجام می‌دهد؛ بدون اینکه
                                لازم باشد حتی یک بار از خانه بیرون بیایید.
                            </p>
                            <div className="flex">
                                <TabanButton isLink href="/blog" className="rounded-xl">
                                    مطالعه‌ی مجله‌ی ما
                                </TabanButton>
                            </div>
                        </Reveal>

                        <Reveal delay={0.15} className="w-full">
                            <div className="relative">
                                <div className="absolute -top-5 -right-5 w-28 h-28 bg-secondary/15 rounded-3xl max-lg:hidden" />
                                <div className="absolute -bottom-5 -left-5 w-36 h-36 border-2 border-secondary/20 rounded-3xl max-lg:hidden" />
                                <div className="relative bg-primary rounded-3xl p-10 overflow-hidden">
                                    <img src="/images/footer/pattern2.svg" alt="" className="w-64 absolute left-0 bottom-0 opacity-30 pointer-events-none" />
                                    <div className="relative z-10 flex flex-col gap-6">
                                        <Image src="/images/logo2White.svg" alt="رسمی‌یاب" width={72} height={72} className="w-16" />
                                        <p className="peyda text-white text-xl leading-9 font-medium">
                                            «هدف ما این است که ترجمه‌ی رسمی را به ساده‌ترین و مطمئن‌ترین تجربه‌ی
                                            ممکن تبدیل کنیم.»
                                        </p>
                                        <div className="h-px w-full bg-white/10" />
                                        <div className="text-secondary text-sm">— تیم رسمی‌یاب</div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ── Mission / Vision ── */}
            <section className="pb-24 max-lg:pb-16">
                <div className="container max-lg:px-4 grid grid-cols-2 max-lg:grid-cols-1 gap-6">
                    <Reveal>
                        <div className="h-full bg-white rounded-3xl border border-neutral-100 p-8 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 duration-200">
                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="6" />
                                    <circle cx="12" cy="12" r="2" />
                                </svg>
                            </div>
                            <h3 className="peyda text-xl font-bold text-primary">مأموریت ما</h3>
                            <p className="text-neutral-600 leading-8">
                                ساده‌سازی ترجمه‌ی رسمی برای همه‌ی مردم؛ با حذف بوروکراسی، شفافیت کامل در قیمت و زمان،
                                و تحویل مدارکی که بدون نگرانی در هر سفارت و سازمانی پذیرفته می‌شوند.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={0.12}>
                        <div className="h-full bg-white rounded-3xl border border-neutral-100 p-8 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 duration-200">
                            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <h3 className="peyda text-xl font-bold text-primary">چشم‌انداز ما</h3>
                            <p className="text-neutral-600 leading-8">
                                تبدیل‌شدن به مرجع نخست ترجمه‌ی رسمی آنلاین در ایران؛ جایی که هر فرد یا سازمانی برای
                                ترجمه‌ی مدارک خود، اولین نامی که به ذهنش می‌رسد رسمی‌یاب باشد.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="bg-white border-y border-neutral-100 py-24 max-lg:py-16">
                <div className="container max-lg:px-4">
                    <Reveal className="flex flex-col items-center text-center gap-3 mb-12">
                        <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                            <span className="h-px w-8 bg-secondary" />
                            ارزش‌های ما
                            <span className="h-px w-8 bg-secondary" />
                        </span>
                        <h2 className="peyda text-3xl max-lg:text-2xl font-bold text-primary">به چه چیزی پایبندیم</h2>
                        <p className="text-neutral-500 text-sm max-w-md leading-7">
                            اصولی که در هر سفارش، از کوچک‌ترین مدرک تا بزرگ‌ترین پروژه‌ی سازمانی، رعایت می‌کنیم.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
                        {aboutValues.map((v, i) => (
                            <Reveal key={v.title} delay={i * 0.07}>
                                <div className="group h-full bg-suppliment/60 border border-neutral-100 rounded-2xl p-6 flex flex-col gap-3 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 duration-200">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:[&_svg]:stroke-white group-hover:[&_svg]:fill-white flex items-center justify-center duration-200">
                                        {v.icon}
                                    </div>
                                    <h3 className="peyda font-semibold text-lg text-primary">{v.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-7">{v.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Timeline ── */}
            <section className="py-24 max-lg:py-16">
                <div className="container max-lg:px-4">
                    <Reveal className="flex flex-col items-center text-center gap-3 mb-14">
                        <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                            <span className="h-px w-8 bg-secondary" />
                            مسیر ما
                            <span className="h-px w-8 bg-secondary" />
                        </span>
                        <h2 className="peyda text-3xl max-lg:text-2xl font-bold text-primary">از کجا تا اینجا</h2>
                    </Reveal>

                    <div className="relative max-w-3xl mx-auto">
                        {/* خط عمودی تایم‌لاین */}
                        <div className="absolute top-2 bottom-2 right-[15px] md:right-1/2 md:translate-x-1/2 w-px bg-gradient-to-b from-secondary/10 via-secondary/40 to-secondary/10" />

                        <div className="flex flex-col gap-10">
                            {milestones.map((m, i) => (
                                <Reveal key={m.year} delay={i * 0.08}>
                                    <div className={`relative flex items-center gap-6 md:gap-0 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                                        {/* نقطه */}
                                        <div className="absolute right-0 md:right-1/2 md:translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-secondary flex items-center justify-center z-10 shrink-0">
                                            <span className="w-3 h-3 rounded-full bg-secondary" />
                                        </div>

                                        {/* فاصله سمت مقابل در دسکتاپ */}
                                        <div className="hidden md:block md:w-1/2" />

                                        {/* کارت */}
                                        <div className={`mr-12 md:mr-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                                            <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm hover:shadow-md duration-200">
                                                <span className="peyda inline-block text-secondary font-extrabold text-lg mb-1">{m.year}</span>
                                                <h3 className="peyda font-semibold text-primary">{m.title}</h3>
                                                <p className="text-sm text-neutral-500 leading-7 mt-1">{m.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="pb-24 max-lg:pb-16">
                <div className="container max-lg:px-4">
                    <Reveal>
                        <div className="relative bg-primary rounded-3xl overflow-hidden px-10 py-14 max-lg:px-6 max-lg:py-10">
                            <img src="/images/footer/pattern1.svg" alt="" className="w-80 absolute right-0 top-0 opacity-30 pointer-events-none" />
                            <img src="/images/footer/pattern2.svg" alt="" className="w-80 absolute left-0 bottom-0 opacity-30 pointer-events-none" />
                            <div className="relative z-10 flex items-center justify-between gap-8 max-lg:flex-col max-lg:text-center">
                                <div className="flex flex-col gap-3">
                                    <h2 className="peyda text-white text-3xl max-lg:text-2xl font-bold">
                                        آماده‌اید ترجمه‌ی رسمی را آسان تجربه کنید؟
                                    </h2>
                                    <p className="text-white/55 leading-8 max-w-xl">
                                        همین حالا سفارش خود را ثبت کنید و بگذارید بقیه‌ی کارها را ما انجام دهیم.
                                    </p>
                                </div>
                                <TabanButton
                                    variant="contained"
                                    isLink
                                    href="/new-order"
                                    className="font-semibold !border-none rounded-xl flex items-center gap-2 !bg-secondary shrink-0"
                                >
                                    <IconTranslate stroke="black" strokeWidth={0} className="fill-white" />
                                    شروع ترجمه آنلاین
                                </TabanButton>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
