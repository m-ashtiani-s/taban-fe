import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { Paginate } from "@/types/paginate";
import { ClubStatus, ScoreTransaction } from "@/types/club.type";

export const ClubEndpoints = {
	getMyStatus: async () => {
		const res = await httpClient.call<Res<ClubStatus>>({
			method: "GET",
			url: `v1/user/club`,
		});
		return res?.data;
	},
	getMyHistory: async (page: number, pageSize: number) => {
		const res = await httpClient.call<Res<Paginate<ScoreTransaction>>>({
			method: "GET",
			url: `v1/user/club/history`,
			params: { page, pageSize },
		});
		return res?.data;
	},
};
