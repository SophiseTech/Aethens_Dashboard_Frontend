import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1F2937', // gray-800
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 12,
    backgroundColor: '#4F651E', // blue-900
    color: '#fff',
    borderRadius: 6,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  companyAddress: {
    fontSize: 9,
    margintop: 4,
  },
  invoiceTitle: {
    fontSize: 20,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginVertical: 10,
  },
  box: {
    border: '1px solid #E5E7EB',
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#111827',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  label: {
    color: '#6B7280',
  },
  tableContainer: {
    marginTop: 10,
    border: '1px solid #D1D5DB',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#D3D3D3', // blue-100
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottom: '1px solid #C7D2FE',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottom: '1px solid #F3F4F6', // light row borders
  },
  rowAlt: {
    backgroundColor: '#F9FAFB',
  },
  col: {
    paddingHorizontal: 4,
    textAlign: 'left',
  },
  col1: { width: '5%' },
  col2: { width: '45%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '20%', textAlign: 'right' },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  summaryBox: {
    border: '1px solid #D1D5DB',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    // alignSelf: 'flex-end',
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notes: {
    marginTop: 20,
    fontSize: 9,
    color: '#374151',
    borderTop: '1px dashed #D1D5DB',
    paddingTop: 10,
  },
  signature: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'right',
    color: '#1F2937',
  },
  summaryGrandTotal: {
    fontFamily: "Helvetica-Bold",
  },
  fontBold: {
    fontFamily: "Helvetica-Bold",
  }
});

const InvoicePdf = ({ bill }) => {
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

  console.log(items);

  const ITEMS_FIRST_PAGE = 12; // you can change this
  const ITEMS_PER_PAGE = 20;   // for subsequent pages

  const getChunks = (items, firstPageLimit, pageLimit) => {
    if (items.length <= firstPageLimit) return [items];
    const firstChunk = items.slice(0, firstPageLimit);
    const rest = items.slice(firstPageLimit);
    const otherChunks = [];

    for (let i = 0; i < rest.length; i += pageLimit) {
      otherChunks.push(rest.slice(i, i + pageLimit));
    }

    return [firstChunk, ...otherChunks];
  };

  const getDiscountSymbol = (type) => {
    switch (type) {
      case 'percentage':
        return '%';
      case 'amount':
        return '';
      default:
        return '';
    }
  }
  const year = new Date().getFullYear().toString().slice(-2);

  return (
    <Document>
      {getChunks(items, ITEMS_FIRST_PAGE, ITEMS_PER_PAGE).map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header & Details only on first page */}
          {pageIndex === 0 && (
            <>
              <View style={styles.headerContainer}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.companyName}>SCHOOLOFATHENS LLP</Text>
                    <Text style={styles.companyAddress}>2nd Floor, 238/242/11/3A/11/3</Text>
                    <Text style={styles.companyAddress}>ELV Amoris main road</Text>
                    <Text style={styles.companyAddress}>Whitefield, Bengaluru, 560066</Text>
                    <Text style={[styles.companyAddress, styles.fontBold]}>GSTIN: 29AFBFS0754B1Z8</Text>
                  </View>
                  <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={[styles.fontBold]}>Invoice: {bill?.center_initial || 'SOA'}{bill?.invoiceNo}/{year}</Text>
                <Text>Date: {dayjs(bill?.generated_on).format("DD/MM/YYYY")}</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.row}>
                  <View style={styles.box}>
                    <Text style={styles.sectionTitle}>Billed To</Text>
                    <Text>{bill?.generated_for?.username}</Text>
                    <Text>{bill?.generated_for?.address}</Text>
                    <Text style={[styles.fontBold]}>Adm No: {bill?.generated_for?.details_id?.admissionNumber}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Table Header */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col, styles.col1]}>#</Text>
              <Text style={[styles.col, styles.col2]}>Item</Text>
              <Text style={[styles.col, styles.col3]}>Qty</Text>
              <Text style={[styles.col, styles.col4]}>Rate</Text>
              <Text style={[styles.col, styles.col4]}>Discount</Text>
              <Text style={[styles.col, styles.col4]}>Tax Rate</Text>
              <Text style={[styles.col, styles.col4]}>SGST</Text>
              <Text style={[styles.col, styles.col4]}>CGST</Text>
              <Text style={[styles.col, styles.col5]}>Amount</Text>
            </View>

            {chunk.map((item, i) => {
              const index = pageIndex === 0 ? i : ITEMS_FIRST_PAGE + (pageIndex - 1) * ITEMS_PER_PAGE + i;
              return (
                <View key={i} style={[styles.tableRow, index % 2 === 1 && styles.rowAlt]}>
                  <Text style={[styles.col, styles.col1]}>{index + 1}</Text>
                  <Text style={[styles.col, styles.col2]}>{item.name}</Text>
                  <Text style={[styles.col, styles.col3]}>{item.qty}</Text>
                  <Text style={[styles.col, styles.col4]}>{item.rate}</Text>
                  <Text style={[styles.col, styles.col4]}>{item.discount}{getDiscountSymbol(item.discountType)}</Text>
                  <Text style={[styles.col, styles.col4]}>{item.taxes}%</Text>
                  <Text style={[styles.col, styles.col4]}>{((Number(item.taxAmnt) || 0) / 2).toFixed(2)}</Text>
                  <Text style={[styles.col, styles.col4]}>{((Number(item.taxAmnt) || 0) / 2).toFixed(2)}</Text>
                  <Text style={[styles.col, styles.col5]}>{item.subtotal?.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>

          {/* Totals & Signature only on last page */}
          {pageIndex === getChunks(items, ITEMS_FIRST_PAGE, ITEMS_PER_PAGE).length - 1 && (
            <>
              <View style={[styles.summaryContainer]}>
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text>SGST:</Text>
                    <Text>{(tax / 2).toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>CGST:</Text>
                    <Text>{(tax / 2).toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryGrandTotal]}>
                    <Text>Total Tax:</Text>
                    <Text>{tax.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text>Gross Total:</Text>
                    <Text>(-) {undiscountedTotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Discount:</Text>
                    <Text>(-) {discount.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Sub Total:</Text>
                    <Text>{subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text>Tax:</Text>
                    <Text>{tax.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.summaryGrandTotal]}>
                    <Text>{applyWallet ? "Total" : "Grand Total"}:</Text>
                    <Text>{total.toFixed(2)}</Text>
                  </View>
                  {!applyWallet && walletCreditAmount > 0 && (
                    <View style={[styles.summaryRow, styles.summaryGrandTotal]}>
                      <Text>Wallet Amount (+):</Text>
                      <Text>{walletCreditAmount.toFixed(2)}</Text>
                    </View>
                  )}
                  {applyWallet && (
                    <>
                      <View style={[styles.summaryRow, styles.summaryGrandTotal]}>
                        <Text>Wallent Amount (-):</Text>
                        <Text>{walletAmountDeducted.toFixed(2)}</Text>
                      </View>
                      <View style={[styles.summaryRow, styles.summaryGrandTotal]}>
                        <Text>Grand Total:</Text>
                        <Text>{finalTotal.toFixed(2)}</Text>
                      </View>
                    </>
                  )}
                </View>

              </View>
              <Text style={styles.signature}>Authorized Signature</Text>
            </>
          )}
        </Page>
      ))}
    </Document>
  );

};

export default InvoicePdf;
