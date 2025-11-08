
import TabanModal from "../common/tabanModal/tabanModal";
import TabanButton from "../common/tabanButton/tabanButton";
import { ErrorModalProps } from "./errorModal.type";

export default function ErrorModal({ executeFunction, callAble=false, ticketAble=false, errorText, open, setOpen,title="خطا در پردازش" }: ErrorModalProps) {
	const closeHandler = () => {
		setOpen(false);
	};
	return (
		<TabanModal open={open} setOpen={setOpen} title={title} onClose={closeHandler}>
			<div className={` z-100 max-lg:!z-[3000]  theme-scrol rounded-lg overflow-y-auto w-full `}>
				<div className="flex justify-center items-center gap-8 flex-col">
					{errorText}
					<div className="flex justify-center items-center gap-4">
						{ticketAble && (
							<TabanButton variant="text" isLink href="/tickets/create">
								ثبت تیکت
							</TabanButton>
						)}
						{callAble && (
							<TabanButton variant="text" isLink href="tel:0219696">
								تماس با پشتیبانی
							</TabanButton>
						)}
						<TabanButton
							onClick={() => {
								closeHandler();
								executeFunction();
							}}
						>
							تلاش مجدد
						</TabanButton>
					</div>
				</div>
			</div>
		</TabanModal>
	);
}
