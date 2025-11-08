import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M16 6h-5.5v4H1v5h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-3a2 2 0 0 0-2-2h-2l-3-4m-4 1.5h3.5l2 2.5H12V7.5m-6 6A1.5 1.5 0 1 1 4.5 15 1.5 1.5 0 0 1 6 13.5m12 0a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5Z"/>
    </BaseIcon>
    )
}