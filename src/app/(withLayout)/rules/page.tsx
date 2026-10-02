import { Metadata } from "next";
import Link from "next/link";
import { SITE_CONTACT, buildMetadata, telHref } from "@/config/site";
import { convertToJalaliDate } from "@/utils/dateConverts";
import { RULES_SECTIONS, RULES_UPDATED_AT } from "./_constants/rulesContent";

export const metadata: Metadata = buildMetadata({
	title: "قوانین و مقررات و حریم خصوصی",
	description: "قوانین استفاده از رسمی‌یاب؛ شرایط ثبت سفارش ترجمه رسمی، هزینه و پرداخت، تحویل ترجمه، لغو سفارش و نحوه‌ی نگه‌داری اطلاعات و مدارک کاربران.",
	path: "/rules",
});

export default function RulesPage() {
	return (
		<div className="bg-suppliment">
			<section className="bg-primary">
				<div className="container max-lg:px-4 flex flex-col items-center text-center gap-4 pt-24 pb-16">
					<h1 className="peyda text-white text-[40px] max-lg:text-3xl font-extrabold leading-tight">قوانین و مقررات رسمی‌یاب</h1>
					<p className="text-white/60 text-sm">
						آخرین بازبینی: <time dateTime={RULES_UPDATED_AT}>{convertToJalaliDate(RULES_UPDATED_AT)}</time>
					</p>
				</div>
			</section>
			<section className="py-12 lg:py-16">
				<div className="container max-lg:px-4">
					<div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 max-lg:p-5 flex flex-col gap-8">
						{RULES_SECTIONS.map((section) => (
							<section key={section.heading} className="flex flex-col gap-3">
								<h2 className="peyda text-primary font-extrabold text-xl">{section.heading}</h2>
								<ul className="list-disc pr-6 flex flex-col gap-2 text-neutral-700 leading-8">
									{section.items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							</section>
						))}
						<section className="flex flex-col gap-3">
							<h2 className="peyda text-primary font-extrabold text-xl">ارتباط با ما</h2>
							<p className="text-neutral-700 leading-8">
								برای هر پرسش درباره‌ی این قوانین با شماره‌ی{" "}
								<a href={telHref(SITE_CONTACT.phone.e164)} className="text-secondary" dir="ltr">
									{SITE_CONTACT.phone.display}
								</a>{" "}
								یا ایمیل{" "}
								<a href={`mailto:${SITE_CONTACT.email}`} className="text-secondary">
									{SITE_CONTACT.email}
								</a>{" "}
								تماس بگیرید یا از صفحه‌ی{" "}
								<Link href="/contact-us" className="text-secondary">
									تماس با ما
								</Link>{" "}
								استفاده کنید.
							</p>
						</section>
					</div>
				</div>
			</section>
		</div>
	);
}
