export type FileUploaderProps = {
	files: File[];
	onChange: (files: File[]) => void;
	uploadedUrls?: string[];
	onRemoveUploaded?: (url: string) => void;
	accept?: string;
	allowedExtensions?: string[];
	multiple?: boolean;
	isLoading?: boolean;
	hasError?: boolean;
	errorText?: string;
	hint?: string;
};
