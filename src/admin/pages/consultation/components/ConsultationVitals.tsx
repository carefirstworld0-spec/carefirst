import { HeartPulse } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ConsultationVitals({ 
  consultation, 
  onChange 
}: { 
  consultation: any; 
  onChange: (field: string, value: any) => void 
}) {
  const vitals = consultation?.vitals || {};
  const isReadOnly = consultation?.status === "completed";

  const handleVitalChange = (key: string, value: string) => {
    const newVitals = { ...vitals, [key]: value };
    
    // Auto-calculate BMI if height and weight exist
    if ((key === "height" || key === "weight") && newVitals.height && newVitals.weight) {
      const h = parseFloat(newVitals.height) / 100; // cm to m
      const w = parseFloat(newVitals.weight);
      if (h > 0 && w > 0) {
        newVitals.bmi = (w / (h * h)).toFixed(1);
      }
    }

    onChange("vitals", newVitals);
  };

  const getBmiStatus = (bmiStr: string) => {
    if (!bmiStr) return null;
    const bmi = parseFloat(bmiStr);
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600" };
    if (bmi >= 18.5 && bmi <= 24.9) return { label: "Normal", color: "text-green-600" };
    if (bmi >= 25 && bmi <= 29.9) return { label: "Overweight", color: "text-amber-600" };
    return { label: "Obese", color: "text-red-600" };
  };

  const bmiStatus = getBmiStatus(vitals.bmi);

  return (
    <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <HeartPulse className="text-red-500" size={20} />
        <h2 className="text-lg font-bold text-navy">Vitals</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Blood Pressure</label>
          <div className="relative">
            <Input 
              placeholder="120/80" 
              value={vitals.bp || ""} 
              onChange={(e) => handleVitalChange("bp", e.target.value)}
              disabled={isReadOnly}
              className="pr-12"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">mmHg</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Pulse Rate</label>
          <div className="relative">
            <Input 
              type="number"
              placeholder="72" 
              value={vitals.pulse || ""} 
              onChange={(e) => handleVitalChange("pulse", e.target.value)}
              disabled={isReadOnly}
              className="pr-10"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">bpm</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Temperature</label>
          <div className="relative">
            <Input 
              type="number"
              step="0.1"
              placeholder="98.6" 
              value={vitals.temp || ""} 
              onChange={(e) => handleVitalChange("temp", e.target.value)}
              disabled={isReadOnly}
              className="pr-8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">°F</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">SpO2</label>
          <div className="relative">
            <Input 
              type="number"
              placeholder="98" 
              value={vitals.spo2 || ""} 
              onChange={(e) => handleVitalChange("spo2", e.target.value)}
              disabled={isReadOnly}
              className="pr-6"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">%</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Resp. Rate</label>
          <div className="relative">
            <Input 
              type="number"
              placeholder="16" 
              value={vitals.resp || ""} 
              onChange={(e) => handleVitalChange("resp", e.target.value)}
              disabled={isReadOnly}
              className="pr-10"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">/min</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Height</label>
          <div className="relative">
            <Input 
              type="number"
              placeholder="170" 
              value={vitals.height || ""} 
              onChange={(e) => handleVitalChange("height", e.target.value)}
              disabled={isReadOnly}
              className="pr-8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">cm</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy">Weight</label>
          <div className="relative">
            <Input 
              type="number"
              placeholder="70" 
              value={vitals.weight || ""} 
              onChange={(e) => handleVitalChange("weight", e.target.value)}
              disabled={isReadOnly}
              className="pr-8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">kg</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-navy flex items-center justify-between">
            BMI
            {bmiStatus && <span className={`text-[10px] ${bmiStatus.color}`}>{bmiStatus.label}</span>}
          </label>
          <Input 
            readOnly
            value={vitals.bmi || ""} 
            className="bg-secondary/30 font-bold"
            placeholder="Auto"
          />
        </div>
      </div>
    </div>
  );
}
