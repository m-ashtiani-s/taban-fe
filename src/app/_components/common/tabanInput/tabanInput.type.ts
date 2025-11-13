import { Dispatch, InputHTMLAttributes, ReactNode, SetStateAction } from "react";

export type TabanInputProps= InputHTMLAttributes<HTMLInputElement> & {
    inputClassName?:string;
    label?:string;
    variant?:string;
    endAdornment?:string;
    setValue?:Dispatch<SetStateAction<any>>;
    groupMode?:boolean;
    leadingIcon?:ReactNode;
    isHandleError?: boolean;
    hasError?:boolean;
    errorText?:string;
    removeHandler?:()=>void;
    isLtr?:boolean;
    isPasswordInput?:boolean;
    ref?:any
}