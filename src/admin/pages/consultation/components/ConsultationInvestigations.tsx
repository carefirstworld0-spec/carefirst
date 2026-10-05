import { useState } from "react";
import { Plus, Trash2, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function ConsultationInvestigations({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState("Lab");
  const [instructions, setInstructions] = useState("");
  const isReadOnly = consultation?.status === "completed";

  const handleAdd = () => {
    if (!testName) return;
    const current = consultation?.investigations || [];
    onChange("investigations", [
      ...current,
      { testName, type: testType, instructions }
    ]);
    setTestName("");
    setInstructions("");
  };

  const handleRemove = (index: number) => {
    const current = [...(consultation?.investigations || [])];
    current.splice(index, 1);
    onChange("investigations", current);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <Microscope className="text-purple-500" size={20} />
        <h2 className="text-lg font-bold text-navy">Investigations / Lab Orders</h2>
      </div>

      <div className="space-y-4">
        {!isReadOnly && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-secondary/10 p-4 rounded-xl border border-border">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-navy mb-1.5 block">Test Name</label>
              <Input 
                placeholder="e.g., CBC, X-Ray Chest..." 
                value={testName} 
                onChange={(e) => setTestName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy mb-1.5 block">Type</label>
              <select
                className="w-full rounded-md border border-border px-3 h-10 bg-white text-sm"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
              >
                <option value="Lab">Pathology / Lab</option>
                <option value="Radiology">Radiology / Imaging</option>
                <option value="Other">Other Procedure</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-navy mb-1.5 block">Specific Instructions (Optional)</label>
              <Input 
                placeholder="e.g., Fasting required..." 
                value={instructions} 
                onChange={(e) => setInstructions(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="flex items-end md:col-span-1">
              <Button onClick={handleAdd} disabled={!testName} className="w-full">
                <Plus size={16} className="mr-2" /> Add
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-4">
          {(consultation?.investigations || []).map((inv: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${inv.type === 'Radiology' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                  <Microscope size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-navy text-[14px]">{inv.testName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{inv.type}</Badge>
                    {inv.instructions && <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md">{inv.instructions}</span>}
                  </div>
                </div>
              </div>
              {!isReadOnly && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0" 
                  onClick={() => handleRemove(idx)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
          {(!consultation?.investigations || consultation.investigations.length === 0) && (
            <div className="text-center py-4 text-sm text-muted-foreground italic">
              No investigations ordered.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
