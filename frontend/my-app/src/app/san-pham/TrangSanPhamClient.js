"use client";

import { useEffect, useState } from "react";
import "./products.css";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const normalizeText = (str = "") =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export default function TrangSanPhamClient() {
    const [danhSach, setDanhSach] = useState([]);
    const [dangTai, setDangTai] = useState(true);

    const sptrang = 9;
    const [trangHienTai, setTrangHienTai] = useState(1);
    const [danhMuc, setDanhMuc] = useState("Tất cả");
    const [sapXep, setSapXep] = useState("");

    const searchParams = useSearchParams();
    const keyword = (searchParams.get("search") || "").trim();
    const keywordNorm = normalizeText(keyword);

    useEffect(() => {
        setTrangHienTai(1);
    }, [keywordNorm]);

    const fetchData = async () => {
        try {
            setDangTai(true);
            const res = await fetch("http://localhost:4000/api/products");
            const data = await res.json();
            setDanhSach(data);
        } catch (e) {
            console.log("Lỗi tải sản phẩm", e);
        } finally {
            setDangTai(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (dangTai) return <div className="pl-wrap">Đang tải sản phẩm...</div>;

    let danhSachLoc = danhSach;

    if (keywordNorm) {
        danhSachLoc = danhSachLoc.filter((sp) =>
            normalizeText(sp.name).includes(keywordNorm)
        );
    }

    if (danhMuc !== "Tất cả") {
        danhSachLoc = danhSachLoc.filter((sp) => sp.category === danhMuc);
    }

    if (sapXep === "giaTang") {
        danhSachLoc = [...danhSachLoc].sort((a, b) => a.price - b.price);
    } else if (sapXep === "giaGiam") {
        danhSachLoc = [...danhSachLoc].sort((a, b) => b.price - a.price);
    } else if (sapXep === "tenAZ") {
        danhSachLoc = [...danhSachLoc].sort((a, b) => a.name.localeCompare(b.name));
    }

    const tongTrang = Math.ceil(danhSachLoc.length / sptrang) || 1;
    const batDau = (trangHienTai - 1) * sptrang;
    const sanPhamHienThi = danhSachLoc.slice(batDau, batDau + sptrang);

    return (
        <div className="pl-layout">
            <div className="pl-sidebar">
                <h3>Danh mục</h3>
                <ul>
                    {["Tất cả", "Áo", "Quần", "Giày", "Phụ kiện"].map((dm) => (
                        <li
                            key={dm}
                            className={danhMuc === dm ? "active" : ""}
                            onClick={() => {
                                setDanhMuc(dm);
                                setTrangHienTai(1);
                            }}
                        >
                            {dm}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="pl-content-area">
                {keyword && (
                    <div style={{ marginBottom: 10 }}>
                        Đang tìm với từ khóa: <b>{keyword}</b> ({danhSachLoc.length} sản phẩm)
                    </div>
                )}

                <div className="pl-sort">
                    <label>Sắp xếp theo:</label>
                    <select
                        value={sapXep}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSapXep(value);
                            setTrangHienTai(1);
                            if (value === "") fetchData();
                        }}
                    >
                        <option value="">-- Chọn --</option>
                        <option value="giaTang">Giá tăng dần</option>
                        <option value="giaGiam">Giá giảm dần</option>
                        <option value="tenAZ">Tên (A-Z)</option>
                    </select>
                </div>

                <div className="pl-wrap">
                    <div className="pl-grid">
                        {sanPhamHienThi.length === 0 ? (
                            <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                        ) : (
                            sanPhamHienThi.map((sp) => (
                                <Link
                                    key={sp.id}
                                    href={`/san-pham/${sp.name
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "")
                                        .toLowerCase()
                                        .replace(/ /g, "-")}`}
                                    className="pl-card"
                                >
                                    <div className="pl-imgbox">
                                        <img src={sp.image} alt={sp.name} />
                                    </div>
                                    <div className="pl-info">
                                        <div className="pl-name">{sp.name}</div>
                                        <div className="pl-price">
                                            {sp.price.toLocaleString("vi-VN")}₫
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {sanPhamHienThi.length > 0 && (
                        <div className="pl-pagination">
                            <button
                                disabled={trangHienTai === 1}
                                onClick={() => setTrangHienTai(trangHienTai - 1)}
                            >
                                «
                            </button>
                            {[...Array(tongTrang)].map((_, i) => (
                                <button
                                    key={i}
                                    className={trangHienTai === i + 1 ? "active" : ""}
                                    onClick={() => setTrangHienTai(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={trangHienTai === tongTrang}
                                onClick={() => setTrangHienTai(trangHienTai + 1)}
                            >
                                »
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
