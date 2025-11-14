export type ProfileCompletion = {
	isCompleted: boolean;
	completionPercent: number;
	incompleteItems: IncompleteItem[];
};

interface IncompleteItem {
	itemKey: string;
	itemName: string;
}
