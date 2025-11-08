export type ErrorComponentProps={
    executeFunction:()=>void;
    callAble?:boolean,
    ticketAble?:boolean,
    errorText?:string;
    variant?:"bordered" | "text"
}