'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './noibatProducts.css';

export default function FeaturedProducts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [showPopup, setShowPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?featured=1`);

                const data = await res.json();
                setItems(data);
            } catch (e) {
                console.error('Load products failed', e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    // Mở popup
    const openPopup = (product) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login?redirect=/');
            return;
        }

        setSelectedProduct(product);
        setSelectedColor(null);
        setSelectedSize(null);
        setQty(1);
        setShowPopup(true);
    };

    // Xác nhận thêm vào giỏ
    const confirmAdd = () => {
        if (!selectedColor || !selectedSize) {
            alert("Vui lòng chọn màu sắc và size!");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        // kiểm tra đã có sản phẩm cùng id + màu + size chưa
        const existingIndex = cart.findIndex(
            item =>
                item.id === selectedProduct.id &&
                item.color === selectedColor &&
                item.size === selectedSize
        );

        if (existingIndex !== -1) {
            // nếu có rồi thì cộng thêm số lượng
            cart[existingIndex].qty += qty;
        } else {
            // chưa có thì thêm mới
            cart.push({
                id: selectedProduct.id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.image,
                color: selectedColor,
                size: selectedSize,
                qty: qty,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        // 🔔 báo cho NavBar cập nhật badge
        window.dispatchEvent(new Event("cart-updated"));

        alert("Đã thêm vào giỏ hàng!");
        setShowPopup(false);
    };


    if (loading) return <div className="fp-wrap">Đang tải sản phẩm nổi bật...</div>;

    return (
        <div className="fp-wrap">
            <h2 className="fp-title">Sản phẩm nổi bật</h2>
            <div className="fp-grid">
                {items.map(p => {
                    const slug = p.name
                        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        .toLowerCase().replace(/ /g, '-');

                    return (
                        <div key={p.id} className="fp-card">

                            {/* CLICK VÀO CHUYỂN TRANG */}
                            <a href={`/san-pham/${slug}`} className="fp-link">
                                <div className="fp-imgbox">
                                    <img src={p.image} alt={p.name} />
                                </div>
                                <div className="fp-info">
                                    <div className="fp-name">{p.name}</div>
                                    <div className="fp-price">
                                        {p.price.toLocaleString('vi-VN')}₫
                                    </div>
                                </div>
                            </a>

                            {/* Nút thêm vào giỏ hàng */}
                            <button className="fp-btn" onClick={() => openPopup(p)}>
                                Thêm vào giỏ hàng
                            </button>

                        </div>
                    );
                })}
            </div>


            {showPopup && selectedProduct && (
                <div className="popup-overlay">
                    <div className="popup-box small-box">

                        <button className="close-btn" onClick={() => setShowPopup(false)}>✖</button>

                        <div className="popup-section">
                            <label>Màu sắc:</label>
                            <div className="popup-opts">
                                {[
                                    { name: "Đen", code: "#000000" },
                                    { name: "Trắng", code: "#ffffff" },
                                    { name: "Đỏ đô", code: "#8a1538" },
                                    { name: "Xanh rêu", code: "#0b6e4f" },
                                ].map(c => (
                                    <button
                                        key={c.code}
                                        className={`opt-btn ${selectedColor === c.code ? "active" : ""}`}
                                        style={{ background: c.code }}
                                        title={c.name}
                                        onClick={() => setSelectedColor(c.code)}
                                    ></button>
                                ))}
                            </div>
                        </div>


                        <div className="popup-section">
                            <label>Size:</label>
                            <div className="popup-opts">
                                {["S", "M", "L", "XL"].map(s => (
                                    <button
                                        key={s}
                                        className={`opt-btn ${selectedSize === s ? "active" : ""}`}
                                        onClick={() => setSelectedSize(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="popup-section">
                            <label>Số lượng:</label>
                            <div className="qty-box">
                                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(qty + 1)}>+</button>
                            </div>
                        </div>

                        <button className="confirm-btn" onClick={confirmAdd}>
                            Xác nhận
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}
