import { SOCIAL_PROFILES, SocialProfile } from "@/config/site";
import { IconInstagram, IconTelegram, IconWhatsapp } from "../icon/icons";
import { SocialLinksProps } from "./socialLinks.type";

// کلاس‌های کامل (نه ساخته‌شده با رشته) تا tailwind JIT تولیدشان کند
const TONE_CLASSES = {
	light: { strokeFill: "stroke-neutral-200 fill-neutral-200", stroke: "stroke-neutral-200", fill: "fill-neutral-200" },
	white: { strokeFill: "stroke-white fill-white", stroke: "stroke-white", fill: "fill-white stroke-white" },
};

export default function SocialLinks({ tone, itemClassName, iconSize }: SocialLinksProps) {
	if (!SOCIAL_PROFILES.length) return null;

	const classes = TONE_CLASSES[tone];
	const renderIcon = (network: SocialProfile["network"]) => {
		switch (network) {
			case "instagram":
				return <IconInstagram viewBox="0 0 32 32" className={classes.strokeFill} strokeWidth={1} width={iconSize} height={iconSize} />;
			case "telegram":
				return <IconTelegram viewBox="0 0 192 192" className={classes.stroke} strokeWidth={18} width={iconSize} height={iconSize} />;
			case "whatsapp":
				return <IconWhatsapp className={classes.fill} strokeWidth={0.8} width={iconSize - 4} height={iconSize - 4} />;
			default:
				return null;
		}
	};

	return (
		<>
			{SOCIAL_PROFILES.map((profile) => {
				const icon = renderIcon(profile.network);
				if (!icon) return null;
				return (
					<a key={profile.url} href={profile.url} target="_blank" rel="noopener me" aria-label={profile.label} className={itemClassName}>
						{icon}
					</a>
				);
			})}
		</>
	);
}
