import { createServerFn } from "@tanstack/react-start";
import { enquirySchema } from "./enquiry-schema";

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot: quietly discard automated submissions without storing them.
    if (data.website) return { received: false as const, message: "Please try again." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("clinic_enquiries")
      .select("id", { head: true, count: "exact" })
      .eq("email", data.email.toLowerCase())
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());
    if (countError) throw new Error("We couldn't receive your request right now. Please try again later.");
    if ((count ?? 0) > 0) return { received: false as const, message: "Please wait a few minutes before sending another request." };

    const { error } = await supabaseAdmin.from("clinic_enquiries").insert({
      name: data.name,
      phone: data.phone,
      clinic: data.clinic,
      email: data.email.toLowerCase(),
      delivery_status: "awaiting_setup",
    });
    if (error) throw new Error("We couldn't receive your request right now. Please try again later.");

    return { received: true as const, message: "Your request has been saved. Email delivery is not active yet; CareFirst has not been notified by email." };
  });