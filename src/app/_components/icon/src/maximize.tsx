import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="m14 10 6-6m0 0h-4.5M20 4v4.5M4 4l6 6M4 4v4.5M4 4h4.5M14 14l6 6m0 0v-4.5m0 4.5h-4.5M10 14l-6 6m0 0h4.5M4 20v-4.5"/>
    </BaseIcon>
    )
}