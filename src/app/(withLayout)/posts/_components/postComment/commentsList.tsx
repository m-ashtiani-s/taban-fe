"use client";

import { readData } from "@/core/http-service/http-service";
import { useNotificationStore } from "@/stores/notification.store";
import { useEffect, useState } from "react";
import Image from "next/image";
import { PostComment } from "@/types/comment.type";
import { WP_URL } from "@/config/global";
import { convertToJalali } from "@/utils/dateConverts";
import TabanLoading from "@/app/_components/common/tabanLoading.tsx/tabanLoading";

export default function Comments({ id }: { id: number }) {
	const [comments, setComments] = useState<PostComment[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const showNotification = useNotificationStore((state) => state.showNotification);

	useEffect(() => {
		fetchComments();
	}, []);

	const fetchComments = async () => {
		try {
			setLoading(true);
			const res = await readData<PostComment[]>(`${WP_URL}wp-json/wp/v2/comments?post_id=${id}&_embed`);
			console.log(res)
			setComments(res);
		} catch (error: any) {
			error?.code !== "no_comments" &&
				showNotification({
					message: error?.message || "دریافت نظرات با خطا مواجه شد",
					type: "error",
				});
		} finally {
			setLoading(false);
		}
	};
	return (
		<div className="flex flex-col">
			{comments && comments?.length > 0 && !loading ? (
				comments?.map((it, i) => (
					<div className={`flex gap-2 items-start py-6 ${i !== 0 && "border-t border-t-neutral-3 border-dashed"}`} key={it?.id}>
						<Image src="/images/avatar.svg" height={64} width={64} alt="avatar" />
						<div className="flex.flex-col gap-4">
							<div className="flex items-center text-neutral-5 text-sm gap-4 pt-1">
								<div className="">{it?.author}</div>-<div className="dir-ltr">{convertToJalali(it?.date)}</div>
							</div>
							<div className="flex items-center text-neutral-5 text-sm gap-4 pt-2">
								<div className="" dangerouslySetInnerHTML={{__html:it?.content?.rendered}}></div>
							</div>
						</div>
					</div>
				))
			) : loading ? (
				<div className="flex items-center gap-2 justify-center w-full">
					<TabanLoading /> درحال بارگذاری نظرات
				</div>
			) : (
				""
			)}
		</div>
	);
}
