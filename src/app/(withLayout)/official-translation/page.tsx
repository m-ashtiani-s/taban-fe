import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DOC_HUB, DOC_LANDINGS, DOC_LANDINGS_BASE_PATH, docLandingPath } from "@/config/docLandings";
import { buildBreadcrumbList, buildMetadata } from "@/config/site";
import { getLiveDocLandings, isDocHubRenderable } from "@/server/docLandings";
import Breadcrumb from "@/app/_components/breadcrumb/breadcrumb";
import JsonLd from "@/app/_components/jsonLd/jsonLd";
import { IconTranslate } from "@/app/_components/icon/icons";
import { renderRichText } from "./_utils/renderRichText";

// هاب ترجمه رسمی طبق جدول مبنا ماه ۲ منتشر می‌شود؛ تا آن موقع فقط پیش‌نمایش (noindex) در حالت بسته دارد
export const revalidate = 3600;

const isPreview = DOC_HUB.status !== "published";

export function generateMetadata(): Metadata {
	if (!isDocHubRenderable()) return { title: "صفحه یافت نشد", robots: { index: false, follow: false } };
	return buildMetadata({
		title: DOC_HUB.seoTitle,
		absoluteTitle: true,
		description: DOC_HUB.metaDescription,
		path: DOC_LANDINGS_BASE_PATH,
		robots: isPreview ? { index: false, follow: false } : undefined,
	});
}

export default async function DocHubPage() {
	if (!isDocHubRenderable()) notFound();

	const landings = isPreview ? DOC_LANDINGS : await getLiveDocLandings();
	const breadcrumbItems = [
		{ name: "خانه", path: "/" },
		{ name: "ترجمه رسمی", path: DOC_LANDINGS_BASE_PATH },
	];

	return (
		<div className="bg-suppliment min-h-[100dvh]">
			<JsonLd data={buildBreadcrumbList(breadcrumbItems)} />
			{isPreview && (
				<div className="bg-warning/20 text-neutral-800 text-sm text-center py-2 px-4">
					پیش‌نمایش پیش‌نویس — هاب ترجمه رسمی هنوز منتشر نشده و noindex است.
				</div>
			)}
			<section className="relative bg-primary overflow-hidden">
				<img src="/images/footer/pattern1.svg" alt="" className="w-[420px] absolute right-0 top-0 opacity-40 pointer-events-none" />
				<div className="container max-lg:px-4 relative z-10 flex flex-col gap-6 pt-16 pb-16 lg:pt-20">
					<Breadcrumb items={breadcrumbItems} />
					<h1 className="peyda text-white text-[40px] max-lg:text-[28px] font-extrabold leading-tight">{DOC_HUB.h1}</h1>
					{DOC_HUB.intro && <div className="text-white/70 leading-8 max-w-2xl">{renderRichText(DOC_HUB.intro)}</div>}
				</div>
			</section>
			<section className="py-12 lg:py-16">
				<div className="container max-lg:px-4">
					<h2 className="sr-only">مدارک قابل ترجمه رسمی</h2>
					<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{landings.map((landing) => (
							<li key={landing.slug}>
								<Link
									href={docLandingPath(landing.slug)}
									className="h-full flex items-center gap-3 bg-white border border-neutral-200 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg duration-200 peyda font-semibold text-neutral-800"
								>
									<IconTranslate strokeWidth={0} className="fill-secondary w-6 h-6 shrink-0" />
									{landing.keyword}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</section>
		</div>
	);
}
