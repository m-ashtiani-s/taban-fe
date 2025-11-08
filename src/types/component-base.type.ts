export type ComponentBase = {
    isDisabled?:boolean;
    className?:string;
    variant?: Variant
    size?: Size
}

// export type Size= "tiny" | "small" | "normal" | "large"
export type Size= "tiny" | "small" | "normal" | "large";
export type Variant= "nutral" | "primary" | "secondary" | "accent" | "ghost" | "info" | "success" | "warning" | "error";
