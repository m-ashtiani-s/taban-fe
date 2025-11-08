"use client";

import { TabanInputProps } from "./tabanTextarea.type";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const TabanTextarea = forwardRef<HTMLInputElement, TabanInputProps>(
	(
		{
			width,
			minHeight = 60,
			hasError,
			label = "",
			errorText = "",
			inputClassName = "",
			className = "",
			endAdornment = "",
			groupMode = false,
			setValue,
			hasLeading = false,
			isHandleError = false,
			removeHandler,
			isLtr = false,
			isPasswordInput = false,
			...rest
		},
		ref
	) => {
		const inputRef = useRef<HTMLInputElement>(null);
		useImperativeHandle(ref, () => inputRef.current!);
		const elementRef = useRef<HTMLDivElement>(null);
		const [addressFocused, setAddressFocused] = useState<boolean>(false);
		const [val, setVal] = useState<any>(rest?.value);


		const handleRemove = () => {
			if (!!setValue) {
				setVal("");
				groupMode ? setValue((prev: any) => ({ ...prev, [`${rest?.name}`]: "" })) : setValue("");
			}
			setAddressFocused(true);
			!!removeHandler && removeHandler();
		};

		const changeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (groupMode && !!setValue) {
				setValue((prev: any) => ({ ...prev, [`${rest?.name}`]: e?.target?.value }));
			} else if (!!setValue) {
				setValue(e?.target?.value);
			}
			!!rest?.onChange && rest?.onChange(e);
		};
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (elementRef.current && !elementRef?.current?.contains(event.target as Node)) {
					setAddressFocused(false);
				}
			};
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, []);

		return (
			<div ref={elementRef} className={` relative`}>
				{rest?.disabled && <div className="absolute w-full h-full top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>}
				{label && (
					<span
						onClick={() => {
							if (!rest?.disabled) {
								inputRef?.current?.focus();
								setAddressFocused(true);
							}
						}}
						className={`label absolute ${rest?.disabled ? "bg-[#fdfdfd]" : "bg-white"}  duration-200 py-1 px-1.5 pl-1.5 z-[9] ${
							addressFocused || !!rest?.value
								? `right-2 -top-[7px] text-xs  ${hasError ? "text-error" : "text-secondary"} `
								: `${hasLeading && !isLtr ? "right-10" : "right-3"} top-[15px] text-sm ${hasError ? "text-error" : "text-[#1C1B1F]"}`
						}`}
					>
						{label}
						{rest?.disabled && !!rest?.value && (
							<div className="absolute w-full h-[50%] top-0 left-0 bg-white/50 cursor-not-allowed z-20"></div>
						)}
					</span>
				)}
				{!endAdornment && addressFocused && !!rest?.value && !!setValue && (
					<span
						className={`absolute ${isLtr ? (isPasswordInput ? "right-12" : "right-4") : isPasswordInput ? "left-12" : "left-4"} ${label ? "top-4" : "top-4"} cursor-pointer`}
						onClick={handleRemove}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="24px" viewBox="0 0 24 24" fill="none">
							<path d="M9 9L15 15" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							<path d="M15 9L9 15" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							<circle
								cx="12"
								cy="12"
								r="9"
								stroke="#6a6a6a"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
				)}
				{!!endAdornment && (
					<span
						className={`absolute ${isLtr ? "right-4" : "left-4"} top-[42px] cursor-pointer text-sm font-light text-[#08090C]/50`}
					>
						{endAdornment}
					</span>
				)}
				
				{hasLeading && (
					<span
						onClick={() => {
							if (!rest?.disabled) {
								inputRef?.current?.focus();
								setAddressFocused(true);
							}
						}}
						className={`absolute ${isLtr ? "left-1" : "right-1"} duration-200 z-10  px-2 top-4`}
					>
						<svg width="24" height="24" className="w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

				<div
					onClick={() => {
						if (!rest?.disabled) {
							inputRef?.current?.focus();
							setAddressFocused(true);
						}
					}}
					className=""
				>
					<textarea
						style={{ width: "100%", minHeight: minHeight }}
						ref={inputRef}
						className={`disabled:bg-white py-2.5  mt-1 duration-150 px-4 rounded-lg ${isLtr ? "pr-[48px]" : "pl-[48px]"}  border-1 text-base !outline-0 text-[#08090C] ${
							hasError
								? "border-error text-error focus:outline-error focus:border-error"
								: "border-[#34426680] hover:border-[#34426680]  focus:border-[#08090C]"
						} ${hasLeading && "!pr-11"} ${isLtr ? "dir-ltr text-left" : "dir-rtl text-right"}  ${inputClassName}`}
						value={val}
						{...rest}
						onChange={changeHandler}
					/>
				</div>
				{isHandleError && <div className="text-error text-xs -mt-1 pr-3 h-4 whitespace-nowrap overflow-hidden text-ellipsis">{errorText}</div>}
			</div>
		);
	}
);

export default TabanTextarea;
