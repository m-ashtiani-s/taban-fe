import { ButtonHTMLAttributes } from "react";

export type TabanButtonProps=ButtonHTMLAttributes<HTMLButtonElement> &{
    variant?:"contained" | "bordered" | "text" | "icon",
    isOutline?:boolean;
    isLink?:boolean;
    href?:string;
    animatedIcon?:boolean;
    imageSrc?:boolean;
    target?:string;
    icon?:any;
    isEn?:boolean;
    isLoading?: boolean;
    loadingText?: string;
    loadingType?: "spinner" | "ring";
    className?:string;
}