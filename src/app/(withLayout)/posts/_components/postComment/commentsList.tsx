"use client";

import { useNotificationStore } from "@/stores/notification.store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { convertToJalali } from "@/utils/dateConverts";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { useQuery } from "@tanstack/react-query";
import { withMappedError } from "@/utils/withMappedError";
import { TabanEndpoints } from "@/app/_api/endpoints";

export default function Comments({ id }: { id: number }) {
	const showNotification = useNotificationStore((state) => state.showNotification);
	const commentsQuery = useQuery({
		queryKey: ["comments", "list", id],
		queryFn: () => withMappedError(() => TabanEndpoints.getComments(id)),
		retry: false,
	});
	const commentsLoading = commentsQuery.isFetching;
	const commentsResult =
		commentsQuery.error ?? (commentsQuery.data !== undefined ? { success: true as const, data: commentsQuery.data } : null);
	const commentsData = commentsQuery.error ? undefined : commentsQuery.data;

	useEffect(() => {
		if (commentsQuery.error && commentsQuery.error.code !== "no_comments") {
			showNotification({
				message: commentsQuery.error.description || "دریافت نظرات با خطا مواجه شد",
				type: "error",
			});
		}
	}, [commentsQuery.error]);

	return (
		<div className="flex flex-col">
			{commentsResult?.success && commentsData?.data!?.length > 0 && !commentsLoading ? (
				commentsData?.data?.map((it, i) => (
					<div className={`flex gap-2 items-start py-6 ${i !== 0 && "border-t border-t-neutral-3 border-dashed"}`} key={it?.id}>
						<Image src="/images/avatar.svg" height={64} width={64} alt="avatar" />
						<div className="flex.flex-col gap-4">
							<div className="flex items-center text-neutral-5 text-sm gap-4 pt-1">
								<div className="">{it?.author}</div>-<div className="dir-ltr">{convertToJalali(it?.date)}</div>
							</div>
							<div className="flex items-center text-neutral-5 text-sm gap-4 pt-2">
								<div className="" dangerouslySetInnerHTML={{ __html: it?.content?.rendered }}></div>
							</div>
						</div>
					</div>
				))
			) : commentsLoading ? (
				<div className="flex items-center gap-2 justify-center w-full">
					<TabanLoading /> درحال بارگذاری نظرات
				</div>
			) : (
				""
			)}
		</div>
	);
}
