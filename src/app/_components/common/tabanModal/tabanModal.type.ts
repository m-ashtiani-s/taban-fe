import {ReactNode } from "react";


export type MemearButtonProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	onClose?:()=>void,
	title: string;
	children: ReactNode;
};
