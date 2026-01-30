import { supabase } from "./supabaseClient";

export async function sendOrderWhatsappNotification(payload) {
  return supabase.functions.invoke("send-whatsapp", {
    body: payload,
  });
}
