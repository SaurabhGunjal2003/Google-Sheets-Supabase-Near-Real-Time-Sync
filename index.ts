// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sheets-demo' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

import { serve } from "https://deno.land/std/http/server.ts";

function base64url(input: string) {
  return btoa(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken() {
  const header = base64url(JSON.stringify({
    alg: "RS256",
    typ: "JWT",
  }));

  const now = Math.floor(Date.now() / 1000);

  const payload = base64url(JSON.stringify({
    iss: Deno.env.get("GOOGLE_CLIENT_EMAIL"),
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const data = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    Uint8Array.from(
      atob(
        Deno.env.get("GOOGLE_PRIVATE_KEY")!
          .replace(/\\n/g, "\n")
          .replace("-----BEGIN PRIVATE KEY-----", "")
          .replace("-----END PRIVATE KEY-----", "")
      ),
      c => c.charCodeAt(0)
    ),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data)
  );

  const jwt = `${data}.${base64url(
    String.fromCharCode(...new Uint8Array(signature))
  )}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

serve(async () => {
  try {
    const token = await getAccessToken();
    const sheetId = Deno.env.get("SPREADSHEET_ID");

    // WRITE
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:C:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            ["Saurabh", "saurabh@gmail.com", new Date().toISOString()],
          ],
        }),
      }
    );

    // READ
    const readRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:C`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await readRes.json();

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
