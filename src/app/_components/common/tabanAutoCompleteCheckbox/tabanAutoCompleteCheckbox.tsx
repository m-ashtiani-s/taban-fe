"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AutocompleteProps } from "./tabanAutoCompleteCheckbox.type";
import TabanCheckbox from "../tabanCheckbox/tabanCheckbox";

export default function TabanAutoCompleteCheckbox<Option>({
	placeholder = "",
	className = "",
	name = "",
	label = "",
	inputOnChange,
	onChange,
	options,
	selectedOptions = [],
	setSelectedOptions,
	displayField = "label" as keyof Option,
	valueField = "value" as keyof Option,
	hasLeading = false,
	loading = false,
	disabled = false,
	scrolled,
	height,
	showChips = false,
	chipsNumber = 5,
	errorText = "",
	isHandleError = false,
	hasError = false,
	renderLabel,
}: AutocompleteProps<Option>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const elementRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
	const [openUpwards, setOpenUpwards] = useState<boolean>(false);
	useEffect(() => {
		if (!isOpen) {
			const element = elementRef.current;
			if (element) {
				const rect = element.getBoundingClientRect();
				const spaceBelow = window.innerHeight - rect.bottom; // فضای زیر کامپوننت
				const spaceAbove = rect.top; // فضای بالای کامپوننت

				// اگر فضای پایین کمتر از ارتفاع لیست بود، به بالا باز شود
				setOpenUpwards(spaceBelow < 200 && spaceAbove > 200);
			}
		}
	}, [isOpen]);

	const selectItemHandler = async (e: React.ChangeEvent<HTMLInputElement>, option: Option) => {
		const itemChecked = await selectedOptions?.some((it) => it[valueField] === option[valueField]);
		if (itemChecked) {
			const updatedArray = selectedOptions.filter((item: Option) => item[valueField] !== option[valueField]);
			setSelectedOptions(updatedArray);
		} else {
			setSelectedOptions((prev: Option[]) => [...prev, option]);
		}
	};

	useEffect(() => {
		if (selectedOptions && selectedOptions?.length > 1) {
			setInputValue(`${String(selectedOptions[0][displayField])} و ${selectedOptions?.length - 1} مورد دیگر`);
		} else if (selectedOptions && selectedOptions?.length == 1) {
			setInputValue(`${String(selectedOptions[0][displayField])}`);
		} else {
			setInputValue("");
		}
	}, [selectedOptions]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setInputValue(inputValue);
		if (inputOnChange) {
			inputOnChange(e);
		} else {
			const newFilteredOptions = options.filter((option: Option) =>
				String(option[displayField]).toLowerCase().includes(inputValue.toLowerCase())
			);
			setFilteredOptions(newFilteredOptions);
			setIsOpen(true);
		}
		setHighlightedIndex(-1);
	};

	const handleSelect = (option: Option) => {
		onChange && onChange(option);
		setInputValue && setInputValue(String(option[displayField]));
	};

	const handleSpanClick = () => {
		if (inputRef.current && isOpen) {
			inputRef.current.blur();
			setIsOpen(false);
		} else if (inputRef.current && !isOpen) {
			inputRef.current.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen) return;

		switch (e.key) {
			case "Backspace":
				onChange && onChange(null);
				break;
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prevIndex) => (prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex));
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
				break;
			case "Enter":
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
					handleSelect(filteredOptions[highlightedIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				setHighlightedIndex(-1);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (Array.isArray(options)) {
			const filteredOption = options.filter((option) => !selectedOptions.includes(option));
			const newArray = selectedOptions.concat(filteredOption);
			setFilteredOptions(newArray);
		} else {
			setFilteredOptions([]);
		}
	}, [isOpen]);
	const selectInputText = () => {
		setTimeout(() => {
			inputRef.current?.select();
		}, 0);
	};

	useEffect(() => {
		if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length && listRef.current) {
			const optionElement = listRef.current.children[highlightedIndex] as HTMLLIElement;
			optionElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
		}
	}, [highlightedIndex]);

	useEffect(() => {
		setFilteredOptions(options);
	}, [options]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (elementRef.current && !elementRef?.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const clearHandler = () => {
		if (selectedOptions && selectedOptions?.length > 0) {
			setSelectedOptions([]);
			setIsOpen(false);
		}
	};

	const removeHandler = (item: Option) => {
		const updatedArray = selectedOptions.filter((it: Option) => it[valueField] !== item[valueField]);
		setSelectedOptions(updatedArray);
	};
	return (
		<>
			<div className="relative w-full text-[#1C1B1F]" ref={elementRef}>
				<div className="relative group mt-1">
					<input
						name={name || ""}
						ref={inputRef}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						value={inputValue}
						onFocus={() => {
							setIsOpen(true);
							selectInputText();
						}}
						className={`whitespace-nowrap pl-16 overflow-hidden text-ellipsis outline-0 ${className} ${
							hasLeading && "!pr-11"
						} placeholder:text-[#1C1B1F]/50 text-sm  w-full outline-0 border ${
							hasError
								? "border-error focus:outline-error focus:border-error"
								: `border-[#34426680] hover:border-[#34426680]  focus:border-[#08090C] ${isOpen && "!border-[#08090C]"}`
						} b rounded-lg py-[13px] px-6 outline-0 duration-200  z-20 text-black/80 focus:shadow-sm `}
					/>

					{label && (
						<span
							onClick={() => {
								if (!disabled) {
									inputRef?.current?.focus();
									setIsOpen(true);
								}
							}}
							className={`label absolute ${disabled ? "bg-[#fdfdfd]" : "bg-white"}  duration-200 py-1 px-1.5 pl-1.5 z-[9]  ${
								isOpen || (!!selectedOptions && selectedOptions?.length > 0)
									? `right-4 -top-[12px] text-xs  ${hasError ? "text-error" : ""} `
									: `${hasLeading ? "right-10" : "right-3"} top-2.5 text-sm ${hasError ? "text-error" : "text-[#1C1B1F]"}`
							}`}
						>
							{label}
							{disabled && !!(!!selectedOptions && selectedOptions?.length > 0) && (
								<div className="absolute w-full h-[50%] top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>
							)}
						</span>
					)}

					{isOpen && filteredOptions.length > 0 && !loading ? (
						<motion.ul
							animate={{ opacity: 1, ...(openUpwards ? { bottom: 48 } : { top: 48 }) }}
							initial={{ opacity: 0, ...(openUpwards ? { bottom: 0 } : { top: 48 }) }}
							transition={{ ease: "easeOut", duration: 0.2 }}
							ref={listRef}
							className="absolute w-full bg-white border border-black/20 rounded-md mt-1 overflow-y-auto z-30 shadow-lg py-4 flex flex-col px-2"
						>
							<div
								style={{ height: height && scrolled ? height : scrolled ? 300 : undefined }}
								className={`flex flex-col overflow-y-auto ${!!scrolled && " [&_::-webkit-scrollbar-thumb]:bg-[#ababab]"}`}
							>
								{filteredOptions.map((option: Option, index: number) => (
									<div
										key={String(option[valueField])}
										className={` cursor-pointer hover:!bg-gray-200/60 w-full flex items-center py-2 px-2`}
									>
										<TabanCheckbox
											id={String(option[valueField])}
											onChange={(e) => selectItemHandler(e, option)}
											selected={selectedOptions?.some(
												(it) => it[valueField] === option[valueField]
											)}
											label={
												renderLabel ? (
													renderLabel(option)
												) : (
													<span className="overflow-hidden w-full">
														{String(option[displayField])}
													</span>
												)
											}
										/>
									</div>
								))}
							</div>

							{/* <div className={`mt-8 flex gap-4 justify-end px-4 ${scrolled && "bg-white"}`}>
							<Button
								onClick={() => {
									setIsOpen(false);
									setInputValue("");
								}}
								variant="outlined"
								className="color-[#2E86DE] !rounded-lg !bg-white"
							>
								بستن
							</Button>
							<Button onClick={applyChangeHandler} className="!bg-[#2E86DE] disabled:!bg-[#1C1B1F1F] !rounded-lg">
								اعمال
							</Button>
						</div> */}
						</motion.ul>
					) : isOpen && loading ? (
						<motion.ul
							animate={{ opacity: 1, top: 48 }}
							initial={{ opacity: 0, top: 20 }}
							transition={{ ease: "easeOut", duration: 0.2 }}
							className="absolute w-full bg-white border border-black/20 rounded-md mt-1 max-h-64 overflow-y-auto z-30 shadow-lg"
						>
							<li className={`px-4 py-2  text-neutral-5 font-normal`}>درحال جستجو...</li>
						</motion.ul>
					) : (
						isOpen &&
						filteredOptions.length == 0 && (
							<motion.ul
								animate={{ opacity: 1, top: 48 }}
								initial={{ opacity: 0, top: 20 }}
								transition={{ ease: "easeOut", duration: 0.2 }}
								className="absolute w-full bg-white border border-black/20 rounded-md mt-1 max-h-64 overflow-y-auto z-30 shadow-lg"
							>
								<li className={`px-4 py-2  text-neutral-5 font-normal`}>داده ای موجود نیست</li>
							</motion.ul>
						)
					)}
					{hasLeading && (
						<span onClick={handleSpanClick} className={`absolute right-1 duration-200 z-10  px-2 top-[calc(50%-12px)]`}>
							<svg
								width="24"
								height="24"
								className="w-6"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<g clipPath="url(#clip0_1719_1315)">
									<path
										d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
										fill="#49454F"
									/>
								</g>
								<defs>
									<clipPath id="clip0_1719_1315">
										<rect width="24" height="24" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</span>
					)}
					<span
						onClick={clearHandler}
						className={`hidden absolute z-20 left-10 top-3 w-6 h-6 items-center justify-center hover:bg-neutral-200 rounded-full duration-150 cursor-pointer ${
							!!selectedOptions && selectedOptions?.length > 0 && !disabled && "group-hover:!flex"
						}`}
					>
						<img src="/images/zarbdar.svg" alt="" className="w-2.5" />
					</span>

					<span
						onClick={handleSpanClick}
						className={`arrow-d absolute duration-200 z-10  px-2 left-2 top-[calc(50%-12px)]  ${isOpen ? "!rotate-180" : "!rotate-0"}`}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="24px"
							viewBox="0 0 24 24"
							width="24px"
							className="w-6"
							fill="#5f6368"
						>
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M7 10l5 5 5-5z" />
						</svg>
					</span>
					{disabled && <div className="absolute w-full h-full top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>}
				</div>
				{isHandleError && (
					<div className="text-error text-xs mt-1 pr-4 h-4 whitespace-nowrap overflow-hidden text-ellipsis">{errorText}</div>
				)}
			</div>
			{showChips && (
				<div className="flex gap-2 mt-2 flex-wrap">
					{selectedOptions?.map((it: Option, index) => (
						<>
							{index < chipsNumber && (
								<div
									key={String(it[valueField])}
									className="bg-[#E8F1FF] rounded-lg py-1.5 px-3 pl-1.5 text-sm font-medium border border-[#49454F] flex items-center gap-2 justify-between"
								>
									{String(it[displayField])}
									<span
										className="flex items-center justify-center cursor-pointer"
										onClick={() => removeHandler(it)}
									>
										<img src="/images/cross.svg" className="w-[22px]" alt="" />
									</span>
								</div>
							)}
						</>
					))}
					{selectedOptions?.length > chipsNumber && (
						<div className="bg-[#E8F1FF] rounded-lg py-1.5 px-3 pl-1.5 text-sm font-medium border border-[#49454F] flex items-center gap-2 justify-between">
							{selectedOptions?.length - chipsNumber} مورد دیگر
						</div>
					)}
				</div>
			)}
		</>
	);
}
