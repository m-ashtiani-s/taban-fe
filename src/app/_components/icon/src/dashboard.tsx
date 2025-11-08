import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M3 8.976C3 4.055 4.055 3 8.976 3h6.048C19.945 3 21 4.055 21 8.976v6.048C21 19.945 19.945 21 15.024 21H8.976C4.055 21 3 19.945 3 15.024V8.976Z"/><path d="M21 9H3M9 21V9"/>
    </BaseIcon>
    )
}