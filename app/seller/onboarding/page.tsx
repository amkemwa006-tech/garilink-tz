import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function SellerOnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  async function becomeSeller(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth");

    await supabase
      .from("profiles")
      .update({
        full_name: String(formData.get("fullName")),
        phone: String(formData.get("phone")),
        region: String(formData.get("region")),
        role: "seller",
        onboarding_complete: true,
      })
      .eq("id", user.id);

    redirect("/seller/create-listing");
  }

  return (
    <main className="container toolPage">
      <h1>Become a seller</h1>

      <form action={becomeSeller} className="valueForm">
        <label>
          Full name
          <input name="fullName" required />
        </label>

        <label>
          Tanzanian phone number
          <input name="phone" placeholder="+255 7XX XXX XXX" required />
        </label>

        <label>
          Region
          <select name="region" required>
            <option value="Dar es Salaam">Dar es Salaam</option>
            <option value="Arusha">Arusha</option>
            <option value="Dodoma">Dodoma</option>
            <option value="Mwanza">Mwanza</option>
            <option value="Mbeya">Mbeya</option>
          </select>
        </label>

        <button className="primary">Continue as seller</button>
      </form>
    </main>
  );
}
