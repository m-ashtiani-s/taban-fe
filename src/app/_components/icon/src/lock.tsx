"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconLock(props: svgIcon) {
    return (
        <BaseIcon {...props}>
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
            <path d="M12 14.5v2.5" />
        </BaseIcon>
    )
}
