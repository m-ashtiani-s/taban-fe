import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconCheck, IconClose } from "@/app/_components/icon/icons";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";

type PaymentResultSearchParams = {
	status?: string;
	refId?: string;
	orderId?: string;
	order?: string;
	reason?: string;
	code?: string;
};

const reasonText: Record<string, string> = {
	canceled: "پرداخت توسط شما لغو شد.",
	verify: "تایید پرداخت از سوی درگاه ناموفق بود. در صورت کسر وجه، مبلغ طی ۷۲ ساعت به حساب شما بازمی‌گردد.",
	notfound: "تراکنش موردنظر یافت نشد.",
	server: "خطای سیستمی هنگام ثبت پرداخت رخ داد. در صورت کسر وجه با پشتیبانی تماس بگیرید.",
	invalid: "اطلاعات پرداخت نامعتبر است.",
};

export default function PaymentResultPage({ searchParams }: { searchParams: PaymentResultSearchParams }) {
	const isSuccess = searchParams?.status === "success";
	const refId = searchParams?.refId;
	const orderId = searchParams?.orderId;
	const orderNumber = searchParams?.order;
	const reason = searchParams?.reason;
	const orderHref = orderId ? `/profile/orders/${orderId}` : "/profile/orders";

	return (
		<div className="container mx-auto px-4">
			<div className="max-w-xl mx-auto flex flex-col items-center text-center gap-6 py-16">
				{isSuccess ? (
					<div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
						<IconCheck className="stroke-success w-10 h-10" strokeWidth={2.4} />
					</div>
				) : (
					<div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
						<IconClose className="stroke-error w-9 h-9" strokeWidth={2.4} />
					</div>
				)}

				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold peyda text-primary">
						{isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
					</h1>
					<p className="text-sm text-neutral-500 leading-7">
						{isSuccess
							? "پرداخت سفارش شما با موفقیت تایید شد. می‌توانید وضعیت سفارش را از بخش سفارش‌ها دنبال کنید."
							: (reason && reasonText[reason]) || "پرداخت انجام نشد. می‌توانید از بخش سفارش‌ها دوباره تلاش کنید."}
					</p>
				</div>

				{(refId || orderNumber) && (
					<div className="w-full bg-white border border-neutral-200 rounded-2xl divide-y divide-neutral-100">
						{orderNumber && (
							<div className="flex items-center justify-between px-5 py-3.5 text-sm">
								<span className="text-neutral-500">شماره سفارش</span>
								<span className="font-semibold text-primary">#{convertToPersianNumber(orderNumber)}</span>
							</div>
						)}
						{refId && (
							<div className="flex items-center justify-between px-5 py-3.5 text-sm">
								<span className="text-neutral-500">کد رهگیری پرداخت</span>
								<span dir="ltr" className="font-semibold">{convertToPersianNumber(refId)}</span>
							</div>
						)}
					</div>
				)}

				<div className="flex items-center gap-3 pt-2">
					<TabanButton isLink href={orderHref}>
						{orderId ? "بازگشت به سفارش" : "مشاهده سفارش‌ها"}
					</TabanButton>
					<TabanButton variant="bordered" isLink href="/">
						بازگشت به خانه
					</TabanButton>
				</div>
			</div>
		</div>
	);
}
