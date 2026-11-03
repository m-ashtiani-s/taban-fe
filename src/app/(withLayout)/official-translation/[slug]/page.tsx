import { Fragment, ReactNode } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOC_HUB, DOC_LANDINGS, DOC_LANDINGS_BASE_PATH, DOC_LANDING_TRUST_POINTS, docLandingPath } from "@/config/docLandings";
import { BreadcrumbItem, ORGANIZATION_ID, absoluteUrl, buildBreadcrumbList, buildFaqPage, buildMetadata } from "@/config/site";
import { getBuildableDocSlugs, getLiveDocLandings, isDocHubRenderable, resolveDocLanding } from "@/server/docLandings";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import Breadcrumb from "@/app/_components/breadcrumb/breadcrumb";
import Faq from "@/app/_components/faq/faq";
import JsonLd from "@/app/_components/jsonLd/jsonLd";
import { IconArrow, IconGuarantee, IconJustice, IconMoney, IconTranslate, IconTruck } from "@/app/_components/icon/icons";
import { convertToJalaliDate } from "@/utils/dateConverts";
import { convertToPersianNumber } from "@/utils/enNumberToPersian";
import { DocLandingSection } from "@/types/docLanding.type";
import LivePrice from "../_components/livePrice/livePrice";
import { renderRichText } from "../_utils/renderRichText";

type DocLandingPageProps = { params: { slug: string } };

/** هر H2 با H3های زیرش یک کارت می‌شود تا صفحه‌ی بلند ریتم و نقطه‌ی توقف داشته باشد */
type SectionGroup = { id: string; heading: DocLandingSection; children: DocLandingSection[] };

const TRUST_ICONS: Record<(typeof DOC_LANDING_TRUST_POINTS)[number]["icon"], ReactNode> = {
	justice: <IconJustice width={24} height={24} className="stroke-secondary" />,
	guarantee: <IconGuarantee width={24} height={24} className="stroke-secondary" />,
	money: <IconMoney width={24} height={24} className="stroke-secondary" />,
	truck: <IconTruck width={24} height={24} className="stroke-secondary" />,
};

function groupSections(sections: DocLandingSection[]): SectionGroup[] {
	const groups: SectionGroup[] = [];
	sections.forEach((section) => {
		const last = groups[groups.length - 1];
		if (section.level === 3 && last) last.children.push(section);
		else groups.push({ id: `bakhsh-${groups.length + 1}`, heading: section, children: [] });
	});
	return groups;
}

// مسیر عمومی فارسی است (/ترجمه-رسمی/<اسلاگ>) و با rewrite به این روت لاتین می‌رسد چون Next 14 پوشه‌ی
// غیرلاتین را match نمی‌کند. اسلاگ ممکن است انکدشده برسد، پس به‌جای dynamicParams=false، اسلاگ ناشناخته
// یا مدرکی که در سامانه نیست در resolveDocLanding به notFound می‌رسد. وجود مدرک هر ساعت بازبینی می‌شود.
export const revalidate = 3600;

export function generateStaticParams() {
	return getBuildableDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: DocLandingPageProps): Promise<Metadata> {
	const landing = await resolveDocLanding(params.slug);
	if (!landing) return { title: "صفحه یافت نشد", robots: { index: false, follow: false } };

	return buildMetadata({
		title: landing.seoTitle,
		absoluteTitle: true,
		description: landing.metaDescription,
		path: docLandingPath(landing.slug),
		robots: landing.isPreview ? { index: false, follow: false } : undefined,
	});
}

