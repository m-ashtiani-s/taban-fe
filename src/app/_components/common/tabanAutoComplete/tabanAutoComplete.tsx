"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TabanAutoCompleteProps } from "./tabanAutoComplete.type";
import TabanLoading from "../tabanLoading.tsx/tabanLoading";

export default function TabanAutoComplete<Option>({
	placeholder = "",
	label = "",
	className = "",
	name = "",
	errorText = "",
	inputOnChange,
	hasError = false,
	onChange,
	options,
	selectedOption,
	setSelectedOption,
	displayField = "label" as keyof Option,
	valueField = "value" as keyof Option,
	hasLeading = false,
	loading = false,
	disabled = false,
	isHandleError = false,
	isShowValue = true,
	ItemKey,
	scrolled = false,
	height = 380,
	renderItem,
	emptyText,
}: TabanAutoCompleteProps<Option>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const elementRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState<string>("");
	const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [searched, setSearched] = useState<boolean>(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
	const [inputFocused, setInputFocused] = useState<boolean>(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearched(true);
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
		if (isShowValue) {
			setInputValue && setInputValue(String(option[displayField]));
		} else {
			setInputValue("");
		}

		setSelectedOption(option);
		setIsOpen(false);
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

	const selectInputText = () => {
		setTimeout(() => {
			inputRef.current?.select();
		}, 0);
	};

	useEffect(() => {
		if (!isOpen && !selectedOption) {
			setInputValue("");
		} else if (!isOpen && selectedOption && inputValue !== selectedOption[displayField]) {
			setInputValue("");
			setSelectedOption(null);
		}
	}, [inputValue, isOpen]);

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
		const handleClickOutside = async (event: MouseEvent) => {
			if (elementRef.current && !elementRef?.current?.contains(event.target as Node)) {
				setIsOpen(false);
				setInputFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [selectedOption]);
	useEffect(() => {
		if (!selectedOption) {
			setInputValue("");
		}
	}, [selectedOption]);

	const clearHandler = () => {
		if (selectedOption) {
			setSelectedOption(null);
			setInputValue("");
			setIsOpen(false);
			inputRef?.current?.focus();
		}
	};
	return (
		<div
			className="relative w-full text-[#1C1B1F] group"
			ref={elementRef}
			onClick={() => {
				if (!disabled) {
					setInputFocused(true);
				}
			}}
		>
			{label && (
				<span
					onClick={() => {
						if (!disabled) {
							inputRef?.current?.focus();
							setInputFocused(true);
						}
					}}
					className={`label absolute ${disabled ? "bg-[#fdfdfd]" : "bg-white"}  duration-200 py-1 px-1.5 pl-1.5 z-[9]  ${
						inputFocused || !!selectedOption
							? `right-4 -top-[12px] text-xs  ${hasError ? "text-error" : ""} `
							: `${hasLeading ? "right-10" : "right-3"} top-2.5 text-sm ${hasError ? "text-error" : "text-[#1C1B1F]"}`
					}`}
				>
					{label}
					{disabled && !!selectedOption && (
						<div className="absolute w-full h-[50%] top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>
					)}
				</span>
			)}
			<input
				name={name || ""}
				autoComplete="off"
				ref={inputRef}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				value={inputValue}
				onFocus={() => {
					setIsOpen(true);
					selectInputText();
				}}
				className={`${className} ${hasLeading && "!pr-11"}  text-sm  w-full border rounded-xl py-[13px] px-4 pr-3 duration-200 focus:border-1 z-20 ${
					hasError ? "text-error" : "text-black/80"
				}  focus:shadow-sm  pl-[68px] outline-1 ${
					hasError
						? "border-error focus:outline-error focus:border-error"
						: "border-[#34426680] hover:border-[#08090c]  focus:border-[#08090c]"
				}  outline outline-primary/0  `}
			/>

			{isOpen && (
				<motion.ul
					animate={{ opacity: 1, top: 48 }}
					initial={{ opacity: 0, top: 32 }}
					transition={{ ease: "easeOut", duration: 0.2 }}
					style={{ maxHeight: height && scrolled ? height : "380px" }}
					ref={listRef}
					className={`absolute w-full bg-white border border-black/20 rounded-md mt-1 overflow-y-auto z-[2000] shadow-lg py-2 flex flex-col px-2 ${
						scrolled && "max-h-96 [&_::-webkit-scrollbar-thumb]:bg-[#ababab]"
					}`}
				>
					{loading && (
						<div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-white/60">
							<TabanLoading />
						</div>
					)}
					<>
						{filteredOptions.length > 0 ? (
							<>
								{filteredOptions.map((option: Option, index: number) =>
									renderItem ? (
										<li
											key={String(option[valueField])}
											onClick={() => handleSelect(option)}
											className="mb-0  w-full hover:!bg-gray-200/60 gap-2"
										>
											{renderItem(option)}
										</li>
									) : (
										<li
											key={ItemKey ? ItemKey(option) : String(option[valueField])}
											onClick={() => handleSelect(option)}
											onMouseEnter={() => setHighlightedIndex(index)}
											className={`mb-0 text-[15px] cursor-pointer py-2 px-2 ${
												highlightedIndex === index && "bg-gray-200/60"
											} hover:!bg-gray-200/60 w-full flex items-center gap-2 ${hasLeading && "pr-9"}`}
										>
											{String(option[displayField])}
										</li>
									)
								)}
							</>
						) : filteredOptions.length === 0 && emptyText ? (
							<li className={`py-2 px-1 text-neutral-5 font-normal text-sm`}>{emptyText}</li>
						) : (
							<li className={`py-2 px-1 text-neutral-5 font-normal text-sm`}>
								{loading ? "در حال جستجو..." : searched ? "داده ای موجود نیست" : "برای جستجو تایپ کنید"}
							</li>
						)}
					</>
				</motion.ul>
			)}
			{hasLeading && (
				<span onClick={handleSpanClick} className={`absolute right-1 duration-200 z-10  px-2 top-3`}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g clip-path="url(#clip0_1719_1315)">
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
					!!selectedOption && !disabled && "group-hover:!flex"
				}`}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="24px" viewBox="0 0 24 24" fill="none">
					<path d="M9 9L15 15" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
					<path d="M15 9L9 15" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
					<circle cx="12" cy="12" r="9" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></circle>
				</svg>
			</span>

			<span onClick={handleSpanClick} className={`absolute duration-200 z-10  px-2 left-2 top-3  ${isOpen ? "!rotate-180" : "!rotate-0"}`}>
				<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#5f6368">
					<path d="M0 0h24v24H0z" fill="none" />
					<path d="M7 10l5 5 5-5z" />
				</svg>
			</span>
			{disabled && <div className="absolute w-full h-full top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>}
			{isHandleError && <div className="text-error text-xs mt-1 pr-3 h-4 whitespace-nowrap overflow-hidden text-ellipsis">{errorText}</div>}
		</div>
	);
}
