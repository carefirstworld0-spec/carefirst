import { useState } from "react";
import { Plus, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ConsultationDiagnosis({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const [diagnosisName, setDiagnosisName] = useState("");
  const [diagnosisType, setDiagnosisType] = useState("Provisional");
  const isReadOnly = consultation?.status === "completed";

  const handleAdd = () => {
    if (!diagnosisName) return;
    const current = consultation?.diagnosis || [];
    onChange("diagnosis", [
      ...current,
      { name: diagnosisName, type: diagnosisType }
    ]);
    setDiagnosisName("");
  };

  const handleRemove = (index: number) => {
    const current = [...(consultation?.diagnosis || [])];
    current.splice(index, 1);
    onChange("diagnosis", current);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Activity className="text-primary" size={20} />
        <h2 className="text-lg font-bold text-navy">Diagnosis</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Input 
            placeholder="Search or enter diagnosis..." 
            value={diagnosisName} 
            onChange={(e) => setDiagnosisName(e.target.value)} 
            className="flex-1"
            disabled={isReadOnly}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <select
            className="rounded-md border border-border px-3 bg-white text-sm"
            value={diagnosisType}
            onChange={(e) => setDiagnosisType(e.target.value)}
            disabled={isReadOnly}
          >
            <option value="Provisional">Provisional</option>
            <option value="Final">Final</option>
          </select>
          <Button onClick={handleAdd} disabled={!diagnosisName || isReadOnly}>
            <Plus size={16} className="mr-2" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {(consultation?.diagnosis || []).map((diag: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <Badge variant={diag.type === "Final" ? "default" : "secondary"} className={diag.type === "Final" ? "bg-primary text-white" : "bg-orange-100 text-orange-800"}>
                  {diag.type}
                </Badge>
                <span className="font-semibold text-navy">{diag.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                onClick={() => handleRemove(idx)}
                disabled={isReadOnly}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
          {(!consultation?.diagnosis || consultation.diagnosis.length === 0) && (
            <div className="text-center py-4 text-sm text-muted-foreground italic">
              No diagnosis added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
