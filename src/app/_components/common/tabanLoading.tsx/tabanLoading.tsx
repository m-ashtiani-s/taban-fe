import styled from "styled-components";
import { TabanLoadingProps } from "./tabanLoading.type";
import { Spinner } from "@nextui-org/spinner";
import { useEffect, useRef, useState } from "react";

const LoaderCircle = styled.div<{ size: number; color: string; thickness: number }>`
	width: ${(props) => props.size}px;
	& > div > div {
		width: ${(props) => props.size}px;
		height: ${(props) => props.size}px;
	}
	& i {
		border-width: ${(props) => props.thickness}px;
		border-bottom-color: ${(props) => props.color} !important;
	}
`;
export default function TabanLoading({
	size = 32,
	color = "#f5a900",
	thickness = 3,
	className = "",
}: TabanLoadingProps) {
	const [mount, setMount] = useState<boolean>(false);

	useEffect(() => {
		setMount(true);
	}, []);
	return (
		<LoaderCircle size={size} color={color} thickness={thickness}>
			{mount && <Spinner className={className} />}
		</LoaderCircle>
	);
}
