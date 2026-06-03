import { Suspense } from "react";
import NewOrder from "./_components/newOrder/newOrder";

export default function Page() {
	return (
		<Suspense>
			<NewOrder />
		</Suspense>
	);
}
