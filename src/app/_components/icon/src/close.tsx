import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="m16 16-4-4m0 0L8 8m4 4 4-4m-4 4-4 4"/>
    </BaseIcon>
    )
}