/** شماره‌ی صفحه‌ی معتبر یا null برای مقادیر نامعتبر (مثل 0، -1، 2abc) که باید ۴۰۴ شوند */
export function parseBlogPage(raw?: string): number | null {
	if (raw === undefined || raw === "") return 1;
	if (!/^\d+$/.test(raw)) return null;
	const page = parseInt(raw, 10);
	return page >= 1 ? page : null;
}
