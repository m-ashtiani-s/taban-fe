import Link from "next/link";
import { BlogPostProps } from "./blogPost.type";
import Image from "next/image";
import { IconArrow } from "../icon/icons";

export default function BlogPost({ post }: BlogPostProps) {
	return (
		<Link href={`/posts/${post?.title}`} className="group">
			<div className="border rounded-xl p-6">
				<div style={{ background: `url('${post?.image}')` }} className="h-44 rounded-lg relative !bg-center !bg-cover">
					<div className="absolute left-6 bottom-0">
						<Image src="/images/blog/blogbtnBg.svg" width={65} height={26} alt="" />
					</div>
					<div className="absolute left-[39.5px] -bottom-4 w-9 h-9 bg-suppliment-full rounded-full group-hover:!bg-secondary duration-200 flex items-center justify-center">
						<IconArrow
							strokeWidth={0}
							className="fill-secondary group-hover:!fill-suppliment-full duration-200 -rotate-90"
							width={28}
							height={28}
						/>
					</div>
				</div>
				<div className="peyda text-lg font-semibold mt-6 h-14 overflow-clip">{post?.title}</div>
				<div className="text-neutral-600 h-12 overflow-clip mt-2" dangerouslySetInnerHTML={{ __html: post?.excerpt }}></div>
			</div>
		</Link>
	);
}
