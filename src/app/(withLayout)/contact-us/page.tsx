import { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/app/_components/common/reveal/reveal";
import { IconWhatsapp } from "@/app/_components/icon/icons";
import JsonLd from "@/app/_components/jsonLd/jsonLd";
import SocialLinks from "@/app/_components/socialLinks/socialLinks";
import {
    OPENING_HOURS,
    ORGANIZATION_ID,
    SITE_BASE_URL,
    SITE_CONTACT,
    SITE_LOGO,
    SITE_NAME,
    SOCIAL_PROFILES,
    absoluteUrl,
    buildMetadata,
    buildPostalAddress,
    telHref,
    whatsappHref,
} from "@/config/site";
import ContactForm from "./_components/contactForm/contactForm";

export const metadata: Metadata = buildMetadata({
    title: "تماس با ما",
    description:
        "راه‌های ارتباط با دارالترجمه‌ی رسمی رسمی‌یاب؛ تلفن، ایمیل، آدرس و فرم تماس. کارشناسان ما آماده‌ی پاسخ‌گویی به سوالات شما درباره‌ی ترجمه‌ی رسمی مدارک هستند.",
    path: "/contact-us",
});

const channels = [
    {
        label: "تماس تلفنی",
        value: SITE_CONTACT.phone.display,
        hint: `${OPENING_HOURS[0].label}، ${OPENING_HOURS[0].display}`,
        href: telHref(SITE_CONTACT.phone.e164),
        trackChannel: "phone",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
            </svg>
        ),
    },
    {
        label: "پست الکترونیک",
        value: SITE_CONTACT.email,
        hint: "پاسخ در کمتر از یک روز کاری",
        href: `mailto:${SITE_CONTACT.email}`,
        trackChannel: "email",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        ),
    },
    {
        label: "واتساپ",
        value: SITE_CONTACT.whatsapp.display,
        hint: "پشتیبانی سریع پیام‌رسان",
        href: whatsappHref(SITE_CONTACT.whatsapp.e164),
        trackChannel: "whatsapp",
        icon: <IconWhatsapp className="fill-secondary" strokeWidth={0.8} width={24} height={24} />,
    },
    {
        label: "نشانی دفتر",
        value: SITE_CONTACT.address.full,
        hint: "",
        href: "#location",
        trackChannel: null,
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
];

const hours = [
    ...OPENING_HOURS.map((h) => ({ day: h.label, time: h.display })),
    { day: "جمعه و تعطیلات", time: "ثبت سفارش آنلاین ۲۴ ساعته" },
];

const officeLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_BASE_URL}/contact-us#office`,
    name: SITE_NAME,
    url: absoluteUrl("/contact-us"),
    image: absoluteUrl(SITE_LOGO.path),
    telephone: SITE_CONTACT.phone.e164,
    email: SITE_CONTACT.email,
    address: buildPostalAddress(),
    areaServed: "IR",
    openingHoursSpecification: OPENING_HOURS.map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
    })),
    parentOrganization: { "@id": ORGANIZATION_ID },
};

