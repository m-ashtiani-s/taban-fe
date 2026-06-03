import ProfileSidebar from "./_components/profileSidebar/profileSidebar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="container mx-auto px-4 py-6 lg:py-10">
			<div className="flex flex-col lg:flex-row gap-6">
				<ProfileSidebar />
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
