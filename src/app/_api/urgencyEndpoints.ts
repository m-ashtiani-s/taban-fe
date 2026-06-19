import { httpClient } from "@/httpClient/HttpClient";
import { Res } from "@/types/responseType";
import { UrgencySettings } from "@/types/urgency.type";

export const UrgencyEndpoints = {
	getUrgency: async () => {
		const res = await httpClient.call<Res<UrgencySettings>>({
			method: "GET",
			url: `v1/urgency`,
		});
		return res?.data;
	},
};
