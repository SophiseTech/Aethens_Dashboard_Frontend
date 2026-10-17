import { Alert, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { isAndroid } from 'react-device-detect';
import InvoicePdf from '@pages/Bills/Components/Invoice';
import PropTypes from 'prop-types';

// Invoice preview/download for FeeTracker. Kept in its own module so FeeTracker can
// lazy-load it: @react-pdf is ~1.3 MB and FeeTracker is reachable from the app shell
// (Sidebar → student drawer), which would otherwise put it in the main bundle.
function InvoicePdfPreview({ bill }) {
  return (
    <div style={{ height: isAndroid ? 'auto' : '80vh' }}>
      {isAndroid ? (
        <div className="flex flex-col gap-4 justify-center items-center py-10">
          <Alert
            message="Preview Not Available"
            description="PDF preview is not supported on Android browsers. Please download the invoice to view it."
            type="info"
            showIcon
          />
          <PDFDownloadLink
            document={<InvoicePdf bill={bill} />}
            fileName={`INV-${bill?.center_initial || ''}${bill?.invoiceNo || 'Untitled'}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button type="primary" size="large" loading={pdfLoading} icon={<DownloadOutlined />}>
                {pdfLoading ? 'Preparing PDF...' : 'Download Invoice'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      ) : (
        <PDFViewer width="100%" height="100%">
          <InvoicePdf bill={bill} />
        </PDFViewer>
      )}
    </div>
  );
}

InvoicePdfPreview.propTypes = {
  bill: PropTypes.shape({
    center_initial: PropTypes.string,
    invoiceNo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
};

export default InvoicePdfPreview;
