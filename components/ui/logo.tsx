import Image from "next/image";

interface ILogo {
    width?: number,
    height?: number
}
export default function Logo({ width = 30, height = 50 }: ILogo) {
    return (
        <Image src="/images/logo.webp" alt="UINMA" width={width} height={height}/>
    )
}