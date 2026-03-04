import dayjs from 'dayjs';

/**
 * InvoiceHtml: A plain HTML/CSS version of the invoice.
 * Used on Android where @react-pdf/renderer's PDFViewer
 * (blob: URL in an iframe) cannot render inline and shows
 * an "Open in" prompt instead.
 */
const InvoiceHtml = ({ bill }) => {
    const items = bill?.items || [];
    const subtotal = bill?.subtotal || 0;
    const discount = bill?.total_discount || 0;
    const tax = bill?.total_tax || 0;
    const total = bill?.total || 0;
    const undiscountedTotal = bill?.undiscountedTotal || 0;
    const applyWallet = bill?.applyWallet || false;
    const walletAmountDeducted = bill?.walletAmountDeducted || 0;
    const finalTotal = bill?.finalTotal || 0;
    const walletCreditAmount = bill?.walletCreditAmount || 0;

    const year = new Date().getFullYear().toString().slice(-2);

    const getDiscountSymbol = (type) => {
        if (type === 'percentage') return '%';
        return '';
    };

    return (
        <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 13, color: '#1F2937', background: '#fff', padding: 20 }}>
            {/* Header */}
            <div style={{ background: '#4F651E', color: '#fff', borderRadius: 6, padding: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>SCHOOLOFATHENS LLP</div>
                    <div style={{ fontSize: 11 }}>2nd Floor, 238/242/11/3A/11/3</div>
                    <div style={{ fontSize: 11 }}>ELV Amoris main road</div>
                    <div style={{ fontSize: 11 }}>Whitefield, Bengaluru, 560066</div>
                    <div style={{ fontSize: 11, fontWeight: 'bold' }}>GSTIN: 29AFBFS0754B1Z8</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>TAX INVOICE</div>
            </div>

            {/* Invoice meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 'bold' }}>Invoice: {bill?.center_initial || 'SOA'}{bill?.invoiceNo}/{year}</span>
                <span>Date: {dayjs(bill?.generated_on).format('DD/MM/YYYY')}</span>
            </div>

            {/* Billed To */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 4, padding: 8, marginBottom: 14, display: 'inline-block', minWidth: 200 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Billed To</div>
                <div>{bill?.generated_for?.username}</div>
                <div>{bill?.generated_for?.address}</div>
                <div style={{ fontWeight: 'bold' }}>Adm No: {bill?.generated_for?.details_id?.admissionNumber}</div>
            </div>

            {/* Items table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #D1D5DB', borderRadius: 4, marginBottom: 16, fontSize: 12 }}>
                <thead>
                    <tr style={{ background: '#D3D3D3', fontWeight: 'bold' }}>
                        <th style={thStyle}>#</th>
                        <th style={{ ...thStyle, textAlign: 'left', width: '35%' }}>Item</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Rate</th>
                        <th style={thStyle}>Discount</th>
                        <th style={thStyle}>Tax Rate</th>
                        <th style={thStyle}>SGST</th>
                        <th style={thStyle}>CGST</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => (
                        <tr key={i} style={{ background: i % 2 === 1 ? '#F9FAFB' : '#fff', borderBottom: '1px solid #F3F4F6' }}>
                            <td style={tdStyle}>{i + 1}</td>
                            <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
                            <td style={tdStyle}>{item.qty}</td>
                            <td style={tdStyle}>{item.rate}</td>
                            <td style={tdStyle}>{item.discount}{getDiscountSymbol(item.discountType)}</td>
                            <td style={tdStyle}>{item.taxes}%</td>
                            <td style={tdStyle}>{((Number(item.taxAmnt) || 0) / 2).toFixed(2)}</td>
                            <td style={tdStyle}>{((Number(item.taxAmnt) || 0) / 2).toFixed(2)}</td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>{item.subtotal?.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                {/* Tax summary */}
                <div style={summaryBoxStyle}>
                    <div style={summaryRowStyle}><span>SGST:</span><span>{(tax / 2).toFixed(2)}</span></div>
                    <div style={summaryRowStyle}><span>CGST:</span><span>{(tax / 2).toFixed(2)}</span></div>
                    <div style={{ ...summaryRowStyle, fontWeight: 'bold' }}><span>Total Tax:</span><span>{tax.toFixed(2)}</span></div>
                </div>
                {/* Amount summary */}
                <div style={summaryBoxStyle}>
                    <div style={summaryRowStyle}><span>Gross Total:</span><span>(-) {undiscountedTotal.toFixed(2)}</span></div>
                    <div style={summaryRowStyle}><span>Discount:</span><span>(-) {discount.toFixed(2)}</span></div>
                    <div style={summaryRowStyle}><span>Sub Total:</span><span>{subtotal.toFixed(2)}</span></div>
                    <div style={summaryRowStyle}><span>Tax:</span><span>{tax.toFixed(2)}</span></div>
                    <div style={{ ...summaryRowStyle, fontWeight: 'bold' }}>
                        <span>{applyWallet ? 'Total' : 'Grand Total'}:</span>
                        <span>{total.toFixed(2)}</span>
                    </div>
                    {!applyWallet && walletCreditAmount > 0 && (
                        <div style={{ ...summaryRowStyle, fontWeight: 'bold' }}>
                            <span>Wallet Amount (+):</span><span>{walletCreditAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {applyWallet && (
                        <>
                            <div style={{ ...summaryRowStyle, fontWeight: 'bold' }}>
                                <span>Wallet Amount (-):</span><span>{walletAmountDeducted.toFixed(2)}</span>
                            </div>
                            <div style={{ ...summaryRowStyle, fontWeight: 'bold' }}>
                                <span>Grand Total:</span><span>{finalTotal.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Signature */}
            <div style={{ textAlign: 'right', marginTop: 30, fontSize: 12 }}>Authorized Signature</div>
        </div>
    );
};

const thStyle = {
    padding: '6px 4px',
    textAlign: 'center',
    borderBottom: '1px solid #C7D2FE',
};

const tdStyle = {
    padding: '6px 4px',
    textAlign: 'center',
};

const summaryBoxStyle = {
    border: '1px solid #D1D5DB',
    borderRadius: 4,
    padding: 8,
    background: '#F3F4F6',
    minWidth: 200,
    fontSize: 12,
};

const summaryRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 4,
};

export default InvoiceHtml;
