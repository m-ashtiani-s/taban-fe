
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { CheckProfileErrorProps } from "./checkProfileError.type";

export default function CheckProfileError({executeCheckProfile}:CheckProfileErrorProps) {
	return (
		<div className="h-screen w-full flex items-center justify-center">
			<div
				className={` z-100 max-lg:!z-[3000] lg:!border lg:!border-surface-variant theme-scrol rounded-lg px-6 py-4 overflow-y-auto`}
			>
				<div className="flex justify-center items-center gap-8 flex-col">
                    <img src="/images/error.svg" className="w-24" alt="" />
					دریافت اطلاعات مربوط به پروفایل شما با خطا مواجه شد، لطفا مجددا تلاش کنید
					<div className="flex justify-center items-center gap-4">
						<TabanButton onClick={()=>executeCheckProfile()}>تلاش مجدد</TabanButton>
						<TabanButton variant="text">خروج از حساب کاربری</TabanButton>
					</div>
				</div>
			</div>
		</div>
	);
}
