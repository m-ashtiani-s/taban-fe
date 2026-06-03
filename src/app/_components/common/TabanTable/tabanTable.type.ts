import { Dispatch, ReactNode, SetStateAction } from "react";

export type TabanTableProps<Row> = {
	isSelectable?: boolean;
	loading?: boolean;
	rows: Row[];
	selectedItems?: Row[];
	setSelectedItems?: Dispatch<SetStateAction<Row[]>>;
	className?: string;
	columns: TabanColumn<Row>[];
	page: number;
	setPage: Dispatch<SetStateAction<number>>;
	totalElements: number;
	rowPerPage: number;
	defaultCelLimit?: number;
	sortOrders?: string;
	setSortOrders?: Dispatch<SetStateAction<string>>;
	emptyText?: string;
	paginationMode?: "server" | "front";
	sortingMode?: "server" | "front";
	uniqueId?: keyof Row;
	onPaginationChange?: () => void;
	showRow?: boolean;
};

export type TabanColumn<Row> = {
	field: string;
	headerName: ReactNode;
	sortable?: boolean;
	width?: number;
	grow?: number;
	celLimit?: number;
	cellClassName?: string;
	headerClassName?: string;
	renderCell?: (row: Row) => any;
};
