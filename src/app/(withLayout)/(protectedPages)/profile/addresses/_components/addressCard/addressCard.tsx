"use client";

import { IconCheck, IconCross, IconEdit, IconTruck } from "@/app/_components/icon/icons";
import { ShippingAddress } from "../../_types/shippingAddress.type";

type AddressCardProps = {
	address: ShippingAddress;
	onEdit: (address: ShippingAddress) => void;
	onToggleStatus: (address: ShippingAddress) => void;
};

function detailOrDash(value?: string | null) {
	return value && value.trim() ? value : "—";
}

export default function AddressCard({ address, onEdit, onToggleStatus }: AddressCardProps) {
	return (
		<div
			className={`relative bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-4 duration-200 hover:shadow-md ${
				address.isActive ? "border-neutral-200" : "border-neutral-200 opacity-80"
			}`}
		>
			{/* accent bar */}
			<div
				className={`absolute top-5 bottom-5 right-0 w-1 rounded-l ${
					address.isActive ? "bg-primary" : "bg-neutral-300"
				}`}
			/>

			<div className="flex items-start justify-between gap-3 pr-3">
				<div className="flex items-center gap-2 min-w-0">
					<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
						<IconTruck width={20} height={20} className="stroke-primary" />
					</div>
					<div className="font-semibold peyda text-primary truncate">{address.title}</div>
				</div>

				<button
					type="button"
					onClick={() => onToggleStatus(address)}
					title={address.isActive ? "غیرفعال کردن" : "فعال کردن"}
					className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg duration-150 shrink-0 ${
						address.isActive
							? "bg-success/10 text-success hover:bg-success/20"
							: "bg-error/10 text-error hover:bg-error/20"
					}`}
				>
					{address.isActive ? (
						<IconCheck width={16} height={16} className="stroke-success" />
					) : (
						<IconCross width={16} height={16} className="fill-error stroke-error" strokeWidth={0.5} />
					)}
					{address.isActive ? "فعال" : "غیرفعال"}
				</button>
			</div>

			<div className="pr-3 flex flex-col gap-2 text-sm">
				<div className="flex items-center gap-1.5 text-neutral-600">
					<span className="text-neutral-400">استان/شهر:</span>
					<span className="font-medium text-neutral-800">
						{address.provinceName} - {address.cityName}
					</span>
				</div>
				<div className="text-neutral-700 leading-7">
					<span className="text-neutral-400">آدرس: </span>
					{address.fullAddress}
				</div>
				<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
					<span>پلاک: {detailOrDash(address.plaque)}</span>
					<span>واحد: {detailOrDash(address.unit)}</span>
					<span dir="ltr">تلفن ثابت: {detailOrDash(address.landlineNumber)}</span>
					<span dir="ltr">کد پستی: {detailOrDash(address.postalCode)}</span>
				</div>
				{address.addressDescription && (
					<div className="text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 leading-6">
						{address.addressDescription}
					</div>
				)}
			</div>

			<div className="pr-3 pt-1 mt-auto flex justify-end border-t border-neutral-100">
				<button
					type="button"
					onClick={() => onEdit(address)}
					className="flex items-center gap-1.5 text-sm text-primary hover:bg-primary/5 rounded-lg px-3 py-2 mt-3 duration-150"
				>
					<IconEdit width={16} height={16} className="stroke-primary" />
					ویرایش آدرس
				</button>
			</div>
		</div>
	);
}
