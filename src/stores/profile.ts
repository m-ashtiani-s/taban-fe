
import { Profile } from "@/types/profile.type";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ProfileState = {
	profile: Profile | null;
	/** تا اولین واکشیِ پروفایل (در AppBootstrap) resolve نشده، true است */
	loading: boolean;
	setProfile: (it: Profile | null) => void;
	setLoading: (v: boolean) => void;
};

export const useProfiletore = create<ProfileState>()(
	devtools((set) => ({
		profile: null,
		loading: true,
		setProfile: (it) => set({ profile: it }),
		setLoading: (v) => set({ loading: v }),
	}))
);
