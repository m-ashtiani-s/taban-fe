import { storage } from "@/utils/Storage";
import { StorageKey } from "@/types/StorageKey";

export function isLoggedIn(): boolean {
	if (typeof window === "undefined") return false;
	const token = storage.get(StorageKey.TOKEN);
	if (!token || token === "undefined" || token === "null") return false;
	return true;
}
