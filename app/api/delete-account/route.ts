
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAuthToken(req: Request) {
  const h = req.headers.get("authorization");
  return h?.toLowerCase().startsWith("bearer ") ? h.slice(7) : null;
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  );
  
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    await supabase.from("profiles").delete().eq("id", userData.user.id);
    await supabase.auth.admin.deleteUser(userData.user.id);
    return NextResponse.json({ message: "Account deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
