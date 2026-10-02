import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import { StepBasicInfo } from "./components/registration/StepBasicInfo";
import { StepContactMedical } from "./components/registration/StepContactMedical";

export function EditPatient() {
  const { patientId } = useParams({ strict: false }) as any;
  const navigate = useNavigate();
  const clinicKey = typeof window !== "undefined" ? localStorage.getItem("user_clinic") || "" : "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!clinicKey || !patientId) return;

    const fetchPatient = async () => {
      try {
        const snap = await get(ref(db, `carefirst/users/${clinicKey}/patients/${patientId}`));
        if (snap.exists()) {
          const data = snap.val();
          
          // Map database structure back to form structure
          const initForm = {
            name: data.identity?.name || "",
            dobMode: data.identity?.dob ? "dob" : "age",
            dob: data.identity?.dob || "",
            approxAge: data.identity?.age ? data.identity.age.split('Y')[0] : "",
            gender: data.identity?.gender || "",
            maritalStatus: data.identity?.maritalStatus || "",
            bloodGroup: data.identity?.bloodGroup || "",
            
            countryCode: data.contact?.countryCode || "+91",
            mobile: data.contact?.mobile ? data.contact.mobile.replace(data.contact.countryCode || "+91", "").trim() : "",
            email: data.contact?.email || "",
            addressLine1: data.contact?.address?.line1 || "",
            addressLine2: data.contact?.address?.line2 || "",
            city: data.contact?.address?.city || "",
            state: data.contact?.address?.state || "",
            pincode: data.contact?.address?.pincode || "",
            
            emergencyName: data.emergency?.name || "",
            emergencyRelation: data.emergency?.relationship || "",
            emergencyCountryCode: data.emergency?.countryCode || "+91",
            emergencyPhone: data.emergency?.phone ? data.emergency.phone.replace(data.emergency.countryCode || "+91", "").trim() : "",
            
            govIdType: data.identification?.type || "",
            govIdNumber: data.identification?.number || "",
            
            allergies: data.medical?.allergies || [],
            conditions: data.medical?.conditions || [],
            medications: data.medical?.medications || [],
          };
          
          setFormData(initForm);
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [clinicKey, patientId]);

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrs = { ...prev };
        delete newErrs[field];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const errs: any = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (formData.dobMode === "dob" && !formData.dob) errs.dob = "DOB is required";
    if (formData.dobMode === "age" && !formData.approxAge) errs.approxAge = "Age is required";
    if (!formData.gender) errs.gender = "Gender is required";
    if (!formData.mobile) errs.mobile = "Mobile number is required";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !clinicKey || !patientId) return;
    setSaving(true);
    
    try {
      const updates = {
        "identity/name": formData.name.trim(),
        "identity/dob": formData.dobMode === "dob" ? formData.dob : "",
        "identity/age": formData.dobMode === "age" ? `${formData.approxAge}Y (approx)` : "",
        "identity/gender": formData.gender,
        "identity/maritalStatus": formData.maritalStatus,
        "identity/bloodGroup": formData.bloodGroup,
        
        "contact/countryCode": formData.countryCode,
        "contact/mobile": `${formData.countryCode} ${formData.mobile}`,
        "contact/email": formData.email,
        "contact/address": {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        
        "emergency/name": formData.emergencyName,
        "emergency/relationship": formData.emergencyRelation,
        "emergency/countryCode": formData.emergencyCountryCode,
        "emergency/phone": formData.emergencyPhone ? `${formData.emergencyCountryCode} ${formData.emergencyPhone}` : "",
        
        "identification/type": formData.govIdType,
        "identification/number": formData.govIdNumber,
        
        "medical/allergies": formData.allergies,
        "medical/conditions": formData.conditions,
        "medical/medications": formData.medications,
      };

      await update(ref(db, `carefirst/users/${clinicKey}/patients/${patientId}`), updates);
      
      navigate({ to: "/admin/patients/$patientId", params: { patientId } });
    } catch (err) {
      console.error("Error saving updates:", err);
      setErrors({ submit: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-muted-foreground">Loading profile data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/admin/patients/$patientId", params: { patientId } })}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy font-display">
              Edit Patient Profile
            </h1>
            <p className="text-sm text-muted-foreground">Update patient information and medical history.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="h-10 rounded-xl bg-primary text-white">
          {saving ? <><Loader2 size={15} className="mr-2 animate-spin" /> Saving...</> : <><Save size={15} className="mr-2" /> Save Changes</>}
        </Button>
      </div>

      {errors.submit && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm font-medium">
          {errors.submit}
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-8 space-y-10">
        <StepBasicInfo formData={formData} updateField={updateField} errors={errors} />
        
        <div className="h-px bg-border my-8" />
        
        <StepContactMedical 
          formData={formData} 
          updateField={updateField} 
          errors={errors} 
          matches={[]} 
          checking={false} 
          checkDuplicate={() => {}} 
          clearMatches={() => {}} 
        />
      </div>

    </div>
  );
}
