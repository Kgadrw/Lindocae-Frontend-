    "use client";

    import React, { useEffect, useState } from "react";
    import { useRouter } from "next/navigation";
    import {
      addToCartServer,
      clearCartServer,
      fetchUserCart,
      fetchUserCartWithProducts,
      getAuthToken,
      getLocalCart,
      isUserLoggedIn,
      saveLocalCart,
    } from "../../utils/serverStorage";
    import { normalizeImageUrl } from "../../utils/image";

    import { Listbox } from "@headlessui/react";
    import { Check, ChevronsUpDown } from "lucide-react";

    const RWANDA_PROVINCES = [
      "Kigali City",
      "Northern Province",
      "Southern Province",
      "Eastern Province",
      "Western Province",
    ];
    const RWANDA_DISTRICTS = [
      "Gasabo", "Kicukiro", "Nyarugenge",
      "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
      "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
      "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
      "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"
    ];


    interface Product {
      id: string | number;
      name: string;
      price: number;
      image: string | string[];
      quantity?: number;
    }

    function formatRWF(amount: number | undefined | null) {
      if (amount === undefined || amount === null) return "0";
      return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
    }

    const CheckoutPage = () => {
      const [cartItems, setCartItems] = useState<Product[]>([]);
      const [paymentMethod, setPaymentMethod] = useState("dpo");

      // Shipping address fields
      const [shippingProvince, setShippingProvince] = useState("");
      const [shippingDistrict, setShippingDistrict] = useState("");
      const [shippingSector, setShippingSector] = useState("");
      const [shippingCell, setShippingCell] = useState("");
      const [shippingVillage, setShippingVillage] = useState("");
      const [shippingStreet, setShippingStreet] = useState("");

      // Customer info
      const [customerPhone, setCustomerPhone] = useState("");
      const [customerEmail, setCustomerEmail] = useState("");
      const [customerName, setCustomerName] = useState("");

      const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [paymentRedirectUrl, setPaymentRedirectUrl] = useState("");
      const [users, setUsers] = useState<any[]>([]);
      const [isLoadingCart, setIsLoadingCart] = useState(true);
      const router = useRouter();

      useEffect(() => {
        fetch("https://lindo-project.onrender.com/user/getAllUsers")
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) setUsers(data);
            else if (data && Array.isArray(data.users)) setUsers(data.users);
            else setUsers([]);
          })
          .catch(() => setUsers([]));
      }, []);

      useEffect(() => {
        async function loadCart() {
          try {
            if (isUserLoggedIn()) {
              let serverCart;
              try {
                serverCart = await fetchUserCartWithProducts();
              } catch {
                serverCart = await fetchUserCart();
              }
              if (serverCart && serverCart.length > 0) {
                const convertedCart = serverCart.map((item: any) => ({
                  id:
                    typeof item.productId === "object"
                      ? (item.productId as any)._id ||
                        (item.productId as any).id ||
                        String(item.productId)
                      : String(item.productId),
                  name: item.name || "Product",
                  price: item.price || 0,
                  image: item.image || "/lindo.png",
                  quantity: item.quantity || 1,
                }));
                setCartItems(convertedCart);
              } else {
                setCartItems([]);
              }
            } else {
              const localCart = getLocalCart();
              const convertedCart = localCart.map((item: any) => ({
                id:
                  typeof item.productId === "object"
                    ? (item.productId as any)._id ||
                      (item.productId as any).id ||
                      String(item.productId)
                    : String(item.productId),
                name: item.name || "Product",
                price: item.price || 0,
                image: item.image || "/lindo.png",
                quantity: item.quantity || 1,
              }));
              setCartItems(convertedCart);
            }
          } catch {
            setCartItems([]);
          } finally {
            setIsLoadingCart(false);
          }
        }
        loadCart();
      }, []);

      const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderStatus({});
        setIsSubmitting(true);

        if (
          !paymentMethod ||
          !shippingProvince ||
          !shippingDistrict ||
          !shippingSector ||
          !shippingCell ||
          !shippingVillage ||
          !shippingStreet ||
          !customerPhone ||
          !customerEmail ||
          !customerName
        ) {
          setOrderStatus({ error: "Please fill in all required fields." });
          setIsSubmitting(false);
          return;
        }

        try {
          const token = getAuthToken();
          const totalAmount = cartItems.reduce((sum, item) => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            return sum + itemTotal;
          }, 0);

          const orderItems = cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity || 1,
            price: item.price || 0,
          }));

          const orderData = {
            paymentMethod: paymentMethod || "dpo",
            province: shippingProvince,
            district: shippingDistrict,
            sector: shippingSector,
            cell: shippingCell,
            village: shippingVillage,
            street: shippingStreet,
            customerEmail,
            customerPhone,
            customerName,
            items: orderItems,
            totalAmount,
          };

          let openLock: string | null = null;
          try {
            const stored = localStorage.getItem("userData");
            if (stored) {
              const parsed = JSON.parse(stored);
              openLock = parsed?.user?.tokens?.accessToken || null;
            }
          } catch {}

          const orderResponse = await fetch(
            "https://lindo-project.onrender.com/orders/createOrder",
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                ...(openLock ? { Authorization: `Bearer ${openLock}` } : {}),
              },
              body: JSON.stringify(orderData),
            }
          );

          if (orderResponse.ok) {
            const orderResult = await orderResponse.json();
            const orderId = orderResult.order?._id || orderResult.orderId;
            const [firstNameRaw, ...restName] = customerName.trim().split(/\s+/);
            const firstName = firstNameRaw || "Customer";
            const lastName = restName.join(" ") || firstName;

            if (paymentMethod === "dpo") {
              const dpoInitBody = {
                orderId: String(orderId || ""),
                totalAmount: totalAmount,
                currency: "RWF",
                email: customerEmail,
                phone: customerPhone,
                firstName,
                lastName,
                serviceDescription: `Payment for order ${orderId} - ${cartItems.length} item(s) from Lindocare`,
                callbackUrl: "https://lindocae-frontend.vercel.app/payment-success",
              };

              const dpoResponse = await fetch(
                "https://lindo-project.onrender.com/dpo/initialize/dpoPayment",
                {
                  method: "POST",
                  headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(dpoInitBody),
                }
              );

              if (dpoResponse.ok) {
                const dpoData = await dpoResponse.json();
                const redirectUrl = dpoData.redirectUrl || dpoData.paymentUrl;
                if (redirectUrl) {
                  setPaymentRedirectUrl(redirectUrl);
                  setOrderStatus({ success: "Order created! Redirecting to payment gateway..." });
                  try {
                    if (isUserLoggedIn()) await clearCartServer();
                    else saveLocalCart([]);
                    setCartItems([]);
                  } catch {}
                  if ((dpoData as any).token) {
                    localStorage.setItem("dpoPaymentToken", (dpoData as any).token);
                    localStorage.setItem("pendingOrderId", String(orderId || ""));
                    localStorage.setItem("pendingOrderAmount", String(totalAmount));
                  }
                  setTimeout(() => {
                    window.location.href = redirectUrl;
                  }, 1500);
                } else {
                  setOrderStatus({
                    success: "Order created successfully. Proceed to payment from your orders page.",
                  });
                }
              } else {
                setOrderStatus({ error: "Payment initialization failed. Please try again." });
              }
            } else {
              setOrderStatus({ success: "Order created successfully." });
            }
          } else if (orderResponse.status === 401) {
            setOrderStatus({
              error: "Authorization failed. Please log in and try again.",
            });
          } else {
            let errorData: any = {};
            let responseText = "";
            try {
              responseText = await orderResponse.text();
              if (responseText) {
                errorData = JSON.parse(responseText);
              }
            } catch {
              errorData = { message: responseText || "Unknown error" };
            }
            setOrderStatus({
              error:
                errorData.message || `Failed to create order (${orderResponse.status}). Please try again.`,
            });
          }
        } catch (err) {
          setOrderStatus({ error: "Network error. Please try again." });
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-2">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
            {/* Left: Checkout summary and products */}
            <div className="flex-1 flex flex-col gap-4 border-r border-gray-200 pr-0 md:pr-8">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-black">Checkout</h1>
              </div>
              {isLoadingCart ? (
                <div className="text-center text-gray-500 font-semibold mb-4">
                  Loading your cart...
                </div>
              ) : cartItems.length === 0 ? (
                <>
                  <div className="text-center text-gray-500 font-semibold mb-4">
                    Your cart is empty.
                  </div>
                  <button
                    className="w-full rounded border border-black text-black py-2 font-bold text-base bg-white hover:bg-gray-100 transition-colors"
                    onClick={() => router.push("/all-products")}
                  >
                    Continue Shopping
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Subtotal</span>
                      <span className="text-black font-semibold">
                        {formatRWF(subtotal)} RWF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Estimated Shipping</span>
                      <span className="text-black font-semibold">0 RWF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black font-medium">Taxes</span>
                      <span className="text-gray-400 font-normal">Calculated at checkout</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-2 mb-4">
                    <span className="text-black">Total</span>
                    <span className="text-black">{formatRWF(subtotal)} RWF</span>
                  </div>
                  <div className="font-semibold text-black mb-2">Products to Checkout</div>
                  <div className="flex flex-col gap-3">
                    {cartItems.map((item, idx) => (
                      <div
                        key={`cart-${String((item as any)?.id ?? "")}-${idx}`}
                        className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-b-0"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {(() => {
                            let image = "";
                            if (Array.isArray(item.image) && item.image.length > 0) image = item.image[0];
                            else if (typeof item.image === "string") image = item.image;
                            image = normalizeImageUrl(image);

                            return image && image.trim().length > 0 ? (
                              <img
                                src={image}
                                alt={item.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-black text-base">
                            {item.name || "Product"}
                          </div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity || 1}</div>
                        </div>
                        <div className="font-bold text-black text-base">
                          {formatRWF(item.price || 0)} RWF
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Address and payment method form */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckout} className="flex flex-col gap-4">
                  {/* Customer Information */}
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+2507XXXXXXXX"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Shipping Address *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
      <label className="block text-xs text-gray-700 mb-1">Province *</label>
      <Listbox value={shippingProvince} onChange={setShippingProvince}>
        <div className="relative">
          <Listbox.Button className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium text-gray-900 flex justify-between items-center">
            <span>{shippingProvince || "Select a province"}</span>
            <ChevronsUpDown className="h-4 w-4 text-gray-500" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {RWANDA_PROVINCES.map((prov) => (
              <Listbox.Option
                key={prov}
                value={prov}
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-2 ${
                    active ? "bg-green-100 text-green-700" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                  <span className={`flex items-center gap-2 ${selected ? "font-semibold" : ""}`}>
                    {selected && <Check className="h-4 w-4 text-green-600" />}
                    {prov}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
                      <div>
      <label className="block text-xs text-gray-700 mb-1">District *</label>
      <Listbox value={shippingDistrict} onChange={setShippingDistrict}>
        <div className="relative">
          <Listbox.Button className="w-full border border-gray-300 rounded px-3 py-2 text-xs font-medium text-gray-900 flex justify-between items-center">
            <span>{shippingDistrict || "Select a district"}</span>
            <ChevronUpDown className="h-4 w-4 text-gray-500" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
            {RWANDA_DISTRICTS.map((dist) => (
              <Listbox.Option
                key={dist}
                value={dist}
                className={({ active }) =>
                  `cursor-pointer select-none px-4 py-2 ${
                    active ? "bg-green-100 text-green-700" : "text-gray-900"
                  }`
                }
              >
                {({ selected }) => (
                  <span className={`flex items-center gap-2 ${selected ? "font-semibold" : ""}`}>
                    {selected && <Check className="h-4 w-4 text-green-600" />}
                    {dist}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Sector</label>
                        <input
                          type="text"
                          value={shippingSector}
                          onChange={(e) => setShippingSector(e.target.value)}
                          placeholder="Kimironko"
                          required
                          className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Cell</label>
                        <input
                          type="text"
                          value={shippingCell}
                          onChange={(e) => setShippingCell(e.target.value)}
                          placeholder="Kicukiro"
                          required
                          className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Village</label>
                        <input
                          type="text"
                          value={shippingVillage}
                          onChange={(e) => setShippingVillage(e.target.value)}
                          placeholder="Nyabisindu"
                          required
                          className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Street</label>
                        <input
                          type="text"
                          value={shippingStreet}
                          onChange={(e) => setShippingStreet(e.target.value)}
                          placeholder="Main Street"
                          required
                          className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Please fill in all address fields for accurate delivery
                    </p>
                  </div>

                  {orderStatus.error && (
                    <div className="text-red-600 text-xs font-semibold mt-1">
                      {orderStatus.error}
                    </div>
                  )}
                  {orderStatus.success && (
                    <div className="text-green-600 text-xs font-semibold mt-1">
                      {orderStatus.success}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded bg-green-600 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                    disabled={cartItems.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Initializing Payment..." : "Checkout"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      );
    };

    export default CheckoutPage;