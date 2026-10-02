import { Fragment } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOC_HUB, DOC_LANDINGS, DOC_LANDINGS_BASE_PATH, docLandingPath } from "@/config/docLandings";
import { BreadcrumbItem, ORGANIZATION_ID, absoluteUrl, buildBreadcrumbList, buildFaqPage, buildMetadata } from "@/config/site";
import { getBuildableDocSlugs, getLiveDocLandings, isDocHubRenderable, resolveDocLanding } from "@/server/docLandings";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import Breadcrumb from "@/app/_components/breadcrumb/breadcrumb";
import Faq from "@/app/_components/faq/faq";
import JsonLd from "@/app/_components/jsonLd/jsonLd";
import { IconTranslate } from "@/app/_components/icon/icons";
import { convertToJalaliDate } from "@/utils/dateConverts";
import LivePrice from "../_components/livePrice/livePrice";
import { renderRichText } from "../_utils/renderRichText";

type DocLandingPageProps = { params: { slug: string } };

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
	const hasPriceSection = landing.sections.some((section) => section.widget === "price");
	const orderHref = landing.translationItemId ? `/new-order?item=${landing.translationItemId}` : "/new-order";
	const draftPlaceholder = <p className="text-neutral-400 italic">متن این بخش در دست نگارش است.</p>;

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

	const livePrice = <LivePrice translationItemId={landing.translationItemId} documentName={landing.name} sourcePage={path} />;

	return (
		<article className="bg-suppliment min-h-[100dvh]">
			<JsonLd data={serviceLd} />
			<JsonLd data={buildBreadcrumbList(breadcrumbItems)} />
			{answeredFaqs.length > 0 && <JsonLd data={buildFaqPage(answeredFaqs)} />}

			{landing.isPreview && (
				<div className="bg-warning/20 text-neutral-800 text-sm text-center py-2 px-4">
					پیش‌نمایش پیش‌نویس — این صفحه هنوز منتشر نشده، noindex است و در sitemap و لینک‌های سایت نمی‌آید.
				</div>
			)}

			<section className="relative bg-primary overflow-hidden">
				<img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0 opacity-40 pointer-events-none" />
				<div className="container max-lg:px-4 relative z-10 flex flex-col gap-6 pt-16 pb-16 lg:pt-20">
					<Breadcrumb items={breadcrumbItems} />
					<h1 className="peyda text-white text-[40px] max-lg:text-[28px] font-extrabold leading-tight max-w-3xl">{landing.h1}</h1>
					<div className="text-white/70 leading-8 max-w-2xl [&_a]:text-secondary [&_a]:underline">
						{landing.intro ? renderRichText(landing.intro) : landing.isPreview && draftPlaceholder}
					</div>
					<div className="flex items-center gap-4 flex-wrap">
						<TabanButton
							isLink
							href={orderHref}
							data-track-event="start_order"
							data-track-source={path}
							data-track-item={landing.translationItemId ?? undefined}
							icon={<IconTranslate strokeWidth={0} className="fill-white w-5 h-5" />}
							className="!bg-secondary !border-none font-semibold"
						>
							همین مدرک را سفارش بده
						</TabanButton>
						{landing.updatedAt && (
							<span className="text-white/50 text-xs">
								آخرین بازبینی: <time dateTime={landing.updatedAt}>{convertToJalaliDate(landing.updatedAt)}</time>
							</span>
						)}
					</div>
				</div>
			</section>

			<section className="py-12 lg:py-16">
				<div className="container max-lg:px-4">
					<div className="max-w-3xl mx-auto flex flex-col gap-8">
						<div
							className="bg-white rounded-2xl p-8 max-lg:p-5 shadow-sm leading-8 text-neutral-700
								[&_h2]:peyda [&_h2]:text-primary [&_h2]:font-extrabold [&_h2]:text-2xl [&_h2]:mt-10 [&_h2:first-child]:mt-0 [&_h2]:mb-4
								[&_h3]:peyda [&_h3]:text-primary [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
								[&_p]:mb-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:mb-4 [&_li]:mb-1
								[&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2"
						>
							{!hasPriceSection && (
								<>
									<h2>هزینه {landing.keyword}</h2>
									{livePrice}
								</>
							)}
							{landing.sections.map((section) => {
								const Heading = section.level === 2 ? "h2" : "h3";
								return (
									<Fragment key={section.heading}>
										<Heading>{section.heading}</Heading>
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
												landing.isPreview && <p className="text-neutral-400 italic">تصویر نمونه‌ی ترجمه (با اطلاعات شخصی پوشیده) هنوز اضافه نشده است.</p>
											))}
									</Fragment>
								);
							})}
						</div>

						{(answeredFaqs.length > 0 || landing.isPreview) && (
							<section className="flex flex-col gap-5">
								<h2 className="peyda text-primary font-extrabold text-2xl">پرسش‌های متداول {landing.keyword}</h2>
								<Faq items={landing.isPreview ? landing.faqs.map((faq) => ({ ...faq, answer: faq.answer || "پاسخ در دست نگارش است." })) : answeredFaqs} />
							</section>
						)}

						{related.length > 0 && (
							<nav aria-label="مدارک مرتبط" className="flex flex-col gap-4">
								<h2 className="peyda text-primary font-extrabold text-2xl">مدارک مرتبط</h2>
								<ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{related.map((item) => (
										<li key={item.slug}>
											<Link
												href={docLandingPath(item.slug)}
												className="h-full flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg duration-200 peyda font-semibold text-neutral-800"
											>
												<IconTranslate strokeWidth={0} className="fill-secondary w-6 h-6 shrink-0" />
												{item.keyword}
											</Link>
										</li>
									))}
								</ul>
							</nav>
						)}
					</div>
				</div>
			</section>

			{/* دکمه‌ی چسبان موبایل در جریان صفحه است (sticky، نه fixed) تا محتوایی را نپوشاند و CLS نسازد */}
			<div className="lg:hidden sticky bottom-[calc(env(safe-area-inset-bottom)+68px)] z-[90] px-4 pb-3">
				<TabanButton
					isLink
					href={orderHref}
					data-track-event="start_order"
					data-track-source={`${path}#sticky`}
					data-track-item={landing.translationItemId ?? undefined}
					className="!w-full !justify-center !bg-secondary !border-none font-semibold shadow-lg"
				>
					سفارش ترجمه رسمی {landing.name}
				</TabanButton>
			</div>
		</article>
	);
}
