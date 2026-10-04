import PropTypes from 'prop-types';
import { Modal, Button, Tag } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  DownloadOutlined,
  PrinterOutlined,
  CheckOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePdf from '@pages/Bills/Components/Invoice';
import InvoiceHtml from '@pages/Bills/Components/InvoiceHtml';
import dayjs from 'dayjs';

function PaymentConfirmation({
  isOpen,
  onClose,
  transaction,
  bill,
  onRetry,
}) {
  const activeBill = transaction?.billId && typeof transaction.billId === 'object' ? transaction.billId : bill;

  const isSuccess = transaction?.status === 'success';
  const isPending = transaction?.status === 'pending' || transaction?.status === 'initiated';
  const isFailed = transaction?.status === 'failed';

  const orderId = transaction?.orderId || '';
  const txnId = transaction?.gatewayTxnId || transaction?.bankTxnId || '-';
  const amount = transaction?.amount || activeBill?.total || 0;
  const paymentMode = transaction?.paymentMode || 'Online (Paytm)';
  const invoiceNumber = activeBill?.invoiceNo
    ? `${activeBill?.center_initial || activeBill?.center_id?.center_initial || ''}${activeBill?.invoiceNo}`
    : 'Invoice';

  const handlePrintReceipt = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);

    if (isIOS) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Payment Receipt</title></head><body>');
        const printContent = document.getElementById('printable-receipt-content');
        if (printContent) {
          printWindow.document.write(printContent.innerHTML);
        }
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
      }
      return;
    }

    if (isAndroid) {
      let iframe = document.getElementById('hidden-print-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);
      }
      const printContent = document.getElementById('printable-receipt-content');
      if (printContent && iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write('<html><head><title>Receipt</title></head><body>');
        iframe.contentWindow.document.write(printContent.innerHTML);
        iframe.contentWindow.document.write('</body></html>');
        iframe.contentWindow.document.close();
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 300);
      }
      return;
    }

    window.print();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={560}
      className="payment-confirmation-modal"
      destroyOnClose
    >
      <div className="py-2 px-1">
        {isSuccess && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-inner">
              <CheckCircleFilled className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-5">
              Your payment has been received and verified by Paytm.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 text-sm">Amount Paid</span>
                <span className="text-xl font-bold text-emerald-700">
                  ₹{Number(amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Invoice No.</span>
                <span className="font-semibold text-gray-800">#{invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-xs text-gray-700">{orderId}</span>
              </div>
              {txnId && txnId !== '-' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Paytm Txn ID</span>
                  <span className="font-mono text-xs text-gray-700">{txnId}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-medium text-gray-800">{paymentMode}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Date & Time</span>
                <span className="text-gray-700">
                  {dayjs(transaction?.completedAt || new Date()).format('DD MMM YYYY, hh:mm A')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-gray-500">Status</span>
                <Tag color="success" className="!px-3 !py-0.5 !rounded-full !font-medium">
                  PAID
                </Tag>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
              {activeBill && (
                <PDFDownloadLink
                  document={<InvoicePdf bill={activeBill} />}
                  fileName={`Receipt-${invoiceNumber}.pdf`}
                >
                  {({ loading: pdfLoading }) => (
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      loading={pdfLoading}
                      className="!bg-blue-600 hover:!bg-blue-500 !text-white !font-semibold !rounded-full !min-h-[44px] !px-6 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {pdfLoading ? 'Generating...' : 'Download Receipt'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              <Button
                size="large"
                icon={<PrinterOutlined />}
                onClick={handlePrintReceipt}
                className="!rounded-full !min-h-[44px] !px-5 flex items-center justify-center gap-2"
              >
                Print Receipt
              </Button>

              <Button
                size="large"
                icon={<CheckOutlined />}
                onClick={onClose}
                className="!rounded-full !min-h-[44px] !px-5"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-3 shadow-inner">
              <CloseCircleFilled className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Unsuccessful</h2>
            <p className="text-gray-500 text-sm mb-4">
              {transaction?.respMsg || 'The transaction was declined or cancelled.'}
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono text-xs">{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">₹{Number(amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status:</span>
                <Tag color="error" className="!rounded-full">FAILED</Tag>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button
                  type="primary"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={onRetry}
                  className="!rounded-full !min-h-[44px] !px-6"
                >
                  Try Again
                </Button>
              )}
              <Button
                size="large"
                onClick={onClose}
                className="!rounded-full !min-h-[44px] !px-6"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {isPending && (
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-3 shadow-inner">
              <ClockCircleFilled className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment Processing</h2>
            <p className="text-gray-500 text-sm mb-4">
              We are verifying your transaction with Paytm. This usually takes just a few seconds.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                type="primary"
                size="large"
                onClick={onClose}
                className="!rounded-full !min-h-[44px] !px-6"
              >
                View Bills
              </Button>
            </div>
          </div>
        )}
      </div>

      <div id="printable-receipt-content" className="hidden">
        {activeBill && <InvoiceHtml bill={activeBill} />}
      </div>
    </Modal>
  );
}

PaymentConfirmation.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  transaction: PropTypes.shape({
    orderId: PropTypes.string,
    status: PropTypes.string,
    amount: PropTypes.number,
    paymentMode: PropTypes.string,
    gatewayTxnId: PropTypes.string,
    bankTxnId: PropTypes.string,
    respMsg: PropTypes.string,
    completedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    billId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  bill: PropTypes.object,
  onRetry: PropTypes.func,
};

export default PaymentConfirmation;
