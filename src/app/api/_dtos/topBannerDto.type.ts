export type TopBannerHomeDtoApi = {
	topbanner?: {
		id?:
			| false
			| {
					url?: string;
					alt?: string;
					width?: number;
					height?: number;
					title?: string;
			  };
		url?: string | false;
	};
	bannerlink?: string | null;
};
