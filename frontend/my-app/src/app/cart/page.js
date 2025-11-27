'use client';

import { useEffect, useState } from "react";
import "./cart.css";

const mergeCartItems = (items) => {
    const map = {};

    items.forEach((item) => {
        const key = `${item.id}-${item.color || ""}-${item.size || ""}`;

        if (!map[key]) {
            map[key] = {
                ...item,
                qty: item.qty || 1, // nếu chưa có qty mặc đính 1
            };
        } else {
            map[key].qty += item.qty || 1;
        }
    });

    return Object.values(map);
};

export default function GioHang() {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra login
        const token = localStorage.getItem("auth_token");
        if (!token) {
            window.location.href = "/login?redirect=/gio-hang";
            return;
        }

        const raw = JSON.parse(localStorage.getItem("cart")) || [];
        const merged = mergeCartItems(raw);
        setCart(merged);
        localStorage.setItem("cart", JSON.stringify(merged));
        setLoading(false);
    }, []);

    // Cập nhật số lượng theo id + color + size
    const updateQty = (id, color, size, qty) => {
        const newCart = cart.map(item =>
            item.id === id &&
                item.color === color &&
                item.size === size
                ? { ...item, qty: Math.max(1, qty) } // ko bé hơn 1
                : item
        );

        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cart-updated"));
    };

    // Xóa 1 dòng theo id + color sĩze
    const removeItem = (id, color, size) => {
        const newCart = cart.filter(
            item =>
                !(
                    item.id === id &&
                    item.color === color &&
                    item.size === size
                )
        );

        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cart-updated"));
    };

    const total = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

    if (loading) return <div className="cart-container">Đang tải...</div>;

    if (cart.length === 0)
        return (
            <div className="cart-container">
                <h2>Giỏ hàng trống 😢</h2>
                <a className="cart-btn" href="/san-pham">Mua sắm ngay</a>
            </div>
        );

    return (
        <div className="cart-container">
            <h1>Giỏ hàng của bạn</h1>

            <table className="cart-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Màu sắc</th>
                        <th>Size</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Tổng</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {cart.map(item => (
                        <tr key={`${item.id}-${item.color}-${item.size}`}>
                            <td className="cart-prod">
                                <img src={item.image} alt={item.name} />
                                {item.name}
                            </td>

                            <td>
                                <span
                                    className="color-dot"
                                    title={item.color}
                                    style={{ backgroundColor: item.color }}
                                ></span>
                            </td>

                            <td>{item.size || "—"}</td>

                            <td>{item.price.toLocaleString()}₫</td>

                            <td>
                                <div className="qty-box">
                                    <button
                                        onClick={() =>
                                            updateQty(
                                                item.id,
                                                item.color,
                                                item.size,
                                                item.qty - 1
                                            )
                                        }
                                    >
                                        -
                                    </button>

                                    <input
                                        type="number"
                                        value={item.qty}
                                        min="1"
                                        onChange={e =>
                                            updateQty(
                                                item.id,
                                                item.color,
                                                item.size,
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                    <button
                                        onClick={() =>
                                            updateQty(
                                                item.id,
                                                item.color,
                                                item.size,
                                                item.qty + 1
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </td>

                            <td>{(item.price * item.qty).toLocaleString()}₫</td>

                            <td>
                                <button
                                    className="remove"
                                    onClick={() =>
                                        removeItem(item.id, item.color, item.size)
                                    }
                                >
                                    ✕
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="cart-total">
                Tổng thanh toán: <b>{total.toLocaleString()}₫</b>
            </div>

            <button
                className="cart-checkout"
                onClick={() => (window.location.href = "/thanh-toan")}
            >
                Thanh toán
            </button>
        </div>
    );
}
