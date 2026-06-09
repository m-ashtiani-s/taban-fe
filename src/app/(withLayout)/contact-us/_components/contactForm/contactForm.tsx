"use client";

import { useEffect, useState } from "react";
import TabanInput from "@/app/_components/common/tabanInput/tabanInput";
import TabanTextarea from "@/app/_components/common/tabanTextarea/tabanTextarea";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { useNotificationStore } from "@/stores/notification.store";
import { mobileRegex } from "@/utils/mobileRegex";

type FormValues = {
    fullName?: string;
    mobile?: string;
    subject?: string;
    message?: string;
};

type FieldError = { item: keyof FormValues; message: string };

const SUBJECTS = ["ثبت سفارش ترجمه", "پیگیری سفارش", "همکاری سازمانی", "انتقاد و پیشنهاد", "سایر موارد"];

export default function ContactForm() {
    const showNotification = useNotificationStore((state) => state.showNotification);

    const [values, setValues] = useState<FormValues>({});
    const [errors, setErrors] = useState<FieldError[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const validate = (v: FormValues): FieldError[] => {
        const e: FieldError[] = [];
        if (!v.fullName?.trim()) e.push({ item: "fullName", message: "نام و نام خانوادگی الزامی است" });
        if (!v.mobile?.trim()) {
            e.push({ item: "mobile", message: "شماره موبایل الزامی است" });
        } else if (!mobileRegex.test(v.mobile.trim())) {
            e.push({ item: "mobile", message: "شماره موبایل معتبر نیست" });
        }
        if (!v.message?.trim()) e.push({ item: "message", message: "متن پیام را وارد کنید" });
        return e;
    };

    const findError = (name: keyof FormValues) => errors.find((x) => x.item === name) || null;

    // اعتبارسنجی زنده پس از اولین تلاش برای ارسال
    useEffect(() => {
        if (submitted) setErrors(validate(values));
    }, [values]);

    const handleSubmit = async () => {
        setSubmitted(true);
        const newErrors = validate(values);
        setErrors(newErrors);
        if (newErrors.length > 0) return;

        setLoading(true);
        try {
            // TODO: اتصال به اندپوینت واقعی ثبت پیام تماس در بک‌اند
            await new Promise((res) => setTimeout(res, 900));
            setDone(true);
            showNotification({ message: "پیام شما با موفقیت ثبت شد. به‌زودی با شما تماس می‌گیریم.", type: "success" });
        } catch {
            showNotification({ message: "ثبت پیام با خطا مواجه شد. لطفاً دوباره تلاش کنید.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-10 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#07a034" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </div>
                <h3 className="peyda text-xl font-bold text-primary">پیام شما ثبت شد!</h3>
                <p className="text-neutral-500 leading-7 max-w-sm">
                    از تماس شما سپاسگزاریم. کارشناسان رسمی‌یاب در اولین فرصت پاسخ‌گوی شما خواهند بود.
                </p>
                <TabanButton
                    variant="bordered"
                    onClick={() => {
                        setValues({});
                        setSubmitted(false);
                        setErrors([]);
                        setDone(false);
                    }}
                    className="rounded-xl mt-2"
                >
                    ارسال پیام جدید
                </TabanButton>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 max-lg:p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <h3 className="peyda text-xl font-bold text-primary">برای ما پیام بگذارید</h3>
                <p className="text-neutral-500 text-sm">فرم زیر را پر کنید؛ در کوتاه‌ترین زمان با شما تماس می‌گیریم.</p>
            </div>

            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5">
                <div className="flex flex-col">
                    <TabanInput
                        value={values.fullName}
                        setValue={setValues}
                        name="fullName"
                        groupMode
                        placeholder="نام و نام خانوادگی *"
                    />
                    {!!findError("fullName") && <span className="text-error text-xs mt-1">{findError("fullName")?.message}</span>}
                </div>
                <div className="flex flex-col">
                    <TabanInput
                        value={values.mobile}
                        setValue={setValues}
                        name="mobile"
                        groupMode
                        isLtr
                        isNumber
                        placeholder="شماره موبایل *"
                    />
                    {!!findError("mobile") && <span className="text-error text-xs mt-1">{findError("mobile")?.message}</span>}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm text-neutral-500">موضوع پیام</span>
                <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setValues((prev) => ({ ...prev, subject: s }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                values.subject === s
                                    ? "bg-primary border-primary text-white"
                                    : "bg-suppliment border-neutral-200 text-neutral-600 hover:border-primary/40 hover:text-primary"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                <TabanTextarea
                    value={values.message}
                    setValue={setValues}
                    name="message"
                    groupMode
                    minHeight={120}
                    placeholder="متن پیام *"
                />
                {!!findError("message") && <span className="text-error text-xs mt-1">{findError("message")?.message}</span>}
            </div>

            <div className="flex justify-end">
                <TabanButton
                    onClick={handleSubmit}
                    isLoading={loading}
                    loadingText="در حال ارسال ..."
                    className="rounded-xl !bg-secondary !border-none font-semibold px-8"
                >
                    ارسال پیام
                </TabanButton>
            </div>
        </div>
    );
}
