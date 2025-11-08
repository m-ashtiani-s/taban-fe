export type Res<T> = {
    fields: string;
    success: boolean;
    data: T | null;
    message: string
};

type Err={
    field: string,
    message: string,
}
