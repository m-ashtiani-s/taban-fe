import { FormErrors } from "@/types/formErrors.type";

export function findError(errors:FormErrors[],itemName: string) {
	const item = errors.find((obj) => obj.item === itemName);
	return item || null;
}
