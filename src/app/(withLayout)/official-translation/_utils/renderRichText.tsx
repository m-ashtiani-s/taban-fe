import { ReactNode } from "react";
import Link from "next/link";

const INLINE_PATTERN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
const ORDERED_ITEM = /^[0-9۰-۹]+[.)]\s+/;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	INLINE_PATTERN.lastIndex = 0;
	while ((match = INLINE_PATTERN.exec(text))) {
		if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
		const key = `${keyPrefix}-${match.index}`;
		if (match[1]) {
			nodes.push(<strong key={key}>{match[1]}</strong>);
		} else if (match[3].startsWith("/")) {
			nodes.push(
				<Link key={key} href={match[3]}>
					{match[2]}
				</Link>
			);
		} else {
			nodes.push(
				<a key={key} href={match[3]} target="_blank" rel="noopener">
					{match[2]}
				</a>
			);
		}
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
	return nodes;
}

/**
 * متن سبک محتوای صفحات مدرک به HTML معنایی: پاراگراف با خط خالی، فهرست با «- » یا «۱. »،
 * **پررنگ** و [لینک](/مسیر). لینک‌های داخلی با next/link و خارجی با noopener ساخته می‌شوند.
 */
export function renderRichText(body: string): ReactNode[] {
	return body
		.trim()
		.split(/\n\s*\n/)
		.map((block, blockIndex) => {
			const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
			const key = `b${blockIndex}`;
			if (lines.every((line) => line.startsWith("- "))) {
				return (
					<ul key={key}>
						{lines.map((line, i) => (
							<li key={i}>{renderInline(line.slice(2), `${key}-${i}`)}</li>
						))}
					</ul>
				);
			}
			if (lines.every((line) => ORDERED_ITEM.test(line))) {
				return (
					<ol key={key}>
						{lines.map((line, i) => (
							<li key={i}>{renderInline(line.replace(ORDERED_ITEM, ""), `${key}-${i}`)}</li>
						))}
					</ol>
				);
			}
			return <p key={key}>{renderInline(lines.join(" "), key)}</p>;
		});
}
