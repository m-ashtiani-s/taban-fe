import { JsonLdProps } from "./jsonLd.type";

// متن‌های وردپرس و محتوا وارد JSON-LD می‌شوند؛ escape کردن «<» جلوی بسته‌شدن زودهنگام تگ script را می‌گیرد
export default function JsonLd({ data }: JsonLdProps) {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
