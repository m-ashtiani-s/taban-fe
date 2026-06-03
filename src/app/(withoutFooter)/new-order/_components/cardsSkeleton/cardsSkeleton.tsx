type CardsSkeletonProps = {
	count?: number;
	/** تعداد ستون‌ها در دسکتاپ */
	columns?: 2 | 3;
};

/** اسکلت لودینگِ یکدست برای گریدهای انتخابی */
export default function CardsSkeleton({ count = 6, columns = 3 }: CardsSkeletonProps) {
	const colClass = columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
	return (
		<div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-3`}>
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="h-[72px] rounded-xl border border-neutral-200 bg-neutral-100/70 animate-pulse" />
			))}
		</div>
	);
}
