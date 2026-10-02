import { BreadcrumbItem } from "@/config/site";

export type BreadcrumbProps = {
	items: BreadcrumbItem[];
	/** روی پس‌زمینه‌ی تیره‌ی هیرو (light) یا روشن (dark) */
	tone?: "light" | "dark";
};
