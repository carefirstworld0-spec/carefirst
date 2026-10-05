import { FileText, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabDocumentsProps {
  patientId: string;
}

export function TabDocuments({ patientId }: TabDocumentsProps) {
  const documents: any[] = []; // Placeholder

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-border pb-2 mb-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <FileText size={18} className="text-primary" /> Patient Documents
        </h3>
        <Button variant="outline" size="sm" className="h-8 text-primary border-primary/20 hover:bg-primary/10">
          <Upload size={14} className="mr-2" /> Upload Document
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mockup for future data */}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed border-border">
          <div className="grid size-12 place-items-center rounded-full bg-secondary mx-auto mb-3 text-muted-foreground">
            <FileText />
          </div>
          <p className="text-[14px] font-medium text-navy">No documents uploaded</p>
          <p className="text-[12px] text-muted-foreground mt-1 mb-4">Upload past medical records, ID proofs, or external reports.</p>
          <Button variant="outline" size="sm">
            <Upload size={14} className="mr-2" /> Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
