"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <circle cx="9" cy="20" r="1.25"/><circle cx="17.5" cy="20" r="1.25"/><path d="M3 4h1.5l1.2 2m0 0 1.86 8.37A2 2 0 0 0 9.51 16h7.7a2 2 0 0 0 1.95-1.55l1.34-5.83A1 1 0 0 0 19.52 6H5.7Z"/>
    </BaseIcon>
    )
}
