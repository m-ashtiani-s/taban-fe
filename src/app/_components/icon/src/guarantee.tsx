"use client"

import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path clip-rule="evenodd" d="M9.559 3.697a3 3 0 0 1 4.882 0l.19.267a1 1 0 0 0 .925.413l.849-.095a3 3 0 0 1 3.313 3.313l-.095.85a1 1 0 0 0 .413.923l.267.19a3 3 0 0 1 0 4.883l-.267.19a1 1 0 0 0-.413.925l.095.849a3 3 0 0 1-3.313 3.313l-.85-.095a1 1 0 0 0-.923.413l-.19.267a3 3 0 0 1-4.883 0l-.19-.267a1 1 0 0 0-.925-.413l-.849.095a3 3 0 0 1-3.313-3.313l.095-.85a1 1 0 0 0-.413-.923l-.267-.19a3 3 0 0 1 0-4.883l.267-.19a1 1 0 0 0 .413-.925l-.095-.849a3 3 0 0 1 3.313-3.313l.85.095a1 1 0 0 0 .923-.413l.19-.267Zm6.148 5.596a1 1 0 0 1 0 1.414l-3.819 3.819c-.49.49-1.286.49-1.776 0l-1.82-1.819a1 1 0 1 1 1.415-1.414L11 12.586l3.293-3.293a1 1 0 0 1 1.414 0Z"/>
    </BaseIcon>
    )
}