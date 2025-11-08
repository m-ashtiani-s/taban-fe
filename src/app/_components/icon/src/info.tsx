import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M7.847 9.734a.375.375 0 1 1-.53 0 .375.375 0 0 1 .53 0M12.265 9.734a.375.375 0 1 1-.53 0 .375.375 0 0 1 .53 0"/><path d="M20.997 6.16v7.65a3.177 3.177 0 0 1-3.177 3.178h-4.826L7.992 20.99v-4.002H6.167a3.177 3.177 0 0 1-3.178-3.177V6.16a3.177 3.177 0 0 1 3.178-3.178h11.652a3.177 3.177 0 0 1 3.178 3.178ZM17.002 13h-2"/>
    </BaseIcon>
    )
}