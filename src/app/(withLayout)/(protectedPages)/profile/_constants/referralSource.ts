export type ReferralSourceOption = { label: string; value: string };

export const referralSourceOptions: ReferralSourceOption[] = [
	{ label: "موتورهای جستجو (گوگل، ...)", value: "search-engine" },
	{ label: "شبکه‌های اجتماعی", value: "social-media" },
	{ label: "معرفی دوستان و آشنایان", value: "friends" },
	{ label: "تبلیغات", value: "ads" },
	{ label: "سایر", value: "other" },
];
