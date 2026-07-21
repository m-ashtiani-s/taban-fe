"use client";

import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TabanEndpoints } from "@/app/_api/endpoints";
import { Profile } from "@/types/profile.type";


export const PROFILE_QUERY_KEY = ["profile", "detail"] as const;


export function useProfile() {
	const query = useQuery({
		queryKey: PROFILE_QUERY_KEY,
		queryFn: () => withMappedError(() => TabanEndpoints.getProfile()),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	return {
		profile: (query.data?.data as Profile) ?? null,
		isLoading: query.isPending,
		query,
	};
}
