import { StorageKey } from "./StorageKey";



// httpClient سمت سرور هم صدا زده می‌شود (مثلاً بررسی وجود مدرک در صفحات فرود)؛ آنجا localStorage وجود ندارد
const isBrowser = typeof window !== "undefined";

export const storage = {
	get: (key: StorageKey) => (isBrowser ? localStorage.getItem(key.toString()) : null),
	set: (key: StorageKey, value: string) => isBrowser && localStorage.setItem(key.toString(), value),
	remove: (key: StorageKey) => isBrowser && localStorage.removeItem(key.toString()),
};
