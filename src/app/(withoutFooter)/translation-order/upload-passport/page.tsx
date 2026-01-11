"use client";
import CreateRateLevels from "../_components/createRateLevels/createRateLevels";
import { IconArrowLine, IconRequired, IconUpload } from "@/app/_components/icon/icons";
import { OrderState, useOrderStore } from "../_store/rate.store";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import Upload from "./_components/upload/upload";

export default function Page() {
	const { order, setOrder }: OrderState = useOrderStore();
	
	

	return (
		<div className="h-full">
			<div className="container h-full">
				<div className="flex border w-full border-neutral-300 rounded-lg p-4 h-[calc(100%-16px)] flex-col relative">
					<div className="flex flex-col h-[calc(100%-40px)] taban-scroll">
						<div className=" flex items-center gap-2 w-full px-8 pb-16 border-b border-dashed border-neutral-300">
							<CreateRateLevels activeLevel={8} />
						</div>

						<div className="pt-8">
							<div className="peyda font-extrabold text-3xl text-neutral-500 text-center w-full">
								آپلود مدارک و اسناد مورد نیاز
							</div>
						</div>

						<div className="pt-12">
							<div className="text-xl peyda font-medium flex items-center">
								<IconRequired
									viewBox="0 0 100 100"
									width={40}
									height={40}
									className="fill-secondary stroke-0"
								/>
								مواردی که آپلود آنها الزامی است
							</div>
							<div className="pr-16">
								<div className="flex flex-col gap-4 mt-4">
									<div className="flex items-center gap-2">
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
									</div>
									<div className="flex items-center gap-2">
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
									</div>
									<div className="flex items-center gap-2">
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
									</div>
									<div className="flex items-center gap-2">
										<IconUpload viewBox="0 0 32 32" className="stroke-0 fill-primary" />
										لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از
									</div>
								</div>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex flex-wrap mt-4">
								<Upload />
							</div>
						</div>
					</div>
					<div className="flex items-center justify-end gap-2 pt-2 bg-white">
						<TabanButton
							isLink
							href={"/translation-order/upload"
							}
							variant="text"
						>
							مرحله قبلی
						</TabanButton>
						<TabanButton disabled={!order?.language} isLink href="/translation-order/checkout" icon={<IconArrowLine />}>
							مرحله بعدی
						</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
