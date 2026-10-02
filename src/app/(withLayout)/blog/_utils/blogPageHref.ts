/** صفحه‌ی ۱ همیشه به /blog لینک می‌شود تا لینک داخلی به نسخه‌ی غیر canonical (?page=1) نرود */
export function blogPageHref(page: number, term?: string): string {
	const params = new URLSearchParams();
	if (term) params.set("term", term);
	if (page > 1) params.set("page", String(page));
	const query = params.toString();
	return query ? `/blog?${query}` : "/blog";
}
