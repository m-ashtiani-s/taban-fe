import React from "react";
const size = 40;
export default function CircularProgress({ percent = "50" }) {
	const radius = (size - 4) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (+percent / 100) * circumference;

	return (
		<div className="flex items-center justify-center  relative">
			<svg width={size} height={size} className="rotate-[-90deg]">
				<circle stroke="#d8cdbb" fill="transparent" strokeWidth={4} r={radius} cx={size / 2} cy={size / 2} />
				<circle
					stroke="currentColor"
					fill="transparent"
					strokeWidth={4}
					strokeLinecap="round"
					r={radius}
					cx={size / 2}
					cy={size / 2}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					className="text-secondary  transition-all duration-500"
				/>
			</svg>
			<div className="absolute text-xs font-bold flex items-center justify-center top-3.5 text-secondary">{percent}%</div>
		</div>
	);
}
