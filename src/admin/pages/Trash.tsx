import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, remove, set } from "firebase/database";
import { Trash2, RefreshCcw, Search, Calendar, X } from "lucide-react";

type TrashItem = {
  id: string;
  name: string; // Trash item name
  deletedAt: string; // Date
  originalPath: string; // Where it belongs
  data: any; // The actual data
};

export function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const clinicKey = typeof window !== 'undefined' ? localStorage.getItem("user_clinic") || "" : "";

  useEffect(() => {
    if (!clinicKey) return;
    const trashRef = ref(db, `carefirst/users/${clinicKey}/trash`);

    const unsubscribe = onValue(trashRef, (snapshot) => {
      const list: TrashItem[] = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const key in data) {
          list.push({ id: key, ...data[key] });
        }
      }
      // Sort by deleted date descending
      list.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      setItems(list);
      setLoading(false);
    });

    return () => {
      off(trashRef);
    };
  }, [clinicKey]);

  const handleRestore = async (item: TrashItem) => {
    if (!clinicKey) return;
    try {
      // Move back to original path
      await set(ref(db, `carefirst/users/${clinicKey}/${item.originalPath}/${item.id}`), item.data);
      // Remove from trash
      await remove(ref(db, `carefirst/users/${clinicKey}/trash/${item.id}`));
    } catch (err) {
      console.error("Failed to restore item:", err);
      alert("Failed to restore item.");
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    if (!clinicKey) return;
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this item? This cannot be undone.",
      )
    )
      return;
    try {
      await remove(ref(db, `carefirst/users/${clinicKey}/trash/${item.id}`));
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item.");
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    if (item.deletedAt) {
      const itemDate = new Date(item.deletedAt);
      itemDate.setHours(0, 0, 0, 0); // Normalize time

      if (fromDate) {
        const fDate = new Date(fromDate);
        fDate.setHours(0, 0, 0, 0);
        if (itemDate < fDate) matchesDate = false;
      }
      if (toDate) {
        const tDate = new Date(toDate);
        tDate.setHours(0, 0, 0, 0);
        if (itemDate > tDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[22px] sm:text-[26px] font-extrabold tracking-tight text-navy">
            Trash Bin
          </h1>
          <p className="mt-1 text-[13px] sm:text-[14px] font-medium text-muted-foreground">
            Manage deleted records. Items can be restored or permanently removed.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search deleted items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[10px] border border-border/40 bg-card py-2.5 pl-9 pr-4 text-[13px] shadow-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="flex w-full lg:w-auto items-center gap-2">
          <Calendar size={15} className="hidden sm:block shrink-0 text-muted-foreground" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full sm:w-auto rounded-[10px] border border-border/40 bg-card px-3 py-2.5 text-[12px] sm:text-[13px] shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          <span className="text-muted-foreground text-[11px] sm:text-[12px] font-medium">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full sm:w-auto rounded-[10px] border border-border/40 bg-card px-3 py-2.5 text-[12px] sm:text-[13px] shadow-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-navy transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[16px] bg-card shadow-sm ring-1 ring-border/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/30">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground text-[11px] w-[80px]">
                  Sr No.
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                  Trash Item Name
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground text-[11px] w-[180px]">
                  Date Deleted
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-muted-foreground text-[11px] text-center w-[120px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCcw size={16} className="animate-spin" />
                      Loading trash...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-secondary">
                      <Trash2 size={20} className="text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 font-display text-[15px] font-bold text-navy">
                      Trash is empty
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      No deleted items found.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-6 py-4 font-medium text-navy/70">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-navy">{item.name || "Unknown Item"}</span>
                      {item.originalPath && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Source: {item.originalPath.replace(/\//g, " > ")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">
                      {item.deletedAt
                        ? new Date(item.deletedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Unknown Date"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                          title="Restore Item"
                        >
                          <RefreshCcw size={14} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
                          title="Permanently Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
