
import { Profile } from "@/types/profile.type";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ProfileState = {
	profile: Profile | null;
	setProfile: (it: Profile | null) => void;
};

export const useProfiletore = create<ProfileState>()(
	devtools((set, get) => ({
		profile: null,
		setProfile: (it) => {
			set((state) => ({
				profile: it,
			}));
		}
	}))
);
