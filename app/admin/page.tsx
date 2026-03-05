"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  adminLogin,
  adminDeleteProduct,
  adminListOrders,
  adminListProducts,
  adminListSettings,
  adminUpsertProduct,
  adminUpsertSetting,
  markUpiVerified,
  type AdminCredentials,
} from "@/lib/api";
import { Order, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

type TabKey = "products" | "orders" | "settings";

const settingsEditableKeys = [
  "company_name",
  "company_email",
  "company_phone",
  "upi_vpa",
  "upi_payee_name",
  "upi_screenshot_folder_id",
  "admin_username",
  "admin_password",
];

export default function AdminPage() {
  const [tab, setTab] = useState<TabKey>("products");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const [productForm, setProductForm] = useState<Product>({
    id: "",
    name: "",
    description: "",
    price_inr: 0,
    image_url: "",
    category: "Other",
    is_available: true,
    sort_order: 0,
    allowed_toppings: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const credentials: AdminCredentials = {
    admin_username: adminUsername,
    admin_password: adminPassword,
  };

  const settingsList = useMemo(
    () => settingsEditableKeys.map((key) => ({ key, value: settings[key] ?? "" })),
    [settings]
  );

  const clearNotice = () => {
    setMessage("");
    setError("");
    setAuthError("");
  };

  const loadProducts = async () => {
    const response = await adminListProducts(credentials);
    if (!response.ok || !response.data) {
      throw new Error(response.error || "Failed to load products");
    }
    setProducts((response.data as Product[]).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
  };

  const loadOrders = async () => {
    const response = await adminListOrders(credentials, 300);
    if (!response.ok || !response.data) {
      throw new Error(response.error || "Failed to load orders");
    }
    setOrders(response.data as Order[]);
  };

  const loadSettings = async () => {
    const response = await adminListSettings(credentials);
    if (!response.ok || !response.data) {
      throw new Error(response.error || "Failed to load settings");
    }
    setSettings(response.data as Record<string, string>);
  };

  const loadAll = async () => {
    if (!isAuthenticated) return;

    clearNotice();
    setLoading(true);
    try {
      await Promise.all([loadProducts(), loadOrders(), loadSettings()]);
      setMessage("Admin data loaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    clearNotice();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setAuthError("Username and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin(credentials);
      if (!response.ok) {
        throw new Error(response.error || "Login failed");
      }
      setIsAuthenticated(true);
      setMessage("Logged in to admin panel");
    } catch (err) {
      setIsAuthenticated(false);
      setAuthError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProducts([]);
    setOrders([]);
    setSettings({});
    setMessage("Logged out");
  };

  const saveProduct = async () => {
    clearNotice();
    if (!productForm.id.trim() || !productForm.name.trim()) {
      setError("Product ID and Name are required");
      return;
    }

    setLoading(true);
    try {
      const response = await adminUpsertProduct(credentials, productForm);
      if (!response.ok) {
        throw new Error(response.error || "Failed to save product");
      }
      await loadProducts();
      setMessage(`Product ${productForm.id} saved`);
      setProductForm({
        id: "",
        name: "",
        description: "",
        price_inr: 0,
        image_url: "",
        category: "Other",
        is_available: true,
        sort_order: 0,
        allowed_toppings: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id: string) => {
    clearNotice();
    setLoading(true);
    try {
      const response = await adminDeleteProduct(credentials, id);
      if (!response.ok) {
        throw new Error(response.error || "Failed to delete product");
      }
      await loadProducts();
      setMessage(`Product ${id} deleted`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const verifyUpi = async (orderId: string) => {
    clearNotice();
    setLoading(true);
    try {
      const response = await markUpiVerified(orderId, credentials);
      if (!response.ok) {
        throw new Error(response.error || "Failed to verify UPI");
      }
      await loadOrders();
      setMessage(`Order ${orderId} marked as PAID`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify UPI");
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    clearNotice();
    setLoading(true);
    try {
      const response = await adminUpsertSetting(credentials, key, value);
      if (!response.ok) {
        throw new Error(response.error || `Failed to save ${key}`);
      }
      setSettings((prev) => ({ ...prev, [key]: value }));
      setMessage(`Setting ${key} updated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save setting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Card className="p-4 sm:p-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-display font-semibold gradient-text">Admin Panel</h1>

          <div className="grid sm:grid-cols-3 gap-3">
            <Input
              label="Admin Username"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Enter admin username"
            />
            <Input
              label="Admin Password"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
            />
            <div className="flex items-end gap-2">
              {!isAuthenticated ? (
                <Button type="button" variant="primary" onClick={handleLogin} isLoading={loading} disabled={loading}>
                  Login
                </Button>
              ) : (
                <>
                  <Button type="button" variant="primary" onClick={loadAll} isLoading={loading} disabled={loading}>
                    Reload Data
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleLogout} disabled={loading}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isAuthenticated && <p className="text-sm text-muted">Login required to access admin management.</p>}
          {authError && <p className="text-sm text-red-600">{authError}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </Card>

        {isAuthenticated && (
          <>
            <Card className="p-3 sm:p-4">
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant={tab === "products" ? "primary" : "secondary"} onClick={() => setTab("products")}>Products</Button>
                <Button type="button" variant={tab === "orders" ? "primary" : "secondary"} onClick={() => setTab("orders")}>Orders</Button>
                <Button type="button" variant={tab === "settings" ? "primary" : "secondary"} onClick={() => setTab("settings")}>Settings</Button>
              </div>
            </Card>

            {tab === "products" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="p-4 sm:p-6 space-y-3">
                  <h2 className="text-xl font-semibold">Create / Edit Product</h2>
                  <Input label="ID" value={productForm.id} onChange={(e) => setProductForm((p) => ({ ...p, id: e.target.value }))} />
                  <Input label="Name" value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} />
                  <Input label="Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
                  <Input label="Image URL" value={productForm.image_url} onChange={(e) => setProductForm((p) => ({ ...p, image_url: e.target.value }))} />
                  <Input label="Allowed Toppings IDs" value={productForm.allowed_toppings || ""} onChange={(e) => setProductForm((p) => ({ ...p, allowed_toppings: e.target.value }))} placeholder="T001,T002,T003" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Price" type="number" value={String(productForm.price_inr || 0)} onChange={(e) => setProductForm((p) => ({ ...p, price_inr: Number(e.target.value) || 0 }))} />
                    <Input label="Sort Order" type="number" value={String(productForm.sort_order || 0)} onChange={(e) => setProductForm((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))} />
                  </div>
                  <Input label="Category" value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} />
                  <Select label="Available" value={productForm.is_available ? "true" : "false"} onChange={(e) => setProductForm((p) => ({ ...p, is_available: e.target.value === "true" }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Select>
                  <Button type="button" variant="primary" onClick={saveProduct} isLoading={loading} disabled={loading}>Save Product</Button>
                </Card>

                <Card className="p-4 sm:p-6">
                  <h2 className="text-xl font-semibold mb-3">Products ({products.length})</h2>
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="border border-stroke rounded-xl p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted">{product.id} • {product.category} • {formatCurrency(product.price_inr)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="secondary" className="px-3 py-1 text-xs" onClick={() => setProductForm(product)}>Edit</Button>
                            <Button type="button" variant="secondary" className="px-3 py-1 text-xs" onClick={() => removeProduct(product.id)}>Delete</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {tab === "orders" && (
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl font-semibold mb-3">Recent Orders ({orders.length})</h2>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {orders.map((order) => (
                    <div key={order.order_id} className="border border-stroke rounded-xl p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{order.order_id}</p>
                          <p className="text-xs text-muted">{order.customer_name} • {formatCurrency(order.subtotal_inr)} • {order.payment_method || "RAZORPAY"}</p>
                          <p className="text-xs text-muted">payment_status: {order.payment_status} {order.upi_status ? `• upi_status: ${order.upi_status}` : ""}</p>
                          {order.upi_utr && <p className="text-xs text-muted">UTR: {order.upi_utr}</p>}
                        </div>
                        {order.payment_method === "UPI" && order.payment_status !== "PAID" && (
                          <Button type="button" variant="primary" className="px-3 py-2 text-xs" onClick={() => verifyUpi(order.order_id)} isLoading={loading} disabled={loading}>
                            Verify UPI
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "settings" && (
              <Card className="p-4 sm:p-6 space-y-4">
                <h2 className="text-xl font-semibold">Settings</h2>
                <div className="space-y-3">
                  {settingsList.map((item) => (
                    <div key={item.key} className="grid sm:grid-cols-[220px_1fr_auto] gap-2 items-end">
                      <Input label="Key" value={item.key} readOnly />
                      <Input label="Value" value={item.value} onChange={(e) => setSettings((prev) => ({ ...prev, [item.key]: e.target.value }))} />
                      <Button type="button" variant="secondary" className="h-[48px]" onClick={() => saveSetting(item.key, settings[item.key] ?? "")} isLoading={loading} disabled={loading}>
                        Save
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
