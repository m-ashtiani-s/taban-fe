import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import { errorHandler, networkErrorStrategy } from "./http-error-strategies";
// import { getSession } from "next-auth/react";

const httpService = axios.create({
	baseURL: "https://api.nobitex.ir/",
	headers: {
		"Content-Type": "application/json",
	},
});

httpService.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error?.response) {
			const statusCode = error?.response?.status;
			if (statusCode >= 400) {
				// const errorData: ApiError = error.response?.data;

				// errorHandler[statusCode](errorData);
				error.errorResponse = error.response.data;
			}
		} else {
			networkErrorStrategy();
		}
		throw error.response.data;
	}
);

async function getToken() {
	const token = await localStorage.getItem("token");
	if (token) {
		console.log(token);
		return token;
	} else {
		return "";
	}
}

async function apiBase<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
	const response: AxiosResponse = await httpService(url, options);

	return response.data as T;
}

async function readData<T>(url: string, params?: any, signal?: AbortSignal): Promise<T> {
	const token = await getToken();
	const options: AxiosRequestConfig = {
		params: params,
		method: "GET",
		signal: signal,
		headers: { token },
	};
	try {
		const response = await apiBase<T>(url, options);
		return response;
	} catch (error: any) {
		if (error?.code === 401) {
		}
		throw error;
	}
}

async function createData<TModel, TResult>(url: string, data: TModel): Promise<TResult> {
	const token = !url.includes("login") ? await getToken() : "";
	const options: AxiosRequestConfig = {
		method: "POST",
		data: JSON.stringify(data),
		headers: { token },
	};

	return await apiBase<TResult>(url, options);
}

async function updateData<TModel, TResult>(url: string, data: TModel, headers?: AxiosRequestHeaders): Promise<TResult> {
	const token = await getToken();
	const options: AxiosRequestConfig = {
		method: "PUT",
		headers: {...headers,token},
		data: JSON.stringify(data),
	};

	return await apiBase<TResult>(url, options);
}

async function deleteData<TResult>(url: string, headers?: AxiosRequestConfig["headers"]): Promise<TResult> {
	// const token=!url.includes('login') ? await getToken() : ''
	const options: AxiosRequestConfig = {
		method: "DELETE",
		headers: { ...headers },
	};

	return await apiBase(url, options);
}

export { createData, readData, updateData, deleteData };
