export type ClubTier = "normal" | "bronze" | "silver" | "gold";

export type ClubConfig = {
	bronzeMinScore: number;
	silverMinScore: number;
	goldMinScore: number;
	bronzeDiscount: number;
	silverDiscount: number;
	goldDiscount: number;
};

export type ClubStatus = {
	score: number;
	tier: ClubTier;
	discountPercent: number;
	currentMinScore: number;
	nextTier: ClubTier | null;
	nextTierMinScore: number | null;
	pointsToNextTier: number | null;
	config: ClubConfig;
};

export type ScoreTransaction = {
	id: string;
	orderId: string | null;
	orderNumber: number | null;
	points: number;
	description: string;
	createdAt: string;
};