export default function ContactUsPage() {
    return (
        <div className="bg-suppliment">
            <JsonLd data={officeLd} />
            {/* ── Hero ── */}
            <section className="relative bg-primary overflow-hidden">
                <img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0 opacity-40 pointer-events-none" />
                <img src="/images/footer/pattern2.svg" alt="" className="w-[420px] absolute left-0 top-0 opacity-40 pointer-events-none" />

                <div className="container max-lg:px-4 relative z-10 flex flex-col items-center text-center gap-6 pt-28 pb-24">
                    <Reveal y={16}>
                        <span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
                            <span className="h-px w-8 bg-secondary" />
                            در ارتباط باشیم
                            <span className="h-px w-8 bg-secondary" />
                        </span>
                    </Reveal>
                    <Reveal y={16} delay={0.1}>
                        <h1 className="peyda text-[52px] max-xl:text-[42px] max-lg:text-3xl font-extrabold leading-tight">
                            <span className="text-white">هر سؤالی دارید، </span>
                            <span className="text-secondary">ما این‌جاییم</span>
                        </h1>
                    </Reveal>
                    <Reveal y={16} delay={0.2}>
                        <p className="text-white/55 max-w-2xl leading-loose text-base">
                            از مشاوره برای انتخاب نوع ترجمه تا پیگیری سفارش؛ کارشناسان رسمی‌یاب از راه‌های مختلف
                            آماده‌ی پاسخ‌گویی به شما هستند.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ── Channels ── */}
            <section className="relative z-20 -mt-14">
                <div className="container max-lg:px-4">
                    <div className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
                        {channels.map((c, i) => (
                            <Reveal key={c.label} delay={i * 0.08}>
                                <a
                                    href={c.href}
                                    target={c.href.startsWith("http") ? "_blank" : undefined}
                                    rel={c.href.startsWith("http") ? "noopener" : undefined}
                                    data-track-event={c.trackChannel ? "contact_click" : undefined}
                                    data-track-channel={c.trackChannel ?? undefined}
                                    data-track-source="contact_page"
                                    className="group h-full bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 duration-200"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center duration-200">
                                        {c.icon}
                                    </div>
                                    <span className="text-neutral-500 text-xs">{c.label}</span>
                                    <span className="peyda font-bold text-primary dir-ltr text-right group-hover:text-secondary duration-200">{c.value}</span>
                                    <span className="text-neutral-400 text-xs leading-6">{c.hint}</span>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Form + Info ── */}
            <section className="py-24 max-lg:py-16">
                <div className="container max-lg:px-4">
                    <div className="grid grid-cols-5 max-lg:grid-cols-1 gap-8">
                        {/* فرم */}
                        <Reveal className="col-span-3 max-lg:col-span-1">
                            <ContactForm />
                        </Reveal>

                        {/* اطلاعات کناری */}
                        <div className="col-span-2 max-lg:col-span-1 flex flex-col gap-6">
                            {/* ساعات کاری */}
                            <Reveal delay={0.1}>
                                <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-7 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a3047" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 6v6l4 2" />
                                            </svg>
                                        </span>
                                        <h2 className="peyda font-bold text-primary">ساعات پاسخ‌گویی</h2>
                                    </div>
                                    <div className="flex flex-col divide-y divide-neutral-100">
                                        {hours.map((h) => (
                                            <div key={h.day} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                                <span className="text-neutral-600 text-sm">{h.day}</span>
                                                <span className="text-primary text-sm font-medium">{h.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            {/* نقشه/نشانی */}
                            <Reveal delay={0.18}>
                                <div id="location" className="relative bg-primary rounded-3xl overflow-hidden p-7 flex flex-col gap-4 scroll-mt-24">
                                    <img src="/images/footer/pattern2.svg" alt="" className="w-48 absolute left-0 bottom-0 opacity-25 pointer-events-none" />
                                    <div className="relative z-10 flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b8a27c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </span>
                                        <h2 className="peyda font-bold text-white">نشانی دفتر مرکزی</h2>
                                    </div>
                                    <address className="relative z-10 text-white/60 leading-8 text-sm not-italic">{SITE_CONTACT.address.full}</address>
                                    {SOCIAL_PROFILES.length > 0 && (
                                        <>
                                            <div className="relative z-10 h-px bg-white/10" />
                                            <div className="relative z-10 flex items-center gap-3">
                                                <span className="text-white/50 text-sm">ما را دنبال کنید:</span>
                                                <div className="flex items-center gap-2">
                                                    <SocialLinks
                                                        tone="white"
                                                        iconSize={22}
                                                        itemClassName="bg-secondary h-9 w-9 rounded-xl flex items-center justify-center hover:opacity-90 duration-200"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="pb-24 max-lg:pb-16">
                <div className="container max-lg:px-4">
                    <Reveal>
                        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm px-10 py-12 max-lg:px-6 max-lg:py-8 flex items-center justify-between gap-8 max-lg:flex-col max-lg:text-center">
                            <div className="flex flex-col gap-2">
                                <h2 className="peyda text-2xl max-lg:text-xl font-bold text-primary">
                                    منتظر چه هستید؟ ترجمه را همین حالا شروع کنید.
                                </h2>
                                <p className="text-neutral-500 leading-8">
                                    بدون مراجعه‌ی حضوری، سفارش خود را ثبت کنید و قیمت دقیق را لحظه‌ای ببینید.
                                </p>
                            </div>
                            <Link
                                href="/new-order"
                                data-track-event="start_order"
                                data-track-source="contact_cta"
                                className="shrink-0 flex items-center justify-center h-12 px-8 rounded-xl bg-secondary text-white text-sm font-semibold hover:opacity-90 duration-200"
                            >
                                ثبت سفارش ترجمه
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    );
}
