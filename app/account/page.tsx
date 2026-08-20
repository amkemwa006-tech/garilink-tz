import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase.from("profiles")
    .select("full_name, role, region")
    .eq("id", user.id)
    .maybeSingle();
  const isSeller = profile?.role === "seller" || profile?.role === "dealer";

  return (
    <main className="container toolPage">
      <p className="eyebrow">GARILINK TZ ACCOUNT</p>
      <h1>{profile?.full_name || "My account"}</h1>
      <p>{user.email}</p>
      <p>Account type: <b>{isSeller ? "Seller" : "Buyer"}</b></p>
      {profile?.region && <p>Region: {profile.region}</p>}
      {isSeller ? (
        <a className="primary" href="/seller/create-listing">Create a listing</a>
      ) : (
        <a className="primary" href="/seller/onboarding">Start selling</a>
      )}
    </main>
  );
}
