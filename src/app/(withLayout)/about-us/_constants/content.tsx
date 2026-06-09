import {
    IconGuarantee,
    IconJustice,
    IconMoney,
    IconSupport24,
    IconTranslate,
    IconTruck,
} from "@/app/_components/icon/icons";
import { ReactNode } from "react";

export type AboutValue = {
    icon: ReactNode;
    title: string;
    desc: string;
};

export const aboutValues: AboutValue[] = [
    {
        icon: <IconJustice width={26} height={26} className="stroke-primary" />,
        title: "اعتبار رسمی و قانونی",
        desc: "همه‌ی ترجمه‌ها توسط مترجمان رسمی قوه قضائیه و با مهر و امضای معتبر انجام می‌شود.",
    },
    {
        icon: <IconGuarantee width={26} height={26} className="stroke-primary" />,
        title: "دقت و امانت‌داری",
        desc: "هر مدرک پیش از تحویل، بازبینی و کنترل کیفی می‌شود تا کوچک‌ترین خطایی رخ ندهد.",
    },
    {
        icon: <IconTruck width={26} height={26} className="stroke-primary" />,
        title: "سرعت در تحویل",
        desc: "فرایند آنلاین، زمان ترجمه را کوتاه می‌کند و مدارک به سراسر کشور ارسال می‌شوند.",
    },
    {
        icon: <IconMoney width={26} height={26} className="stroke-primary" />,
        title: "شفافیت کامل قیمت",
        desc: "هزینه‌ی دقیق ترجمه را پیش از پرداخت، لحظه‌ای و بدون هزینه‌ی پنهان می‌بینید.",
    },
    {
        icon: <IconSupport24 width={26} height={26} className="stroke-primary" />,
        title: "پشتیبانی واقعی",
        desc: "کارشناسان ما از لحظه‌ی ثبت سفارش تا تحویل نهایی، همراه شما هستند.",
    },
    {
        icon: <IconTranslate width={26} height={26} strokeWidth={0} className="fill-primary" />,
        title: "تنوع زبانی",
        desc: "ترجمه‌ی رسمی مدارک در بیش از ۲۵ زبان زنده‌ی دنیا، متناسب با مقصد شما.",
    },
];

export type Milestone = {
    year: string;
    title: string;
    desc: string;
};

export const milestones: Milestone[] = [
    {
        year: "۱۳۹۳",
        title: "آغاز راه",
        desc: "رسمی‌یاب به‌عنوان یک دارالترجمه‌ی حضوری، کار خود را با تمرکز بر کیفیت آغاز کرد.",
    },
    {
        year: "۱۳۹۷",
        title: "ورود به دنیای آنلاین",
        desc: "سامانه‌ی ثبت سفارش آنلاین راه‌اندازی شد تا ترجمه‌ی رسمی از هر نقطه‌ی کشور ممکن شود.",
    },
    {
        year: "۱۴۰۰",
        title: "گسترش زبان‌ها",
        desc: "شبکه‌ی مترجمان رسمی به بیش از ۲۵ زبان رسید و دامنه‌ی خدمات گسترده‌تر شد.",
    },
    {
        year: "۱۴۰۲",
        title: "پنل سازمانی",
        desc: "پنل اختصاصی مشتریان سازمانی برای مدیریت سفارش‌های انبوه شرکت‌ها معرفی شد.",
    },
    {
        year: "امروز",
        title: "همراه هزاران مشتری",
        desc: "با هزاران ترجمه‌ی موفق، رسمی‌یاب به یکی از انتخاب‌های مطمئن ترجمه‌ی رسمی تبدیل شده است.",
    },
];
