import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Star, CheckCircle, Clock, Calendar, Award } from "lucide-react"

interface RankingDetailsProps {
  ranking: {
    overall_score: number
    review_score: number
    completion_score: number
    response_score: number
    booking_score: number
    verification_bonus: number
  }
}

export function RankingDetails({ ranking }: RankingDetailsProps) {
  // Format score as percentage for progress bar
  const scoreToPercentage = (score: number) => Math.min(Math.round((score / 5) * 100), 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Expert Ranking Details
        </CardTitle>
        <CardDescription>This expert's ranking is calculated based on multiple performance factors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              <h3 className="font-medium">Overall Ranking Score</h3>
            </div>
            <span className="font-bold">{ranking.overall_score.toFixed(1)}/5.0</span>
          </div>
          <Progress value={scoreToPercentage(ranking.overall_score)} className="h-2" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TooltipProvider>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  <h4 className="text-sm font-medium">Review Score</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Based on average rating and number of reviews. Makes up 50% of the overall score.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{ranking.review_score.toFixed(1)}/5.0</span>
              </div>
              <Progress value={scoreToPercentage(ranking.review_score)} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <h4 className="text-sm font-medium">Completion Score</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Based on the percentage of bookings completed successfully. Makes up 20% of the overall score.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{ranking.completion_score.toFixed(1)}/5.0</span>
              </div>
              <Progress value={scoreToPercentage(ranking.completion_score)} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <h4 className="text-sm font-medium">Response Score</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Based on average response time to messages. Makes up 15% of the overall score.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{ranking.response_score.toFixed(1)}/5.0</span>
              </div>
              <Progress value={scoreToPercentage(ranking.response_score)} className="h-1.5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                  <h4 className="text-sm font-medium">Booking Score</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Based on recent booking activity. Makes up 10% of the overall score.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-medium">{ranking.booking_score.toFixed(1)}/5.0</span>
              </div>
              <Progress value={scoreToPercentage(ranking.booking_score)} className="h-1.5" />
            </div>
          </TooltipProvider>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Expert rankings are updated daily based on performance metrics. Higher-ranked experts appear more
            prominently in search results.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

