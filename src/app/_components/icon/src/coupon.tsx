import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path clip-rule="evenodd" d="M3.75 6.75 4.5 6h15.75l.75.75v4.031h-.75a1.219 1.219 0 0 0 0 2.438H21v4.031l-.75.75H4.5l-.75-.75v-4.031h.75a1.219 1.219 0 0 0 0-2.438h-.75V6.75Zm1.5.75v1.886a2.72 2.72 0 0 1 0 5.228V16.5H9v-9H5.25Zm5.25 0v9h9v-1.886a2.72 2.72 0 0 1 0-5.228V7.5h-9Z"/>
    </BaseIcon>
    )
}