import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M6.95 7.05a7 7 0 0 1 9.9 0l2.12 2.122c1.334 1.333 2 2 2 2.828 0 .828-.666 1.495-2 2.828l-2.12 2.122a7 7 0 0 1-9.9 0l-2.122-2.122c-1.333-1.333-2-2-2-2.828 0-.828.667-1.495 2-2.828L6.95 7.05Z"/>
    </BaseIcon>
    )
}