import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, child, update } from "firebase/database";
import { Save, User, Building2, Phone, Mail, Upload, Camera } from "lucide-react";

export function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    clinic: "",
    phone: "",
    email: "",
    logoUrl: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = localStorage.getItem("user_uid");
      const clinicKey = localStorage.getItem("user_clinic");
      
      if (uid && clinicKey) {
        try {
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `carefirst/users/${clinicKey}/signup`));
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            setFormData({
              name: data.name || "",
              clinic: data.clinic || "",
              phone: data.phone || "",
              email: data.email || "",
              logoUrl: data.logoUrl || ""
            });
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      }
      setFetching(false);
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const clinicKey = localStorage.getItem("user_clinic");
    if (!clinicKey) {
      setErrorMsg("Unable to identify clinic key. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const userRef = ref(db, `carefirst/users/${clinicKey}/signup`);
      await update(userRef, {
        name: formData.name,
        clinic: formData.clinic,
        phone: formData.phone,
        email: formData.email,
        logoUrl: formData.logoUrl
      });
      
      // Update local storage cache to ensure instant layout update
      localStorage.setItem("user_name", formData.name);
      
      setSuccessMsg("Settings updated successfully!");
      
      // Auto-hide success message
      setTimeout(() => setSuccessMsg(""), 3000);
      
      // Force reload to update layout name
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      setErrorMsg("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex h-[400px] items-center justify-center text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-navy">Clinic Settings</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">Manage your clinic profile, contact information, and logo.</p>
      </div>

      <div className="rounded-[16px] border border-border bg-card shadow-sm">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="space-y-8">
            
            {/* Logo Section */}
            <div>
              <h3 className="text-[14px] font-bold text-navy mb-4">Clinic Logo</h3>
              <div className="flex items-center gap-6">
                <div className="relative group size-24 shrink-0 overflow-hidden rounded-[16px] border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Clinic Logo" className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center text-muted-foreground">
                      <Camera size={24} className="mb-1 opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-navy/60 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer">
                    <Upload size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[13px] font-semibold text-navy">
                    Logo Image URL
                  </label>
                  <input
                    type="url"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-[10px] border border-border bg-background px-4 py-2.5 text-[14px] text-navy placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Paste a direct link to your logo image. Recommended size: 256x256px.</p>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* General Information */}
            <div>
              <h3 className="text-[14px] font-bold text-navy mb-4">General Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-navy">Administrator Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[10px] border border-border bg-background py-2.5 pl-10 pr-4 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-navy">Clinic / Hospital Name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="text"
                      name="clinic"
                      value={formData.clinic}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[10px] border border-border bg-background py-2.5 pl-10 pr-4 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-navy">Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[10px] border border-border bg-background py-2.5 pl-10 pr-4 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-navy">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-[10px] border border-border bg-background py-2.5 pl-10 pr-4 text-[14px] text-navy focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-border/60">
              <div className="flex-1">
                {successMsg && <p className="text-[13px] font-bold text-success animate-in fade-in slide-in-from-bottom-1">{successMsg}</p>}
                {errorMsg && <p className="text-[13px] font-bold text-destructive animate-in fade-in slide-in-from-bottom-1">{errorMsg}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex shrink-0 items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-[14px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
