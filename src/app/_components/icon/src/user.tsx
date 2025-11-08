import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <circle cx="12" cy="9" r="3"/><circle cx="12" cy="12" r="10"/><path d="M17.97 20c-.16-2.892-1.045-5-5.97-5s-5.81 2.108-5.97 5"/>
    </BaseIcon>
    )
}