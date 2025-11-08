
import TabanButton from "../common/tabanButton/tabanButton";
import { ErrorComponentProps } from "./errorComponent.type";

export default function ErrorComponent({ executeFunction,callAble,ticketAble,errorText,variant="bordered" }: ErrorComponentProps) {
	return (
		<div className={` z-100 max-lg:!z-[3000]  theme-scrol rounded-lg px-6 py-4 overflow-y-auto w-full ${variant==="bordered" && "border border-neutral-300/80"}`}>
			<div className="flex justify-center items-center gap-8 flex-col">
				{errorText}
				<div className="flex justify-center items-center gap-4">
					{ticketAble && <TabanButton variant="text" isLink href="/tickets/create">
						ثبت تیکت
					</TabanButton>}
					{callAble && <TabanButton variant="text" isLink href="tel:0219696">
						تماس با پشتیبانی
					</TabanButton>}
					<TabanButton onClick={() => executeFunction()}>تلاش مجدد</TabanButton>
				</div>
			</div>
		</div>
	);
}
