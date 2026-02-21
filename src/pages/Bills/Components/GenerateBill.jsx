import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomSubmit from "@components/form/CustomSubmit";
import ItemsInputTable from "@pages/Bills/Components/ItemsInputTable";
import { sumFromObjects } from "@utils/helper";
import { Form, Modal, Table, Checkbox, Card, Divider, Tag, Space, Alert } from "antd";
import { WalletOutlined, DollarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import centersStore from "@stores/CentersStore";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";

function GenerateBill({
  items = [],
  courses = [],
  customers = [],
  customersOptions = [],
  invoiceNo,
  center_initial = '',
  loadInitData = () => { },
  onSave = async () => { },
  handleCancel,
  isModalOpen,
  handleOk,
  onSearch,
}) {
  const [selectedItem, setSelectedItem] = useState({});
  const [totals, setTotals] = useState({});
  const [applyWallet, setApplyWallet] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [form] = Form.useForm();
  const selectedSubject = Form.useWatch("subject", form);
  const selectedFormCenter = Form.useWatch("centerId", form);
  const selectedCustomer = Form.useWatch("generated_for", form);
  const { centers, getCenters, setSelectedCenter, selectedCenter } = useStore(centersStore);
  const { user } = useStore(userStore);

  // Format invoice number for display (e.g., "WFD1001")
  const formattedInvoiceNo = `${center_initial}${invoiceNo}`;

  const initialValues = {
    invoiceNo: invoiceNo || 0,
    items: [],
    generated_for: "",
    subject: "",
    generated_on: dayjs(),
    discountType: "percentage",
  };
  const loading = false;

  const subjectOptions = [
    {
      label: "Materials",
      value: "materials",
    },
    {
      label: "Gallery",
      value: "gallery",
    },
    {
      label: "Courses",
      value: "course",
      disabled: true,
    },
  ];

  const getItemType = (selectedSubject) => {
    switch (selectedSubject) {
      case "materials":
        return "InventoryItem";
      case "gallery":
        return "InventoryItem";
      case "course":
        return "Course";
      default:
        break;
    }
  };

  useEffect(() => {
    getCenters();
  }, []);

  useEffect(() => {
    form.setFieldValue("invoiceNo", invoiceNo)
  }, [invoiceNo])

  useEffect(() => {
    if (selectedFormCenter && selectedFormCenter !== selectedCenter) setSelectedCenter(selectedFormCenter);
  }, [selectedFormCenter])

  // Loading Initial dropdown data. Function should be passed from parent
  useEffect(() => {
    if (user.role === ROLES.ADMIN) {
      if (selectedFormCenter) {
        loadInitData({ itemType: selectedSubject, centerId: selectedFormCenter });
      }
    } else {
      loadInitData({ itemType: selectedSubject });
    }
  }, [selectedSubject, selectedFormCenter]);

  useEffect(() => {
    setPaymentAmount(totals?.total || 0);
  }, [totals])


  // Submit function
  const onSubmit = async (values) => {
    values?.items?.forEach((item, index) => {
      item.item = selectedItem[index]?._id;
      item.name = selectedItem[index]?.name;
      item.item_type = getItemType(selectedSubject);
    });
    console.log(values);
    await onSave({
      ...values,
      ...totals,
      center_initial: center_initial,  // Include center initial for storage
      walletBalance: walletBalance,
      applyWallet: applyWallet,
      walletAmountDeducted: walletAmountDeducted,
      finalTotal: finalGrandTotal,
      paymentAmount: paymentAmount,
      walletCreditAmount: walletCreditAmount,
      newWalletBalance: walletBalance + walletCreditAmount - walletAmountDeducted,
      walletId: selectedCustomerData?._id
    });
    handleOk();
  };

  const columns2 = [
    {
      dataIndex: "name",
      className: "font-bold text-start",
    },
    {
      dataIndex: "value",
      className: "text-end font-semibold",
      render: (value, record, index) => {
        if (record.name === "Final Total") {
          return <p className="font-bold text-lg text-green-600">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Grand Total" && applyWallet && walletBalance > 0) {
          return <p className="font-bold text-lg text-primary line-through opacity-60">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Grand Total") {
          return <p className="font-bold text-lg text-primary">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Amount Deducted (Wallet)") {
          return <p className="font-semibold text-orange-600">-₹{value?.toFixed(2)}</p>;
        }
        // if (record.name === "Wallet Balance") {
        //   return <p className="font-semibold text-blue-600">₹{value?.toFixed(2)}</p>;
        // }
        if (record.name === "Payment Amount") {
          return <p className="font-bold text-lg text-green-600">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Wallet Credit") {
          return <p className="font-semibold text-purple-600">+₹{value?.toFixed(2)}</p>;
        }
        return `₹${value?.toFixed(2) || 0}`;
      },
    },
  ];
  // console.log(items);

  const itemsOptionsBySubject = useMemo(() => {
    if (!selectedSubject) {
      return items?.map((item) => ({ label: item.name, value: item._id }));
    }
    return items
      ?.filter((item) => item.type === selectedSubject)
      ?.map((item) => ({ label: item.name, value: item._id }));
  }, [items, selectedSubject]);

  const centerOptions = useMemo(
    () =>
      centers?.map((center) => ({
        label: center.center_name,
        value: center._id,
      })),
    [centers]
  );

  const selectedCustomerData = useMemo(() => {
    if (!selectedCustomer) return null;
    return customersOptions.find((option) => option.value === selectedCustomer)?.data || null;
  }, [selectedCustomer, customersOptions]);

  const walletBalance = selectedCustomerData?.balance || 0;
  const walletAmountDeducted = applyWallet && walletBalance > 0 ? Math.min(walletBalance, totals?.total || 0) : 0;
  const finalGrandTotal = (totals?.total || 0) - walletAmountDeducted;
  const excessPayment = Math.max(0, paymentAmount - finalGrandTotal);
  const walletCreditAmount = excessPayment;

  return (
    <>
      <Modal
        title={"Generate Bill"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"90%"}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <div className="flex gap-5">
            <CustomInput
              label={center_initial ? `Invoice Number (${formattedInvoiceNo})` : "Invoice Number"}
              name={"invoiceNo"}
              placeholder={"1001"}
              inputProps={{ readOnly: true }}
            />
            <CustomDatePicker
              label={"Invoice Date"}
              name={"generated_on"}
              className="w-full"
            />
          </div>
          <div className="flex gap-5">
            {/* <CustomInput label={"Subject"} name={"subject"} placeholder={"Materials"} /> */}
            <CustomSelect
              name={"generated_for"}
              options={customersOptions}
              label={"Select Customer"}
              placeholder="Customer"
            />
            <CustomSelect
              name={"subject"}
              options={subjectOptions}
              label={"Subject"}
              placeholder="Subject"
              disabled={user.role === ROLES.ADMIN && !selectedFormCenter}
            />
          </div>
          <div className="w-1/2">
            {user.role === ROLES.ADMIN && (
              <CustomSelect
                label={"Center"}
                name={"centerId"}
                options={centerOptions}
              />
            )}
          </div>
          <ItemsInputTable
            form={form}
            items={items}
            itemsOptions={itemsOptionsBySubject}
            name={"items"}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setTotals={setTotals}
            itemType={selectedSubject}
            onSearch={onSearch}
          />
          <div className="flex flex-row-reverse items-start gap-6">
            <Table
              className="w-fit ml-auto"
              showHeader={false}
              columns={columns2}
              pagination={false}
              dataSource={[
                { name: "Gross Total", value: totals?.undiscountedTotal },
                { name: "Discount", value: totals?.total_discount },
                { name: "Subtotal", value: totals?.subtotal },
                { name: "Total Tax", value: totals?.total_tax },
                { name: "Grand Total", value: totals?.total },
                ...(walletBalance > 0 ? [
                  // { name: "Wallet Balance", value: walletBalance },
                  ...(applyWallet ? [{ name: "Amount Deducted (Wallet)", value: walletAmountDeducted }] : []),
                ] : []),
                ...(applyWallet && walletBalance > 0 ? [{ name: "Final Total", value: finalGrandTotal }] : []),
                ...(paymentAmount > 0 ? [{ name: "Payment Amount", value: paymentAmount }] : []),
                ...(walletCreditAmount > 0 ? [{ name: "Wallet Credit", value: walletCreditAmount }] : []),
              ]}
            />

            {finalGrandTotal > 0 && (
              <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50" style={{ borderLeft: "4px solid #52c41a" }}>
                <Space direction="vertical" className="w-full" size="small">
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder={`Enter amount (min: ₹${finalGrandTotal.toFixed(2)})`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-base font-semibold bg-white"
                  />

                  {paymentAmount > 0 && (
                    <div className="space-y-2">
                      {paymentAmount < finalGrandTotal && (
                        <Alert
                          message={`Insufficient payment`}
                          description={`Amount due: ₹${(finalGrandTotal - paymentAmount).toFixed(2)}`}
                          type="error"
                          showIcon
                          style={{ fontSize: "12px" }}
                        />
                      )}
                      {paymentAmount === finalGrandTotal && (
                        <Alert
                          message="Exact payment"
                          type="success"
                          showIcon
                        />
                      )}
                      {paymentAmount > finalGrandTotal && (
                        <Alert
                          message={`Excess payment: ₹${walletCreditAmount.toFixed(2)}`}
                          description={`This amount will be credited to the wallet`}
                          type="warning"
                          showIcon
                          icon={<WalletOutlined />}
                          style={{ fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                </Space>
              </Card>
            )}

            {walletBalance >= 0 ? (
              <Card
                className="mt-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
                style={{ borderLeft: "4px solid #1890ff" }}
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <div className="flex flex-col justify-between">
                    <p className="text-sm text-gray-600 mb-1">Available Wallet Balance</p>
                    <div className="flex gap-2 items-center">
                      <WalletOutlined className="text-2xl text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">₹{walletBalance.toFixed(2)}</p>
                    </div>
                    {applyWallet && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Applied
                      </Tag>
                    )}
                  </div>

                  <Divider className="my-3" />

                  <Checkbox
                    checked={applyWallet}
                    onChange={(e) => setApplyWallet(e.target.checked)}
                    className="text-base"
                  >
                    <span className="font-medium">Use wallet balance to reduce bill amount</span>
                  </Checkbox>

                  {applyWallet && walletBalance > 0 && (
                    <Alert
                      message={`₹${walletAmountDeducted.toFixed(2)} will be deducted from wallet`}
                      description={`Your new total: ₹${finalGrandTotal.toFixed(2)} (Remaining wallet: ₹${(walletBalance - walletAmountDeducted).toFixed(2)})`}
                      type="success"
                      showIcon
                      icon={<DollarOutlined />}
                    />
                  )}

                  {walletBalance < (totals?.total || 0) && walletBalance > 0 && (
                    <p className="text-xs text-gray-500 italic">
                      💡 Wallet balance is less than bill total. Remaining amount: ₹{((totals?.total || 0) - walletBalance).toFixed(2)}
                    </p>
                  )}
                </Space>
              </Card>
            ) : (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                <p className="text-sm">No wallet balance available for this customer</p>
              </div>
            )}
          </div>
          <CustomSubmit className="bg-primary" label="Save" loading={loading} />
        </CustomForm>
      </Modal>
    </>
  );
}

export default GenerateBill;
