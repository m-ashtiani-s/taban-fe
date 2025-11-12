"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M14 5H4v4h10Zm6 0H4v14h16ZM3 5h18m-1 0h-6v14h6Z"/>
    </BaseIcon>
    )
}