import { Suspense } from "react";
import TrangSanPhamClient from "./TrangSanPhamClient";

export default function Page() {
    return (
        <Suspense fallback={<div className="pl-wrap">Đang tải sản phẩm...</div>}>
            <TrangSanPhamClient />
        </Suspense>
    );
}
