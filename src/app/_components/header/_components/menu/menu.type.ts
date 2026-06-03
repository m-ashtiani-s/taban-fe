import { Dispatch, SetStateAction } from "react";

export type MenuPopupProps = {
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
};
