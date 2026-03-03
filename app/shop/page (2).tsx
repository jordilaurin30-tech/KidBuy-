"use client";

import Link from "next/link";

export default function ShopPage() {
  return (
    <div className="page">
      <h1 className="title">KidsBuy 🧸</h1>

      <div className="products">
        {/* TEDDY */}
        <Link href="/shop/teddy" className="card">
          <img src="/teddy.png" alt="Teddy" />
          <h2>Kuschelteddy</h2>
          <p>CHF 20.–</p>
          <span>⭐⭐⭐⭐⭐</span>
        </Link>

        {/* PUPPE */}
        <Link href="/shop/puppe" className="card">
          <img src="/puppe.png" alt="Puppe" />
          <h2>Spielpuppe</h2>
          <p>CHF 25.–</p>
          <span>⭐⭐⭐⭐⭐</span>
        </Link>

        {/* SPIELAUTO */}
        <Link href="/shop/spielauto" className="card">
          <img src="/spielauto.png" alt="Spielauto" />
          <h2>Spielauto</h2>
          <p>CHF 15.–</p>
          <span>⭐⭐⭐⭐⭐</span>
        </Link>
      </div>

      <style jsx>{`
        .page {
          padding: 60px;
        }

        .title {
          font-size: 42px;
          margin-bottom: 40px;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 40px;
        }

        .card {
          text-decoration: none;
          color: black;
          background: #f5f5f7;
          padding: 20px;
          border-radius: 20px;
          transition: transform 0.2s;
        }

        .card:hover {
          transform: translateY(-6px);
        }

        .card img {
          width: 100%;
          border-radius: 16px;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
