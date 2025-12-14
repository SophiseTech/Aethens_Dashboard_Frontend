import { Table } from "antd";
import { useEffect, useState } from "react";
import walletStore from "@stores/WalletStore";
import WalletDrawer from "./WalletDrawer";
import { useSearchParams } from "react-router-dom";

function WalletList() {
  const { wallets, loading, getWallets } = walletStore();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [searchParams] = useSearchParams();
  const studentIdFromURL = searchParams.get("studentId");

  useEffect(() => {
    getWallets(10, 1);
  }, []);

  useEffect(() => {
    if (!studentIdFromURL || wallets.length === 0) return;

    const wallet = wallets.find(
      (w) => w.student?._id === studentIdFromURL
    );

    if (wallet) {
      setSelectedWallet(wallet);
    }
  }, [studentIdFromURL, wallets]);

  const columns = [
    {
      title: "Student",
      dataIndex: ["student", "username"],
    },
    {
      title: "Admission No",
      dataIndex: ["student", "details_id", "admissionNumber"],
    },
    {
      title: "Course",
      dataIndex: ["student", "details_id", "course", "course_name"],
    },
    {
      title: "Balance",
      dataIndex: "balance",
      render: (v) => `₹${v}`,
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      render: (v) => new Date(v).toDateString(),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={wallets}
        loading={loading}
        rowKey="_id"
        onRow={(record) => ({
          onClick: () => setSelectedWallet(record),
        })}
      />

      <WalletDrawer
        wallet={selectedWallet}
        visible={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </>
  );
}

export default WalletList;
