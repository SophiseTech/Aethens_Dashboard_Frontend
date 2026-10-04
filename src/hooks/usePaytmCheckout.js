import { useState, useCallback, useEffect, useRef } from "react";
import paymentService from "@services/Payment";
import { message } from "antd";

function loadPaytmScript(host, mid) {
  return new Promise((resolve, reject) => {
    const scriptId = `paytm-checkoutjs-${mid}`;
    if (document.getElementById(scriptId)) {
      if (window.Paytm && window.Paytm.CheckoutJS) {
        return resolve();
      }
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/javascript";
    script.src = `${host}/merchantpgpui/checkoutjs/merchants/${mid}.js`;

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Paytm Checkout script load timeout"));
      }
    }, 12000);

    script.onload = () => {
      if (settled) return;
      if (window.Paytm && window.Paytm.CheckoutJS) {
        if (typeof window.Paytm.CheckoutJS.onLoad === "function") {
          window.Paytm.CheckoutJS.onLoad(() => {
            if (!settled) {
              settled = true;
              clearTimeout(timeout);
              resolve();
            }
          });
        } else {
          settled = true;
          clearTimeout(timeout);
          resolve();
        }
      } else {
        settled = true;
        clearTimeout(timeout);
        reject(new Error("Paytm CheckoutJS failed to initialize"));
      }
    };

    script.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error("Failed to load Paytm Checkout script"));
      }
    };

    document.body.appendChild(script);
  });
}

export default function usePaytmCheckout({ onPaymentSuccess, onPaymentFailure } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const activeOrderIdRef = useRef(null);

  const handlePaymentOutcome = useCallback(
    async (orderId) => {
      try {
        setLoading(true);
        const transaction = await paymentService.getPaymentStatus(orderId);
        setPaymentResult(transaction);

        if (transaction?.status === "success") {
          message.success("Payment completed successfully!");
          onPaymentSuccess?.(transaction);
        } else {
          message.error(transaction?.respMsg || "Payment could not be completed");
          onPaymentFailure?.(transaction);
        }
      } catch (err) {
        setError(err.message || "Failed to verify transaction status");
      } finally {
        setLoading(false);
      }
    },
    [onPaymentSuccess, onPaymentFailure]
  );

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "PAYTM_PAYMENT_COMPLETED") {
        const { orderId } = event.data;
        if (orderId) {
          handlePaymentOutcome(orderId);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handlePaymentOutcome]);

  const startCheckout = useCallback(
    async (billId) => {
      setLoading(true);
      setError(null);

      try {
        const initData = await paymentService.initiatePayment(billId);
        if (!initData || !initData.txnToken) {
          throw new Error("Could not obtain payment transaction token");
        }

        const { txnToken, orderId, amount, mid, host } = initData;
        activeOrderIdRef.current = orderId;

        await loadPaytmScript(host, mid);

        const config = {
          root: "",
          flow: "DEFAULT",
          data: {
            orderId: orderId,
            token: txnToken,
            tokenType: "TXN_TOKEN",
            amount: amount,
          },
          merchant: { redirect: true },
          handler: {
            notifyMerchant: function (eventName) {
              if (
                eventName === "APP_CLOSED" ||
                eventName === "CLOSE_POPUP" ||
                eventName === "SESSION_EXPIRED"
              ) {
                if (activeOrderIdRef.current) {
                  handlePaymentOutcome(activeOrderIdRef.current);
                }
              }
            },
            transactionStatus: function () {
              if (window.Paytm?.CheckoutJS?.close) {
                window.Paytm.CheckoutJS.close();
              }
              if (activeOrderIdRef.current) {
                handlePaymentOutcome(activeOrderIdRef.current);
              }
            },
          },
        };

        if (window.Paytm && window.Paytm.CheckoutJS) {
          await window.Paytm.CheckoutJS.init(config);
          window.Paytm.CheckoutJS.invoke();
        } else {
          throw new Error("Paytm CheckoutJS is unavailable");
        }
      } catch (err) {
        const errMsg = err?.message || "Failed to initiate online payment";
        setError(errMsg);
        message.error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [handlePaymentOutcome]
  );

  const resetCheckout = useCallback(() => {
    setPaymentResult(null);
    setError(null);
    setLoading(false);
    activeOrderIdRef.current = null;
  }, []);

  return {
    startCheckout,
    loading,
    error,
    paymentResult,
    resetCheckout,
  };
}
