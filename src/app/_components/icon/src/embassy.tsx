"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M23 11.188v5.406c5.398 0 3.586 1.812 7.188 1.812H32V13h-1.813c-3.601 0-1.789-1.813-7.187-1.813ZM9 21c-.55 0-1 .45-1 1v3h34v-3a1 1 0 0 0-1-1Zm-8 6a1 1 0 0 0-1 1v21a1 1 0 0 0 1 1h48c.555 0 1-.445 1-1V28c0-.555-.445-1-1-1Zm5 5h3v5H6Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3ZM6 40h3v5H6Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3Zm7 0h3v5h-3Z"/>
    </BaseIcon>
    )
}