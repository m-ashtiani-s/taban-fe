"use client";

import { useNotificationStore } from "@/stores/notification.store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { convertToJalali } from "@/utils/dateConverts";
import TabanLoading from "@/app/_components/common/tabanLoading/tabanLoading";
import { useApi } from "@/hooks/useApi";
import { TabanEndpoints } from "@/app/_api/endpoints";

export default function Comments({ id }: { id: number }) {
	const showNotification = useNotificationStore((state) => state.showNotification);
	const comments = useApi(async () => await TabanEndpoints.getComments(id));

	useEffect(() => {
		comments.fetchData();
	}, []);

	useEffect(() => {
		if (comments.result) {
			if (comments.result.success) {
			} else {
				comments.result.code !== "no_comments" &&
					showNotification({
						message: comments.result.description || "دریافت نظرات با خطا مواجه شد",
						type: "error",
					});
			}
		}
	}, [comments.result]);

	return (
		<div className="flex flex-col">
			{comments.result?.success && comments.resultData?.data!?.length > 0 && !comments.loading ? (
				comments.resultData?.data?.map((it, i) => (
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
			) : comments.loading ? (
				<div className="flex items-center gap-2 justify-center w-full">
					<TabanLoading /> درحال بارگذاری نظرات
				</div>
			) : (
				""
			)}
		</div>
	);
}
