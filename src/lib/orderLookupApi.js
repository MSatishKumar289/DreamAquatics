import { supabase } from "./supabaseClient";

export async function lookupOrderByIdAndMobile({ orderId, mobile }) {
  return supabase.functions.invoke("lookup-order", {
    body: { orderId, mobile },
  });
}
