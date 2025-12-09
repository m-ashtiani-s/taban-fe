import axios from "axios";
import { StorageKey } from "@/types/StorageKey";
import { storage } from "@/types/Storage";
import { Response } from "./utils/Response";
import { API_URL } from "@/config/global";

const axiosClient = axios.create({
	baseURL: API_URL,
	withCredentials: false,
	timeout: 5000000,
});

axiosClient.interceptors.request.use((config: any) => {
	config.headers["authorization"] = storage.get(StorageKey.TOKEN);
	return config;
});

axiosClient.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		throw error;
	}
);

export const httpClient= {
	call: async <T>(config: RequestConfig, errorMapper: (err: any) => string = (err) => err) =>
		new Promise<Response<T>>((resolve, reject) => {
			axiosClient
				.request({
					signal: config.signal,
					url: config.url,
					method: config.method,
					baseURL: config.baseURL,
					headers: config.headers,
					params: config.params,
					data: config.data,
					timeout: config.timeout,
					timeoutErrorMessage: config.timeoutErrorMessage,
					responseType: config.responseType,
				})
				.then((value) => resolve(new Response(value.data, value.status)))
				.catch((reason) => reject(errorMapper(reason)));
		}),
};
export type RequestHeaders = Record<string, string | number | boolean>;

export type Method = "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK";

export type ResponseType = "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";

export interface RequestConfig<D = any> {
	signal?: AbortSignal;
	url?: string;
	method?: Method;
	baseURL?: string;
	headers?: RequestHeaders;
	params?: any;
	data?: D;
	timeout?: number;
	timeoutErrorMessage?: string;
	responseType?: ResponseType;
}
