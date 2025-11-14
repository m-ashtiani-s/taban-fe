
import TabanButton from "../common/tabanButton/tabanButton";
import TabanLoading from "../common/tabanLoading.tsx/tabanLoading";
import { IconCross, IconRetry } from "../icon/icons";
import { AutoCompleteErrorComponentProps } from "./autoCompleteErrorComponent.types";

export default function AutoCompleteErrorComponent({ executeFunction, errorText, className = "", loading = false, disabled = false }: AutoCompleteErrorComponentProps) {
	return (
		<div className={`relative w-full h-12 z-50`}>
			<div className={`w-full h-full bg-white border border-error rounded-xl justify-between items-center pr-1 pl-0.5 py-[1px] flex ${className}`}>
				<div className="text-center text-xs text-error">{errorText ?? "دریافت لیست با خطا مواجه شد"}</div>
				<div>
					{/* TODO */}
					<TabanButton onClick={executeFunction} variant="icon" disabled={disabled} className="">
						{loading ? <TabanLoading size={16} color="#b3261e" /> : <IconRetry stroke="#b3261e" className="" width={20} height={20} />}
					</TabanButton>
				</div>
			</div>
			{disabled && <div className="absolute w-full h-full top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>}
		</div>
		
	);
}
