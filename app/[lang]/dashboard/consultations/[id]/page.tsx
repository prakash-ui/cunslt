import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { getCurrentUser } from "@/app/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewPromptWrapper } from "@/components/reviews/review-prompt-wrapper"

interface ConsultationDetailsPageProps {
  params: {
    id: string
  }
}

async function fetchConsultationDetails(consultationId: string, userId: string) {
  const supabase = createClient();

  // Fetch consultation details
  const { data: consultation, error } = await supabase
    .from("consultations")
    .select(`
      *,
      expert:expert_id(id, full_name, avatar_url),
      client:client_id(id, full_name, avatar_url)
    `)
    .eq("id", consultationId)
    .single();

  if (error || !consultation) {
    notFound();
  }

  // Fetch existing review
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("consultation_id", consultationId)
    .eq("client_id", userId)
    .single();

  return { consultation, existingReview };
}

function ConsultationDetailsContent({
  consultation,
  canReview,
  consultationId,
}: {
  consultation: any;
  canReview: boolean;
  consultationId: string;
}) {
  return (
    <div className="space-y-8">
      {/* Consultation details card */}
      <Card>
        <CardHeader>
          <CardTitle>Consultation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium">Date & Time</h3>
              <p>{new Date(consultation.start_time).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <p className="capitalize">{consultation.status}</p>
            </div>
            <div>
              <h3 className="font-medium">Expert</h3>
              <p>{consultation.expert.full_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Client</h3>
              <p>{consultation.client.full_name}</p>
            </div>
            <div>
              <h3 className="font-medium">Amount</h3>
              <p>${consultation.amount}</p>
            </div>
            <div>
              <h3 className="font-medium">Payment Status</h3>
              <p className="capitalize">{consultation.payment_status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review prompt for completed consultations */}
      {canReview && <ReviewPromptWrapper consultationId={consultationId} expertName={consultation.expert.full_name} />}
    </div>
  );
}

export default async function ConsultationDetailsPage({ params }: ConsultationDetailsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { consultation, existingReview } = await fetchConsultationDetails(params.id, user.id);

  // Check if the user is authorized to view this consultation
  if (
    consultation.client_id !== user.id &&
    consultation.expert_id !== user.id &&
    user.role !== "admin"
  ) {
    redirect("/dashboard");
  }

  const isCompleted = consultation.status === "completed";
  const isClient = consultation.client_id === user.id;
  const canReview = isCompleted && isClient && !existingReview;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Consultation Details</h1>
      <Suspense fallback={<div>Loading consultation details...</div>}>
        <ConsultationDetailsContent
          consultation={consultation}
          canReview={canReview}
          consultationId={params.id}
        />
      </Suspense>
    </div>
  );
}

