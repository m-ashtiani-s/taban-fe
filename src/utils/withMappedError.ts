import { mapError } from "@/httpClient/utils/mapError";

export async function withMappedError<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (err) {
		throw mapError(err);
	}
}
