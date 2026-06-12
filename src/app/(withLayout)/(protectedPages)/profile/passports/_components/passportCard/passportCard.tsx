"use client";

import { Passport } from "@/types/passport.type";
import TabanButton from "@/app/_components/common/tabanButton/tabanButton";
import { IconRecycle, IconRetry } from "@/app/_components/icon/icons";

type PassportCardProps = {
	passport: Passport;
	onToggleStatus: (passport: Passport) => void;
};

export default function PassportCard({ passport, onToggleStatus }: PassportCardProps) {
	return (
		<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 duration-200">
			<div
				className="aspect-[4/3] w-full bg-neutral-100 bg-cover bg-center"
				style={{ backgroundImage: `url('${passport.image}')` }}
			/>
			<div className="p-4 flex items-center justify-between gap-3">
				<div className="min-w-0">
					<div className="peyda font-bold text-primary truncate">{passport.title}</div>
					<div className={`text-xs mt-0.5 ${passport.isActive ? "text-success" : "text-neutral-400"}`}>
						{passport.isActive ? "فعال" : "غیرفعال"}
					</div>
				</div>
				<TabanButton
					variant="icon"
					className={passport.isActive ? "!h-8 !min-w-8 !bg-error/5 hover:!bg-error/15" : "!h-8 !min-w-8 !bg-success/5 hover:!bg-success/15"}
					onClick={() => onToggleStatus(passport)}
				>
					{passport.isActive ? (
						<IconRecycle viewBox="0 0 589.004 589.004" strokeWidth={1} className="stroke-error fill-error w-4 h-4" />
					) : (
						<IconRetry className="stroke-success w-4 h-4" />
					)}
				</TabanButton>
			</div>
		</div>
	);
}
