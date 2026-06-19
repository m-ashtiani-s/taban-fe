import { ClubTier } from "@/types/club.type";

export const tierMeta: Record<
	ClubTier,
	{ label: string; gradient: string; chip: string; dot: string; soft: string; text: string }
> = {
	normal: {
		label: "معمولی",
		gradient: "from-neutral-400 to-neutral-500",
		chip: "bg-neutral-100 text-neutral-600 border-neutral-200",
		dot: "bg-neutral-400",
		soft: "bg-neutral-50 border-neutral-200",
		text: "text-neutral-600",
	},
	bronze: {
		label: "برنزی",
		gradient: "from-amber-500 to-orange-600",
		chip: "bg-amber-50 text-amber-700 border-amber-200",
		dot: "bg-amber-500",
		soft: "bg-amber-50 border-amber-200",
		text: "text-amber-700",
	},
	silver: {
		label: "نقره‌ای",
		gradient: "from-slate-400 to-slate-600",
		chip: "bg-slate-100 text-slate-700 border-slate-300",
		dot: "bg-slate-400",
		soft: "bg-slate-50 border-slate-200",
		text: "text-slate-600",
	},
	gold: {
		label: "طلایی",
		gradient: "from-yellow-400 to-amber-500",
		chip: "bg-yellow-50 text-yellow-700 border-yellow-300",
		dot: "bg-yellow-500",
		soft: "bg-yellow-50 border-yellow-200",
		text: "text-yellow-700",
	},
};

/** ترتیب سطوح برای نمایش پلکان */
export const tierOrder: ClubTier[] = ["normal", "bronze", "silver", "gold"];

/** آستانه و درصد تخفیف هر سطح از روی کانفیگ */
export function tierThreshold(tier: ClubTier, c: { bronzeMinScore: number; silverMinScore: number; goldMinScore: number }): number {
	if (tier === "bronze") return c.bronzeMinScore;
	if (tier === "silver") return c.silverMinScore;
	if (tier === "gold") return c.goldMinScore;
	return 0;
}

export function tierDiscount(tier: ClubTier, c: { bronzeDiscount: number; silverDiscount: number; goldDiscount: number }): number {
	if (tier === "bronze") return c.bronzeDiscount;
	if (tier === "silver") return c.silverDiscount;
	if (tier === "gold") return c.goldDiscount;
	return 0;
}
