import { StorageKey } from "./StorageKey";



export const storage = {
	get: (key: StorageKey) => localStorage.getItem(key.toString()),
	set: (key: StorageKey, value: string) => localStorage.setItem(key.toString(), value),
	remove: (key: StorageKey) => localStorage.removeItem(key.toString()),
};
