"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="m13.818 4.545-.19-.267a2 2 0 0 0-3.255 0l-.19.267a2 2 0 0 1-1.85.825l-.848-.094a2 2 0 0 0-2.209 2.209l.094.849a2 2 0 0 1-.825 1.848l-.267.19a2 2 0 0 0 0 3.255l.267.19a2 2 0 0 1 .825 1.85l-.094.848a2 2 0 0 0 2.209 2.209l.849-.094a2 2 0 0 1 1.848.825l.19.267a2 2 0 0 0 3.255 0l.19-.267a2 2 0 0 1 1.85-.825l.848.094a2 2 0 0 0 2.209-2.209l-.094-.849a2 2 0 0 1 .825-1.848l.267-.19a2 2 0 0 0 0-3.255l-.267-.19a2 2 0 0 1-.825-1.85l.094-.848a2 2 0 0 0-2.209-2.209l-.849.094a2 2 0 0 1-1.848-.825Z"/><path d="m9 12 1.819 1.819v0c.1.1.262.1.362 0v0L15 10"/>
    </BaseIcon>
    )
}