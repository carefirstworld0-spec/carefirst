import { useState } from "react";
import { Plus, Trash2, Pill, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConsultationPrescription({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("1-0-1");
  const [duration, setDuration] = useState("5 Days");
  const [instructions, setInstructions] = useState("After Meal");
  const isReadOnly = consultation?.status === "completed";

  const handleAdd = () => {
    if (!medicine) return;
    const current = consultation?.prescription || [];
    onChange("prescription", [
      ...current,
      { medicine, dosage, frequency, duration, instructions }
    ]);
    setMedicine("");
    setDosage("");
    setFrequency("1-0-1");
    setDuration("5 Days");
    setInstructions("After Meal");
  };

  const handleRemove = (index: number) => {
    const current = [...(consultation?.prescription || [])];
    current.splice(index, 1);
    onChange("prescription", current);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Pill className="text-blue-500" size={20} />
        <h2 className="text-lg font-bold text-navy">Prescriptions</h2>
      </div>

      <div className="space-y-4">
        {!isReadOnly && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-secondary/10 p-4 rounded-xl border border-border">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-navy mb-1.5 block">Medicine Name</label>
              <Input 
                placeholder="e.g., Paracetamol 500mg" 
                value={medicine} 
                onChange={(e) => setMedicine(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1.5 block">Dosage</label>
              <Input 
                placeholder="e.g., 1 Tab" 
                value={dosage} 
                onChange={(e) => setDosage(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1.5 block">Frequency</label>
              <select
                className="w-full rounded-md border border-border px-3 h-10 bg-white text-sm"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="1-0-0">1-0-0 (Morning)</option>
                <option value="0-0-1">0-0-1 (Night)</option>
                <option value="1-0-1">1-0-1 (Morning/Night)</option>
                <option value="1-1-1">1-1-1 (TDS)</option>
                <option value="SOS">SOS (As needed)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1.5 block">Duration</label>
              <Input 
                placeholder="e.g., 5 Days" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1.5 block">Timing</label>
              <select
                className="w-full rounded-md border border-border px-3 h-10 bg-white text-sm"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              >
                <option value="After Meal">After Meal</option>
                <option value="Before Meal">Before Meal</option>
                <option value="Empty Stomach">Empty Stomach</option>
                <option value="Local Application">Local Application</option>
              </select>
            </div>
            <div className="md:col-span-6 flex justify-end mt-2">
              <Button onClick={handleAdd} disabled={!medicine} className="bg-navy hover:bg-navy/90">
                <Plus size={16} className="mr-2" /> Add Medicine
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 mt-4">
          {(consultation?.prescription || []).map((rx: any, idx: number) => (
            <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg border border-border shadow-sm gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-navy text-[15px]">{rx.medicine}</h4>
                    {rx.dosage && <p className="text-xs text-muted-foreground mt-0.5">Dosage: {rx.dosage}</p>}
                  </div>
                  {!isReadOnly && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 md:hidden" 
                      onClick={() => handleRemove(idx)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    <Clock size={12} /> {rx.frequency}
                  </div>
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    <Calendar size={12} /> {rx.duration}
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {rx.instructions}
                  </div>
                </div>
              </div>
              
              {!isReadOnly && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-destructive hover:bg-destructive/10 hidden md:flex shrink-0" 
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
          {(!consultation?.prescription || consultation.prescription.length === 0) && (
            <div className="text-center py-8 bg-secondary/20 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              No prescriptions added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
