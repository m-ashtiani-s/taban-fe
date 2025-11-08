import { Dispatch, SetStateAction } from "react";

export type ErrorModalProps={
    executeFunction:()=>void;
    callAble?:boolean,
    ticketAble?:boolean,
    title:string;
    errorText:string;
    open:boolean;
    setOpen:Dispatch<SetStateAction<boolean>>
}