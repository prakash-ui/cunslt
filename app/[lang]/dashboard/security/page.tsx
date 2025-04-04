import { SecurityDashboard } from "@/components/dashboard/security-dashboard"

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const lang = params.lang || "en";
  return {
    title: lang === "en" ? "Security | Dashboard" : "Sécurité | Tableau de bord",
    description: lang === "en" ? "Manage your security settings" : "Gérez vos paramètres de sécurité",
  };
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-8">
      <SecurityDashboard />
    </div>
  )
}

