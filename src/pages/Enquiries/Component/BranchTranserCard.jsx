import { Card } from "antd";
import PropTypes from "prop-types";

export default function BranchTransferCard({
  transfers = [],
  formatDate,
  title = "Center Transfers",
}) {
  if (!transfers || transfers.length === 0) return null;

  return (
    <>
      <Card bordered={false} className="rounded-xl bg-gray-50 pb-2">
        <h5 className="text-base font-semibold mb-3">{title}</h5>

        <div className="flex flex-col gap-2">
          {transfers.map((t, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white py-2 px-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">
                  {t.prevCenter?.center_name || "Unknown"}
                </span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">
                  {t.newCenter?.center_name || "Unknown"}
                </span>
              </div>

              <span className="text-xs text-gray-500">
                {formatDate(t.date)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

BranchTransferCard.propTypes = {
  transfers: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      prevCenter: PropTypes.shape({
        centerName: PropTypes.string,
      }),
      newCenter: PropTypes.shape({
        centerName: PropTypes.string,
      }),
    })
  ),
  formatDate: PropTypes.func.isRequired,
  title: PropTypes.string,
};