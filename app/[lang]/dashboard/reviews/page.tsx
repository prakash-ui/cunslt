import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReviewList } from "@/components/reviews/review-list"
import { getClientReviews, getExpertReviews } from "@/app/actions/reviews"
import { getCurrentUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Reviews | Dashboard",
  description: "Manage your reviews and feedback",
}

async function fetchReviews(userId: string, isExpert: boolean) {
  // Get reviews written by the user (as a client)
  const clientReviewsResult = await getClientReviews(userId);
  const writtenReviews = "reviews" in clientReviewsResult ? clientReviewsResult.reviews : [];

  // If user is an expert, get reviews about them
  let receivedReviews = [];
  if (isExpert) {
    const result = await getExpertReviews(userId);
    if ("reviews" in result) {
      receivedReviews = result.reviews;
    }
  }

  return { writtenReviews, receivedReviews };
}

function ReviewsContent({
  user,
  writtenReviews,
  receivedReviews,
}: {
  user: any;
  writtenReviews: any[];
  receivedReviews: any[];
}) {
  const isExpert = user.user_type === "expert";
  const hasWrittenReviews = writtenReviews.length > 0;
  const hasReceivedReviews = receivedReviews.length > 0;

  return (
    <Tabs defaultValue={isExpert && hasReceivedReviews ? "received" : "written"} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        {isExpert && <TabsTrigger value="received">Reviews About Me</TabsTrigger>}
        <TabsTrigger value="written">Reviews I've Written</TabsTrigger>
        {!isExpert && <TabsTrigger value="written" className="invisible"></TabsTrigger>}
      </TabsList>

      {isExpert && (
        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews About Me</CardTitle>
              <CardDescription>See what clients are saying about your services</CardDescription>
            </CardHeader>
            <CardContent>
              {hasReceivedReviews ? (
                <ReviewList
                  expertId={user.id}
                  currentUserId={user.id}
                  isExpert={true}
                  initialReviews={receivedReviews}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">You haven't received any reviews yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      )}

      <TabsContent value="written" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Reviews I've Written</CardTitle>
            <CardDescription>Manage the reviews you've written for experts</CardDescription>
          </CardHeader>
          <CardContent>
            {hasWrittenReviews ? (
              <ReviewList expertId="" currentUserId={user.id} initialReviews={writtenReviews} />
            ) : (
              <div className="text-center py-8 text-gray-500">You haven't written any reviews yet.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default async function ReviewsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isExpert = user.user_type === "expert";
  const { writtenReviews, receivedReviews } = await fetchReviews(user.id, isExpert);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Reviews</h1>
      <Suspense fallback={<div>Loading reviews...</div>}>
        <ReviewsContent
          user={user}
          writtenReviews={writtenReviews}
          receivedReviews={receivedReviews}
        />
      </Suspense>
    </div>
  );
}

