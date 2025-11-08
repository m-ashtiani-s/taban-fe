import { nextui } from "@nextui-org/theme";
import type { Config } from "tailwindcss";

export const tailwindColors: { [key: string]: string } = {
	primary: "#1a3047",
	secondary: "#b8a27c",
	suppliment: "#b8a27c",
	"suppliment-full": "#b8a27c",
	current: "#0e0e0e",
	transparent: "transparent",
	white: "#ffffff",
	link: "#0078D6",
	"primary-content": "#ffffff",
	"secondary-content": "#FFFFFF",
	accent: "#1FB2A5",
	"accent-content": "#FFFFFF",
	"neutral-0": "#fcfdff",
	"neutral-1": "#f2f2f2",
	"neutral-2": "#dcdcdc",
	"neutral-3": "#b1b1b1",
	"neutral-4": "#838383",
	"neutral-5": "#5e5e5e",
	"neutral-6": "#363636",
	"neutral-7": "#171717",
	"neutral-8": "#0e0e0e",
	info: "#3abff8",
	success: "#07a034",
	warning: "#fbbd23",
	error: "#f87272",
};

const config: Config = {
	mode: "jit",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: tailwindColors,
		},
		container: {
			center: true,
		},
	},
	darkMode: "class",
	plugins: [nextui()],
};
export default config;
