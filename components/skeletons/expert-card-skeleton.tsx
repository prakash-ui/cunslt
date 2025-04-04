import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function ExpertCardSkeleton() {
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-3" />
              ))}
              <Skeleton className="h-3 w-8 ml-2" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full mt-1" />
          <Skeleton className="h-3 w-3/4 mt-1" />
        </div>
        <Skeleton className="mt-4 h-6 w-24" />
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}

