import { serve } from "https://deno.land/std/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const {
      orderId,
      orderNumber,
      customerName,
      customerMobile,
      total,
      itemCount,
      itemsText,
      orderDateTime,
      orderLink,
      message: messageOverride,
      to: toOverride,
    } = payload || {};

    const token = Deno.env.get("WHATSAPP_TOKEN");
    const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
    const ownerTo = Deno.env.get("WHATSAPP_OWNER_TO");

    if (!token || !phoneId) {
      return new Response(
        JSON.stringify({ error: "Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize Indian phone numbers
    const normalizeTo = (value?: string) => {
      if (!value) return "";
      const digits = String(value).replace(/\D/g, "");
      if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
      if (digits.length === 10) return `+91${digits}`;
      return `+${digits}`;
    };

    const to = ownerTo || toOverride || normalizeTo(customerMobile);

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing recipient phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("send-whatsapp payload", {
      orderId,
      orderNumber,
      customerName,
      customerMobile,
      total,
      itemCount,
      itemsText,
      orderDateTime,
      orderLink,
      to,
    });

    // ✅ Approved template from your WhatsApp Manager
    const templateName = "admin_order_details";
    const templateLanguage = "en_IN";

    const resolvedOrderId = orderNumber || orderId || "N/A";
    const resolvedDateTime =
      orderDateTime ||
      new Date().toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      });
    const resolvedItems =
      itemsText || (itemCount ? `${itemCount} items` : "NA");
    const resolvedTotal = total != null ? `Rs ${total}` : "NA";
    const baseUrl = Deno.env.get("ADMIN_ORDER_BASE_URL") || "";
    const resolvedOrderLink =
      orderLink || (baseUrl ? `${baseUrl}/${resolvedOrderId}` : "NA");

    const templateParams = [
      String(resolvedOrderId),
      String(resolvedDateTime),
      String(customerName || "Customer"),
      String(resolvedItems),
      String(resolvedTotal),
      String(resolvedOrderLink),
    ].map((value) => (value && String(value).trim() ? String(value) : "NA"));


    const res = await fetch(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: templateLanguage },
            components: [
              {
                type: "body",
                parameters: templateParams.map((value) => ({
                  type: "text",
                  text: value,
                })),
              },
            ],
          },
        }),
      }
    );

    const data = await res.json();

    console.log("send-whatsapp meta response", {
      status: res.status,
      ok: res.ok,
      data,
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data?.error || data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});



