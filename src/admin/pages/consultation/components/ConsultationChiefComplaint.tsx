import { useState } from "react";
import { Plus, Trash2, Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ConsultationChiefComplaint({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const [complaint, setComplaint] = useState("");
  const [duration, setDuration] = useState("");

  const handleAdd = () => {
    if (!complaint) return;
    const current = consultation?.chiefComplaint || [];
    onChange("chiefComplaint", [
      ...current,
      { symptom: complaint, duration, severity: "moderate" }
    ]);
    setComplaint("");
    setDuration("");
  };

  const handleRemove = (index: number) => {
    const current = [...(consultation?.chiefComplaint || [])];
    current.splice(index, 1);
    onChange("chiefComplaint", current);
  };

  const updateSeverity = (index: number, severity: string) => {
    const current = [...(consultation?.chiefComplaint || [])];
    current[index].severity = severity;
    onChange("chiefComplaint", current);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
        <Stethoscope className="text-primary" size={20} />
        <h2 className="text-lg font-bold text-navy">Chief Complaint & HPI</h2>
      </div>

      <div className="space-y-6">
        {/* Chief Complaints List */}
        <div>
          <label className="text-sm font-bold text-navy mb-2 block">Presenting Complaints</label>
          <div className="flex gap-3 mb-3">
            <Input 
              placeholder="e.g., Fever, Cough..." 
              value={complaint} 
              onChange={(e) => setComplaint(e.target.value)} 
              className="flex-1"
              disabled={consultation?.status === "completed"}
            />
            <Input 
              placeholder="Duration (e.g., 3 days)" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)} 
              className="w-[150px]"
              disabled={consultation?.status === "completed"}
            />
            <Button onClick={handleAdd} disabled={!complaint || consultation?.status === "completed"}>
              <Plus size={16} className="mr-2" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {(consultation?.chiefComplaint || []).map((cc: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="font-bold text-navy">{cc.symptom}</p>
                  <p className="text-xs text-muted-foreground">Duration: {cc.duration || "Not specified"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    className="text-xs rounded border border-border p-1 bg-white"
                    value={cc.severity}
                    onChange={(e) => updateSeverity(idx, e.target.value)}
                    disabled={consultation?.status === "completed"}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                    onClick={() => handleRemove(idx)}
                    disabled={consultation?.status === "completed"}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {(!consultation?.chiefComplaint || consultation.chiefComplaint.length === 0) && (
              <div className="text-center py-4 bg-secondary/20 rounded-lg border border-dashed border-border text-sm text-muted-foreground flex flex-col items-center">
                <AlertCircle size={20} className="mb-2 opacity-50" />
                No chief complaints recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* History of Present Illness (HPI) */}
        <div>
          <label className="text-sm font-bold text-navy mb-2 block">History of Present Illness (HPI)</label>
          <textarea
            className="w-full min-h-[100px] p-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            placeholder="Detailed clinical narrative regarding the complaints..."
            value={consultation?.history || ""}
            onChange={(e) => onChange("history", e.target.value)}
            disabled={consultation?.status === "completed"}
          />
        </div>
      </div>
    </div>
  );
}
