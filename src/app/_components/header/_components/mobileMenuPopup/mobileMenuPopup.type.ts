import { Dispatch, SetStateAction } from "react";

export type MobileMenuPopupProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
};
