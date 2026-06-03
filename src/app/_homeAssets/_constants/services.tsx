import { IconGuarantee, IconMoney, IconSupport24, IconTruck } from "@/app/_components/icon/icons";

export const services = [
    {
        icon: <IconTruck width={26} height={26} className="stroke-primary" />,
        title: "تحویل سریع مدارک",
        desc: "ترجمه و ارسال مدارک شما در کوتاه‌ترین زمان ممکن، با امکان ارسال به سراسر کشور.",
    },
    {
        icon: <IconGuarantee width={26} height={26} className="stroke-primary" />,
        title: "ترجمه رسمی و معتبر",
        desc: "تمامی ترجمه‌ها توسط مترجمان رسمی قوه قضائیه و با مهر و امضای معتبر انجام می‌شود.",
    },
    {
        icon: <IconMoney width={26} height={26} className="stroke-primary" />,
        title: "قیمت‌گذاری شفاف",
        desc: "پیش از ثبت سفارش، هزینه دقیق ترجمه را به‌صورت آنلاین و لحظه‌ای مشاهده می‌کنید.",
    },
    {
        icon: <IconSupport24 width={26} height={26} className="stroke-primary" />,
        title: "پشتیبانی همیشگی",
        desc: "کارشناسان ما در تمام مراحل ثبت سفارش تا تحویل، کنار شما هستند.",
    },
]