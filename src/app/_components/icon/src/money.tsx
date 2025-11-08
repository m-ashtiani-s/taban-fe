import { BaseIcon } from "@/app/_components/icon/base-icon"
import { svgIcon } from "@/app/_components/icon/icon.types"

export default function IconTheme(props:svgIcon) {
    return(
        <BaseIcon {...props}>
      <path d="M6 9.5v5m12-5v5M3.111 6H20.89C21.503 6 22 6.537 22 7.2v9.6c0 .663-.497 1.2-1.111 1.2H3.11C2.497 18 2 17.463 2 16.8V7.2C2 6.537 2.497 6 3.111 6ZM14.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
    </BaseIcon>
    )
}