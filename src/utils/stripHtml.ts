const NAMED_ENTITIES: Record<string, string> = { nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", hellip: "…", ndash: "–", mdash: "—", laquo: "«", raquo: "»", zwnj: "‌" };

function decodeEntities(input: string): string {
	return input.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
		if (code[0] === "#") {
			const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
			return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
		}
		return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
	});
}

/** متن ساده از HTML وردپرس (برای عنوان، description، alt و JSON-LD) */
export function stripHtml(input?: string | null): string {
	return decodeEntities((input || "").replace(/<[^>]*>/g, ""))
		.replace(/\s+/g, " ")
		.trim();
}
