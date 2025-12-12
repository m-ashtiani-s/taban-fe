"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M2 22h20M12 2c1.6.64 3.4.64 5 0v3c-1.6.64-3.4.64-5 0V2ZM12 5v3M17 8H7c-2 0-3 1-3 3v11h16V11c0-2-1-3-3-3ZM4.58 12h14.84" stroke-miterlimit="10"/><path d="M7.99 12v10M11.99 12v10M15.99 12v10" stroke-miterlimit="10"/>
    </BaseIcon>
    )
}