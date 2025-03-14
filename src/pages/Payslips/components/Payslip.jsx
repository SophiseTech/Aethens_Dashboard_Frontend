import { Badge, Table } from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useRef } from 'react'
import { isMobile, isTablet } from 'react-device-detect';

function Payslip({ payslip, downloadRef }) {

  const invoiceRef = useRef(null);
  const parentPadding = 2 * 20;

  useEffect(() => {
    function adjustZoom() {
      if (!invoiceRef.current || (!isMobile && !isTablet)) return;

      const documentWidth = window.innerWidth - parentPadding;
      const documentHeight = window.innerHeight - parentPadding;
      const cmToPx = 37.795276;

      const zoomWidth = documentWidth / (23 * cmToPx);
      const zoomHeight = documentHeight / (31.7 * cmToPx);
      const zoomLevel = Math.min(zoomWidth, zoomHeight);

      if (zoomLevel < 1) {
        invoiceRef.current.style.transform = `scale(${zoomLevel})`;
        invoiceRef.current.style.transformOrigin = "top left"; // Ensures proper scaling
      } else {
        invoiceRef.current.style.transform = "scale(1)";
      }
    }

    adjustZoom();
    window.addEventListener("resize", adjustZoom);

    return () => window.removeEventListener("resize", adjustZoom);
  }, []);

  const columns = [
    {
      title: "#",
      dataIndex: "key",
      render: (_, record, index) => index + 1
    },
    {
      title: "Number of Session(s)",
      dataIndex: "total_sessions"
    },
    {
      title: "Rate per session",
      dataIndex: "salary",
      render: (value, _, index) => `₹ ${value}`
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      render: (value, _, index) => <p className='font-bold'>₹ {value}</p>
    },
  ]
  return (
    <div ref={invoiceRef} className='h-full'>
      <div className='shadow-paper bg-white rounded-lg lg:m-auto | w-[21cm] max-lg:h-[29.7cm] 2xl:w-10/12'>

        <Badge.Ribbon color={payslip?.payment_status === "paid" ? "green" : payslip?.payment_status === "unpaid" ? "red" : "blue"} text={(payslip?.payment_status || "").toUpperCase()}>
          <div className='flex flex-col gap-10 w-full | p-10 lg:p-16 ' ref={downloadRef}>
            <div className='flex justify-between'>
              <img src='/images/logo.png' className='w-1/3 object-contain' />
              <div className='flex flex-col items-end gap-1'>
                <h1 className='font-bold | text-2xl 2xl:text-3xl'>PAYSLIP</h1>
                <p className='font-bold text-primary | text-sm 2xl:text-lg'>NO: PS-{payslip?.payslip_number}</p>
              </div>
            </div>

            <div className='flex justify-between | text-sm 2xl:text-xl'>
              <p className='font-bold'>Sub: Payslip for month {payslip.month != null ? dayjs().month(payslip.month).format("MMMM") : ""}</p>
              <p className='font-bold text-secondary'>{dayjs(payslip?.generated_on).format("D MMM, YYYY")}</p>
            </div>

            <div className='flex justify-between'>
              <div className='w-1/2'>
                <p className='font-bold text-gray-400 | max-2xl:text-xs'>Billed To: </p>
                <p className='| text-xs 2xl:text-lg'>{payslip?.faculty_id?.username}</p>
                <p className='| text-xs 2xl:text-lg'>{payslip?.faculty_id?.address}</p>
              </div>

              <div className='w-1/2 | text-xs 2xl:text-lg'>
                <p className='font-bold text-gray-400 text-sm | max-2xl:text-xs'>Billed From: </p>
                <p>School of Athens</p>
                <p>Banglore</p>
              </div>

            </div>

            <div className='flex flex-col items-end'>
              <Table columns={columns} dataSource={[payslip]} pagination={false} className='w-full' />
            </div>

            <div className='| max-2xl:text-xs'>
              <h1 className='font-bold | text-sm 2xl:text-lg'>Terms and conditions:</h1>
              <ul >
                <li>
                  Terms and condition 1
                </li>
                <li>
                  Terms and condition 1
                </li>
                <li>
                  Terms and condition 1
                </li>
              </ul>
            </div>
          </div>
        </Badge.Ribbon>
      </div>
    </div>
  )
}

export default Payslip