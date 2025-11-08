import { ReactNode } from "react";

export type MobileTopHeaderProps={
    pageName:string;
    hasBAck?:boolean;
    backUrl?:string;
    backAction?:()=>void;
    sideComponent?:ReactNode
}