export default async function DocLandingPage({ params }: DocLandingPageProps) {
	const landing = await resolveDocLanding(params.slug);
	if (!landing) notFound();

	const liveLandings = await getLiveDocLandings();

	const path = docLandingPath(landing.slug);
	const hubIsLinkable = DOC_HUB.status === "published" || (landing.isPreview && isDocHubRenderable());
	const breadcrumbItems: BreadcrumbItem[] = [
		{ name: "خانه", path: "/" },
		...(hubIsLinkable ? [{ name: "ترجمه رسمی", path: DOC_LANDINGS_BASE_PATH }] : []),
		{ name: landing.name, path },
	];
	const relatedPool = landing.isPreview ? DOC_LANDINGS : liveLandings;
	const related = landing.relatedSlugs
		.map((slug) => relatedPool.find((item) => item.slug === slug))
		.filter((item): item is (typeof relatedPool)[number] => !!item);
	const answeredFaqs = landing.faqs.filter((faq) => faq.answer.trim());
	const faqItems = landing.isPreview ? landing.faqs.map((faq) => ({ ...faq, answer: faq.answer || "پاسخ در دست نگارش است." })) : answeredFaqs;
	// بخش نمونه‌ی ترجمه بدون تصویر واقعی در صفحه‌ی منتشرشده کلاً حذف می‌شود (تیتر بی‌محتوا نمی‌ماند)
	const visibleSections = landing.sections.filter((section) => section.widget !== "sample" || !!landing.sampleImage || landing.isPreview);
	const groups = groupSections(visibleSections);
	const priceGroup = groups.find((group) => group.heading.widget === "price" || group.children.some((child) => child.widget === "price"));
	const orderHref = landing.translationItemId ? `/new-order?item=${landing.translationItemId}` : "/new-order";
	const draftPlaceholder = <p className="text-neutral-400 italic">متن این بخش در دست نگارش است.</p>;
	const tocItems = [...groups.map((group) => ({ id: group.id, title: group.heading.heading })), ...(faqItems.length ? [{ id: "porsesh-ha", title: "پرسش‌های متداول" }] : [])];

	const serviceLd = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: landing.keyword,
		serviceType: landing.serviceType,
		description: landing.metaDescription,
		url: absoluteUrl(path),
		provider: { "@id": ORGANIZATION_ID },
		areaServed: "IR",
	};

	const livePrice = <LivePrice translationItemId={landing.translationItemId} items={landing.items} documentName={landing.name} sourcePage={path} />;

	const renderBody = (section: DocLandingSection) => (
		<>
			{section.body ? renderRichText(section.body) : landing.isPreview && draftPlaceholder}
			{section.widget === "price" && livePrice}
			{section.widget === "sample" &&
				(landing.sampleImage ? (
					<figure className="my-6">
						<Image
							src={landing.sampleImage.src}
							alt={landing.sampleImage.alt}
							width={landing.sampleImage.width}
							height={landing.sampleImage.height}
							sizes="(max-width: 768px) 100vw, 720px"
							className="rounded-xl border border-neutral-100 w-full h-auto"
						/>
						<figcaption className="text-xs text-neutral-500 mt-2 text-center">{landing.sampleImage.alt}</figcaption>
					</figure>
				) : (
					<div className="my-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-1 px-4 py-8 text-center text-sm text-neutral-400">
						تصویر نمونه‌ی ترجمه (با اطلاعات شخصی پوشیده) هنوز اضافه نشده است.
					</div>
				))}
		</>
	);

	return (
		<article className="bg-suppliment">
			<JsonLd data={serviceLd} />
			<JsonLd data={buildBreadcrumbList(breadcrumbItems)} />
			{answeredFaqs.length > 0 && <JsonLd data={buildFaqPage(answeredFaqs)} />}

			{landing.isPreview && (
				<div className="bg-warning/20 text-neutral-800 text-sm text-center py-2 px-4">
					پیش‌نمایش پیش‌نویس — این صفحه هنوز منتشر نشده، noindex است و در sitemap و لینک‌های سایت نمی‌آید.
				</div>
			)}

			{/* ── هیرو ── */}
			<section className="relative overflow-hidden bg-primary">
				<img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0 opacity-30 pointer-events-none" />
				<img src="/images/footer/pattern2.svg" alt="" className="w-[420px] absolute left-0 bottom-0 opacity-20 pointer-events-none max-lg:hidden" />
				<div className="absolute -left-40 -top-40 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

				<div className="container max-lg:px-4 relative z-10 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12 items-center pt-12 pb-28 lg:pt-16 lg:pb-32">
					<div className="flex flex-col gap-6">
						<Breadcrumb items={breadcrumbItems} />
						<span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
							<span className="h-px w-8 bg-secondary" />
							راهنمای کامل و ثبت سفارش آنلاین
						</span>
						<h1 className="peyda text-white text-[42px] max-xl:text-[36px] max-lg:text-[28px] font-extrabold leading-[1.35]">{landing.h1}</h1>
						<div className="text-white/70 leading-8 max-w-2xl [&_a]:text-secondary [&_a]:underline">
							{landing.intro ? renderRichText(landing.intro) : landing.isPreview && draftPlaceholder}
						</div>
						<div className="flex items-center gap-3 flex-wrap pt-1">
							<TabanButton
								isLink
								href={orderHref}
								data-track-event="start_order"
								data-track-source={path}
								data-track-item={landing.translationItemId ?? undefined}
								icon={<IconTranslate strokeWidth={0} className="fill-white w-5 h-5" />}
								className="!bg-secondary !border-none !text-white !no-underline font-semibold rounded-xl"
							>
								سفارش ترجمه رسمی {landing.name}
							</TabanButton>
							{priceGroup && (
								<a
									href={`#${priceGroup.id}`}
									className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 duration-200"
								>
									محاسبه‌ی هزینه
									<IconArrow width={18} height={18} strokeWidth={0} className="fill-white rotate-180" />
								</a>
							)}
						</div>
						{landing.updatedAt && (
							<span className="text-white/50 text-xs">
								آخرین بازبینی: <time dateTime={landing.updatedAt}>{convertToJalaliDate(landing.updatedAt)}</time>
							</span>
						)}
					</div>

					{/* تصویرسازی سبک برگه‌ی ترجمه‌ی رسمی؛ تزئینی و بدون متن واقعی */}
					<div aria-hidden className="max-lg:hidden relative h-[340px]">
						<div className="absolute inset-y-8 left-14 right-2 rotate-[-5deg] rounded-3xl bg-white/[0.06] border border-white/10" />
						<div className="absolute inset-y-0 left-6 right-10 rounded-3xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] p-7 flex flex-col">
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1.5">
									<span className="h-2.5 w-24 rounded-full bg-primary/80" />
									<span className="h-2 w-16 rounded-full bg-neutral-2" />
								</div>
								<span className="peyda text-[11px] font-bold text-secondary border border-secondary/40 rounded-full px-3 py-1">ترجمه رسمی</span>
							</div>
							<div className="mt-7 flex flex-col gap-3">
								{["w-full", "w-11/12", "w-10/12", "w-full", "w-8/12", "w-9/12"].map((width, i) => (
									<span key={i} className={`h-2 rounded-full bg-neutral-1 ${width}`} />
								))}
							</div>
							<div className="mt-auto flex items-end justify-between">
								<div className="flex flex-col gap-1.5">
									<span className="h-2 w-20 rounded-full bg-neutral-2" />
									<span className="h-2 w-14 rounded-full bg-neutral-1" />
								</div>
								<div className="w-24 h-24 rounded-full border-2 border-dashed border-secondary/70 flex items-center justify-center rotate-[-14deg]">
									<div className="w-[76px] h-[76px] rounded-full border border-secondary/50 flex items-center justify-center text-center">
										<span className="peyda text-[10px] leading-4 font-bold text-secondary">
											مهر و امضای
											<br />
											مترجم رسمی
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ── نوار ویژگی‌ها (روی لبه‌ی هیرو) ── */}
			<div className="container max-lg:px-4 relative z-20 -mt-16">
				<ul className="grid grid-cols-4 max-lg:grid-cols-2 bg-white rounded-3xl shadow-[0_20px_50px_-24px_rgba(26,48,71,0.35)] border border-neutral-100 divide-x divide-x-reverse divide-neutral-100 max-lg:divide-x-0">
					{DOC_LANDING_TRUST_POINTS.map((point) => (
						<li key={point.title} className="flex items-center gap-3 px-6 py-5 max-lg:flex-col max-lg:text-center max-lg:gap-2 max-lg:px-3 max-lg:py-4">
							<span className="w-11 h-11 rounded-2xl bg-suppliment flex items-center justify-center shrink-0">{TRUST_ICONS[point.icon]}</span>
							<span className="flex flex-col min-w-0 max-lg:items-center">
								<span className="peyda font-bold text-primary text-[15px] max-lg:text-sm">{point.title}</span>
								<span className="text-xs text-neutral-500 leading-5">{point.desc}</span>
							</span>
						</li>
					))}
				</ul>
			</div>

			{/* ── محتوا + فهرست ── */}
			<div className="container max-lg:px-4 grid lg:grid-cols-[minmax(0,1fr)_290px] gap-8 items-start pt-10 pb-16 lg:pt-14 lg:pb-24">
				<div className="flex flex-col gap-6 min-w-0">
					{tocItems.length > 2 && (
						<details className="lg:hidden group bg-white rounded-2xl border border-neutral-100 px-5">
							<summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden peyda font-bold text-primary">
								در این صفحه
								<IconArrow width={22} height={22} strokeWidth={0} className="fill-neutral-400 rotate-180 group-open:rotate-0 duration-200" />
							</summary>
							<ol className="pb-4 flex flex-col gap-2.5 text-sm">
								{tocItems.map((item, index) => (
									<li key={item.id}>
										<a href={`#${item.id}`} className="flex gap-2 text-neutral-600 hover:text-secondary">
											<span className="text-secondary peyda">{convertToPersianNumber(index + 1)}.</span>
											{item.title}
										</a>
									</li>
								))}
							</ol>
						</details>
					)}

					{groups.map((group) => {
						const isPrice = group === priceGroup;
						return (
							<section
								key={group.id}
								id={group.id}
								className={`scroll-mt-28 bg-white rounded-3xl border p-8 max-lg:p-5 ${isPrice ? "border-secondary/40 ring-4 ring-secondary/10" : "border-neutral-100"}`}
							>
								<h2 className="peyda text-primary font-extrabold text-[26px] max-lg:text-xl leading-snug mb-5">{group.heading.heading}</h2>
								<div className="doc-prose">
									{renderBody(group.heading)}
									{group.children.map((child) => (
										<Fragment key={child.heading}>
											<h3>{child.heading}</h3>
											{renderBody(child)}
										</Fragment>
									))}
								</div>
							</section>
						);
					})}

					{faqItems.length > 0 && (
						<section id="porsesh-ha" className="scroll-mt-28 flex flex-col gap-5 pt-4">
							<div className="flex flex-col gap-2">
								<span className="inline-flex items-center gap-2 text-secondary text-sm font-medium">
									<span className="h-px w-8 bg-secondary" />
									پاسخ کوتاه به سوال‌های رایج
								</span>
								<h2 className="peyda text-primary font-extrabold text-[26px] max-lg:text-xl">پرسش‌های متداول {landing.keyword}</h2>
							</div>
							<div className="bg-white rounded-3xl">
								<Faq items={faqItems} />
							</div>
						</section>
					)}

					{related.length > 0 && (
						<nav aria-label="مدارک مرتبط" className="flex flex-col gap-4 pt-4">
							<h2 className="peyda text-primary font-extrabold text-[26px] max-lg:text-xl">مدارک مرتبط</h2>
							<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{related.map((item) => (
									<li key={item.slug}>
										<Link
											href={docLandingPath(item.slug)}
											className="group h-full flex items-center gap-4 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-secondary/50 hover:shadow-lg duration-200"
										>
											<span className="w-11 h-11 rounded-xl bg-primary/5 group-hover:bg-primary flex items-center justify-center shrink-0 duration-200">
												<IconTranslate strokeWidth={0} className="fill-secondary w-6 h-6" />
											</span>
											<span className="peyda font-semibold text-neutral-800 flex-1">{item.keyword}</span>
											<IconArrow width={20} height={20} strokeWidth={0} className="fill-neutral-300 group-hover:fill-secondary -rotate-90 duration-200" />
										</Link>
									</li>
								))}
							</ul>
						</nav>
					)}

					{/* ── دعوت پایانی ── */}
					<div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-[#22405e] p-8 lg:p-10 mt-4">
						<img src="/images/footer/pattern2.svg" alt="" className="w-72 absolute left-0 bottom-0 opacity-20 pointer-events-none" />
						<div className="relative z-10 flex items-center justify-between gap-6 max-lg:flex-col max-lg:items-start">
							<div className="flex flex-col gap-2">
								<p className="peyda text-white text-2xl max-lg:text-xl font-extrabold">ترجمه رسمی {landing.name} را همین حالا شروع کنید</p>
								<p className="text-white/65 text-sm leading-7">مدرک و زبان را انتخاب کنید، هزینه را پیش از پرداخت ببینید و سفارش را آنلاین ثبت کنید.</p>
							</div>
							<TabanButton
								isLink
								href={orderHref}
								data-track-event="start_order"
								data-track-source={`${path}#cta`}
								data-track-item={landing.translationItemId ?? undefined}
								icon={<IconTranslate strokeWidth={0} className="fill-white w-5 h-5" />}
								className="!bg-secondary !border-none !text-white !no-underline font-semibold rounded-xl shrink-0"
							>
								ثبت سفارش آنلاین
							</TabanButton>
						</div>
					</div>
				</div>

				{/* ── ستون کناری (دسکتاپ) ── */}
				<aside className="max-lg:hidden sticky top-24 flex flex-col gap-4">
					{tocItems.length > 2 && (
						<nav aria-label="فهرست مطالب" className="bg-white rounded-3xl border border-neutral-100 p-6">
							<div className="peyda font-bold text-primary mb-4">در این صفحه</div>
							<ol className="flex flex-col gap-1 text-sm">
								{tocItems.map((item, index) => (
									<li key={item.id}>
										<a href={`#${item.id}`} className="flex gap-2.5 rounded-xl px-2 py-2 text-neutral-600 hover:bg-suppliment hover:text-primary duration-200 leading-6">
											<span className="text-secondary peyda font-bold shrink-0">{convertToPersianNumber(index + 1)}</span>
											{item.title}
										</a>
									</li>
								))}
							</ol>
						</nav>
					)}
					<div className="relative overflow-hidden rounded-3xl bg-primary p-6 flex flex-col gap-4">
						<img src="/images/footer/pattern1.svg" alt="" className="w-48 absolute right-0 top-0 opacity-20 pointer-events-none" />
						<div className="relative z-10 flex flex-col gap-2">
							<span className="peyda text-white font-bold text-lg">هزینه را از قبل بدانید</span>
							<span className="text-white/65 text-sm leading-7">قیمت دقیق با تاییدات و نسخه‌ها، پیش از پرداخت در فرم سفارش نمایش داده می‌شود.</span>
						</div>
						<TabanButton
							isLink
							href={orderHref}
							data-track-event="start_order"
							data-track-source={`${path}#aside`}
							data-track-item={landing.translationItemId ?? undefined}
							className="relative z-10 !w-full !justify-center !bg-secondary !border-none !text-white !no-underline font-semibold rounded-xl"
						>
							شروع سفارش
						</TabanButton>
					</div>
				</aside>
			</div>

			{/* دکمه‌ی چسبان موبایل در جریان صفحه است (sticky، نه fixed) تا محتوایی را نپوشاند و CLS نسازد */}
			<div className="lg:hidden sticky bottom-[calc(env(safe-area-inset-bottom)+68px)] z-[90] px-4 pb-3">
				<TabanButton
					isLink
					href={orderHref}
					data-track-event="start_order"
					data-track-source={`${path}#sticky`}
					data-track-item={landing.translationItemId ?? undefined}
					className="!w-full !justify-center !bg-secondary !border-none !text-white font-semibold shadow-lg rounded-xl"
				>
					سفارش ترجمه رسمی {landing.name}
				</TabanButton>
			</div>
		</article>
	);
}
