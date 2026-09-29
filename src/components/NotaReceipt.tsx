import { forwardRef } from 'react';
import type { Nota } from '../types/nota';
import { formatNumberOnly } from '../services/calculations';
import logoSvg from '../assets/logo.svg';
import '../styles/receipt.css';

interface NotaReceiptProps {
  nota: Nota;
  fillEmptyRows?: boolean;
}

export const NotaReceipt = forwardRef<HTMLDivElement, NotaReceiptProps>(
  ({ nota, fillEmptyRows = true }, ref) => {
    // Smart row logic: always add exactly 2 blank "space" rows after real items
    // so there's always breathing room below the last item before the total row.
    // Minimum of 3 rows (1 data + 2 space) always shown.
    const items = nota.items || [];
    const extraRows = fillEmptyRows ? 2 : 0;
    const emptyRows = Array.from({ length: extraRows });

    return (
      <div className="receipt-canvas" ref={ref} id={`receipt-canvas-${nota.id}`}>
        {/* Top Perforation / Tear dashes */}
        <div className="receipt-perforation">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="perforation-dash" />
          ))}
        </div>

        {/* Top Section: Logo (Left) and Customer / Date Info (Right) */}
        <div className="receipt-top-section">
          {/* Left: Rumah Gadang Minang Logo */}
          <div className="receipt-logo-box">
            <img
              src={logoSvg}
              alt="Logo Minang"
              className="receipt-logo-img"
            />
          </div>

          {/* Right: Info Lines with Dotted Underlines */}
          <div className="receipt-info-box">
            {/* 1. Tanggal */}
            <div className="info-line-dotted">
              <span className="info-label">Tanggal</span>
              <span className="info-colon">:</span>
              <span className="info-dotted-content">
                {nota.tanggal || '-'}
              </span>
            </div>

            {/* 2. Pemesan */}
            <div className="info-line-dotted">
              <span className="info-label">Pemesan</span>
              <span className="info-colon">:</span>
              <span className="info-dotted-content">
                {nota.customer?.nama || '-'}
              </span>
            </div>

            {/* 3. Toko */}
            <div className="info-line-dotted">
              <span className="info-label">Toko</span>
              <span className="info-colon">:</span>
              <span className="info-dotted-content">
                {nota.customer?.toko || '-'}
              </span>
            </div>

            {/* 4. No. Telp */}
            <div className="info-line-dotted">
              <span className="info-label">No. Telp</span>
              <span className="info-colon">:</span>
              <span className="info-dotted-content">
                {nota.customer?.noTelp || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Table of Items */}
        <div className="receipt-table-wrapper">
          <table className="receipt-table">
            <thead>
              <tr>
                <th className="col-menu">MAKANAN / MINUMAN</th>
                <th className="col-qty">QTY</th>
                <th className="col-harga">HARGA</th>
                <th className="col-jumlah">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || index} className="item-row">
                  <td className="col-menu">{item.menu}</td>
                  <td className="col-qty">{item.qty}</td>
                  <td className="col-harga">{formatNumberOnly(item.harga)}</td>
                  <td className="col-jumlah">{formatNumberOnly(item.jumlah)}</td>
                </tr>
              ))}

              {/* Blank filler rows matching physical ruled lines */}
              {emptyRows.map((_, i) => (
                <tr key={`empty-${i}`} className="empty-row">
                  <td className="col-menu">&nbsp;</td>
                  <td className="col-qty">&nbsp;</td>
                  <td className="col-harga">&nbsp;</td>
                  <td className="col-jumlah">&nbsp;</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan={3} className="total-label">
                  TOTAL
                </td>
                <td className="total-amount">
                  {formatNumberOnly(nota.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Section: NOTE Box (Left) and Terima Kasih (Right) */}
        <div className="receipt-bottom-section">
          {/* Left: NOTE Box */}
          <div className="receipt-note-box">
            <span className="note-box-title">NOTE :</span>
            <span className="note-box-text">
              {nota.note || ''}
            </span>
          </div>

          {/* Right: Terima Kasih (Replacing Hormat Kami) */}
          <div className="receipt-thanks-col">
            <span className="thanks-text">
              Terima Kasih
            </span>
            <span className="thanks-slogan">
              #LamakBana
            </span>
            <span className="thanks-subtext">
              ( {nota.notaNumber} )
            </span>
          </div>
        </div>
      </div>
    );
  }
);

NotaReceipt.displayName = 'NotaReceipt';
