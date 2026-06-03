"use client";
import React, { useState, useEffect, Key } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner, Tooltip, SortDescriptor, Pagination } from "@nextui-org/react";
import { TabanColumn, TabanTableProps } from "./tabanTable.type";
import "./tabanTable.scss";
import TabanLoading from "../tabanLoading/tabanLoading";

type MappedRow<T> = T & { rowNumber: number };

function limitText(text: string, limit: number): string {
	return text.length > limit ? text.slice(0, limit) + "..." : text;
}

export default function TabanTable<Option>({
	loading,
	rows = [],
	className,
	columns,
	page,
	setPage,
	totalElements,
	rowPerPage,
	sortOrders,
	defaultCelLimit = 200,
	setSortOrders,
	paginationMode = "front",
	sortingMode = "front",
	isSelectable = false,
	selectedItems,
	setSelectedItems,
	onPaginationChange,
	uniqueId,
	showRow = false,
}: TabanTableProps<Option>) {
	const [mappedData, setMappedData] = useState<(Option & { rowNumber: number })[]>([]);
	const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>();
	const [cols, setCols] = useState<TabanColumn<Option>[]>([]);
	const [pages, setPages] = useState<number>(0);
	const [allItemsChecked, setAllItemsChecked] = useState<boolean>(false);
	useEffect(() => {
		if (!!setSortOrders && sortDescriptor?.column) {
			const sorting = sortDescriptor?.direction == "ascending" ? "ASC" : "DESC";
			setSortOrders(`${sortDescriptor?.column}:${sorting}`);
		}
	}, [sortDescriptor]);

	const handleCheckboxChange = (row: Option) => {
		setSelectedItems!((prev) => {
			const isAlreadySelected = prev.some((item) => item[String(uniqueId) as keyof Option] === row[String(uniqueId) as keyof Option]);
			if (isAlreadySelected) {
				return prev.filter((item) => item[String(uniqueId) as keyof Option] !== row[String(uniqueId) as keyof Option]);
			} else {
				return [...prev, row];
			}
		});
	};
	const handleAllCheckboxChange = () => {
		if (uniqueId) {
			if (!rows || rows.length === 0) return;

			const allSelectedInCurrentPage = rows.every((row) => selectedItems?.some((item) => item[String(uniqueId) as keyof Option] === row[String(uniqueId) as keyof Option]));

			if (allSelectedInCurrentPage) {
				setSelectedItems!((prev) => prev.filter((item) => !rows.some((row) => row[String(uniqueId) as keyof Option] === item[String(uniqueId) as keyof Option])));
				setAllItemsChecked(false);
			} else {
				setSelectedItems!((prev) => [...prev, ...rows.filter((row) => !prev.some((item) => item[String(uniqueId) as keyof Option] === row[String(uniqueId) as keyof Option]))]);
				setAllItemsChecked(true);
			}
		}
	};

	useEffect(() => {
		if (uniqueId) {
			if (!rows || rows.length === 0) {
				setAllItemsChecked(false);
				return;
			}

			const allSelectedInCurrentPage = rows.every((row) => selectedItems?.some((item) => item[String(uniqueId) as keyof Option] === row[String(uniqueId) as keyof Option]));

			setAllItemsChecked(allSelectedInCurrentPage);
		}
	}, [rows, selectedItems]);

	function areObjectsEqual(obj1: any, obj2: any): boolean {
		if (obj1 === obj2) {
			return true;
		}
		if (obj1 === null || obj2 === null || typeof obj1 !== "object" || typeof obj2 !== "object") {
			return false;
		}
		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);
		if (keys1.length !== keys2.length) {
			return false;
		}
		for (const key of keys1) {
			if (!keys2.includes(key) || !areObjectsEqual(obj1[key], obj2[key])) {
				return false;
			}
		}
		return true;
	}

	const handlePageChange = (pageNumber: number) => {
		onPaginationChange && onPaginationChange();
		setPage(pageNumber);
	};

	useEffect(() => {
		if (!!columns && columns?.length > 0) {
			const newCols: TabanColumn<Option>[] = [...columns];
			sortingMode !== "front" &&
				showRow &&
				!isSelectable &&
				newCols?.unshift({
					field: "rowNumber",
					width: 56,
					headerName: "ردیف",
				});
			isSelectable &&
				showRow &&
				newCols?.unshift({
					field: "rowNumber",
					width: 56,
					headerName: (
						<label className="flex items-center cursor-pointer relative">
							<input
								type="checkbox"
								checked={allItemsChecked}
								onChange={handleAllCheckboxChange}
								className="gpeer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
								id="check2"
							/>
							<span className={`absolute text-white  ${allItemsChecked ? "opacity-100" : "opacity-0"}  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
								<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1">
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									></path>
								</svg>
							</span>
						</label>
					),
					renderCell: (row) => {
						return (
							<div className="inline-flex items-center">
								<label className="flex items-center cursor-pointer relative">
									<input
										type="checkbox"
										checked={selectedItems?.some((item) => item[String(uniqueId) as keyof Option] === row[String(uniqueId) as keyof Option])}
										onChange={() => handleCheckboxChange(row)}
										className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-primary checked:border-primary"
										id="check2"
									/>
									<span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
										<svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1">
											<path
												fill-rule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											></path>
										</svg>
									</span>
								</label>
							</div>
						);
					},
				});
			setCols(newCols);
		}
	}, [rows, columns, selectedItems]);

	useEffect(() => {
		!!rows &&
			setMappedData(
				rows?.map((e, i: number) => {
					return { ...e, rowNumber: i + 1 + (page - 1) * rowsPerPage };
				})
			);
	}, [rows, columns, selectedItems]);

	const rowsPerPage = rowPerPage;

	useEffect(() => {
		setPages(totalElements ? Math.ceil(totalElements / rowsPerPage) : 0);
	}, [totalElements]);
	const loadingState = loading ? "loading" : "idle";

	const renderCell = React.useCallback(
		(row: any, columnKey: any) => {
			const cellValue = row[columnKey as keyof any];
			for (let it of cols || []) {
				if (!!it?.renderCell && columnKey === it?.field) {
					return (
						<div
							style={{
								minWidth: it?.width ? it?.width : "initial",
								width: it?.width ? it?.width : "100%",
							}}
							className="flex"
						>
							{it.renderCell(row)}
						</div>
					);
				} else if (it?.celLimit && columnKey === it?.field) {
					return (
						<div style={{ minWidth: it?.width ? it?.width : "initial" }} className="">
							{cellValue || cellValue === 0 ? <div>{limitText(`${cellValue}`, it?.celLimit)}</div> : "-"}
						</div>
					);
				}
			}
			return cellValue || cellValue === 0 ? limitText(`${cellValue}`, defaultCelLimit) : "-";
		},
		[cols]
	);

	const renderCellClass = (key: Key) => {
		const cellCol = cols?.filter((it) => it?.field === key);
		if (cellCol[0]) {
			return cellCol[0]?.cellClassName;
		} else {
			return "";
		}
	};
	const renderLimiter = (key: Key) => {
		const cellCol = cols?.filter((it) => it?.field === key);
		if ((cellCol[0] && !!cellCol[0]?.renderCell) || (cellCol[0] && !!cellCol[0]?.celLimit)) {
			return "";
		} else {
			return "overflow-x-hidden text-ellipsis  whitespace-nowrap";
		}
	};
	const renderCellGrow = (key: Key) => {
		const cellCol = cols?.filter((it) => it?.field === key);
		if (cellCol[0] && cellCol[0]?.grow && !cellCol[0]?.width) {
			return cellCol[0]?.grow;
		} else {
			return 1;
		}
	};
	const items = React.useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;

		return mappedData.slice(start, end);
	}, [page, mappedData]);

	const sortedItems = React.useMemo(() => {
		if (sortDescriptor && sortingMode == "front") {
			return [...items].sort((a: any, b: any) => {
				const first = a[sortDescriptor.column as keyof any] as number;
				const second = b[sortDescriptor.column as keyof any] as number;
				const cmp = first < second ? -1 : first > second ? 1 : 0;

				return sortDescriptor.direction === "descending" ? -cmp : cmp;
			});
		} else {
			return items;
		}
	}, [sortDescriptor, items]);
	const sortedMappedData = React.useMemo(() => {
		if (sortDescriptor && sortingMode == "front") {
			return [...mappedData].sort((a: any, b: any) => {
				const first = a[sortDescriptor.column as keyof any] as number;
				const second = b[sortDescriptor.column as keyof any] as number;
				const cmp = first < second ? -1 : first > second ? 1 : 0;

				return sortDescriptor.direction === "descending" ? -cmp : cmp;
			});
		} else {
			return mappedData;
		}
	}, [sortDescriptor, mappedData]);

	const renderCellWidth = (key: Key) => {
		const cellCol = cols?.filter((it) => it?.field === key);
		if (cellCol[0] && cellCol[0]?.width) {
			return cellCol[0]?.width;
		} else {
			return "100%";
		}
	};

	return (
		<div className="taban-table">
			{!!cols && cols?.length > 0 && rows?.length >= 0 ? (
				<>
					<div className="max-lg:!hidden">
						<Table
							removeWrapper
							sortDescriptor={sortDescriptor}
							onSortChange={setSortDescriptor}
							className={`${pages === 1 && "[&_tbody>tr:nth-last-child(1)]:!border-b-0"} [&_tbody>tr>td]:py-0 [&_tbody>tr>td]:px-2  [&_thead>tr:nth-child(2)]:!hidden [&_thead]:!h-[41px] [&_tr]:!flex [&_tr]:items-center [&_tr]:content-center  [&_thead]:!px-2  [&_li[data-slot="prev"]>svg]:!rotate-180 [&_li[data-slot="next"]>svg]:!rotate-0 [&>div]:shadow-none [&_th]:!bg-white/0  [&_th]:!px-2 [&_th]:!pt-1  [&_thead]:border-b ${className}`}
							aria-label="Example table with client async pagination"
						>
							<TableHeader>
								{cols?.map((it) => (
									<TableColumn
										allowsSorting={it?.sortable}
										style={{ flexGrow: it?.grow ? it?.grow : 1, maxWidth: it?.width ? it?.width : "100%" }}
										className={`text-sm font-semibold text-neutral-700 !bg-none !w-inherit px-0 whitespace-normal flex-1 group [&_svg]:hidden duration-150 relative flex justify-start ${it?.headerClassName}`}
										key={it?.field}
									>
										<div className="relative w-fit flex items-center  text-sm">
											{it?.headerName}
											{it?.sortable && sortDescriptor?.column !== it?.field ? (
												<span className="absolute top-[1px] group-hover:!block hidden -left-6">
													<img src="/images/parvanTable/sort.svg" alt="" className="opacity-50 w-5" />
												</span>
											) : it?.sortable && sortDescriptor?.column === it?.field && sortDescriptor?.direction === "descending" ? (
												<span className="absolute top-[1px] -left-6">
													<img src="/images/parvanTable/arrow-gray.svg" alt="" className="group-hover:opacity-50 w-5 rotate-180 " />
												</span>
											) : it?.sortable && sortDescriptor?.column === it?.field && sortDescriptor?.direction === "ascending" ? (
												<span className="absolute top-[1px] -left-6">
													<img src="/images/parvanTable/arrow-gray.svg" alt="" className="group-hover:opacity-50 w-5" />
												</span>
											) : (
												""
											)}
										</div>
									</TableColumn>
								))}
							</TableHeader>
							<TableBody
								className=""
								items={paginationMode == "front" ? sortedItems : (sortedMappedData ?? [])}
								loadingContent={
									<div className="w-full h-full flex items-center justify-center bg-white/40 ">
										<Spinner />
									</div>
								}
								loadingState={loadingState}
							>
								{(item) => (
									<TableRow key={item?.rowNumber} className={`border-b-1  !bg-white }`}>
										{(columnKey) => (
											<TableCell
												style={{
													flexGrow: renderCellGrow(columnKey),
													maxWidth: renderCellWidth(columnKey),
												}}
												className={`!w-inherit flex-1 ${renderLimiter(columnKey)}  ${renderCellClass(columnKey)}`}
											>
												<div className={` text-sm font-medium py-1 !text-left text-neutral-700 ${renderLimiter(columnKey)}  ${renderCellClass(columnKey)}`}>
													{renderCell(item, columnKey)}
												</div>
											</TableCell>
										)}
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<div className="lg:!hidden flex flex-col">
						{sortedMappedData?.map((row, rowIndex) => (
							<>
								{rowIndex !== 0 && <div className="w-full h-[1px] bg-neutral-300 my-2 text-sm"></div>}
								<div key={row?.rowNumber} className="flex flex-col gap-1 relative">
									{cols?.map((col) => {
										if (col?.field !== "eye") {
											return (
												<div key={col?.field} className="flex items-start gap-1">
													<div className="text-neutral-500/90">{col?.headerName}:</div>
													<div className="font-medium">{renderCell(row, col?.field)}</div>
												</div>
											);
										} else {
											return (
												<div key={col?.field} className="flex items-start gap-1 absolute -left-3 -top-2">
													<div className="font-medium">{renderCell(row, col?.field)}</div>
												</div>
											);
										}
									})}
								</div>
							</>
						))}
					</div>
					{pages > 1 && (
						<div className="flex justify-between items-center py-2 px-4 bg-white border-t border-gray-300">
							<span className="text-xs text-neutral-500">
								نمایش صفحه {page} از {Math.ceil(totalElements / rowPerPage)} / کل آیتم ها: {totalElements} مورد
							</span>

							<div className="flex  justify-center [&_li[data-active=true]]:!rounded-lg">
								<Pagination
									isCompact
									disableAnimation
									showControls
									isDisabled={loading}
									showShadow
									color="primary"
									page={page}
									total={pages}
									onChange={(page) => {
										onPaginationChange && onPaginationChange();
										setPage(page);
									}}
								/>
							</div>
						</div>
					)}
				</>
			) : loading ? (
				<div className="flex gap-2 justify-center items-center py-12">
					<span className="text-primary text-lg">Please wait</span>
					<TabanLoading size={28} />
				</div>
			) : rows?.length == 0 && !loading ? (
				<div className="w-full flex mt-2 justify-center py-2">No data available</div>
			) : (
				""
			)}
		</div>
	);
}
