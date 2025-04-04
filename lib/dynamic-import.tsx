import type React from "react"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DynamicImportOptions {
  ssr?: boolean
  loading?: React.ComponentType<any> | null
  suspense?: boolean
}

export function dynamicImport(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  options: DynamicImportOptions = {},
) {
  const { ssr = false, loading: LoadingComponent = null, suspense = true } = options

  const DynamicComponent = dynamic(importFn, {
    ssr,
    loading: LoadingComponent ? () => <LoadingComponent /> : undefined,
  })

  if (suspense && !LoadingComponent) {
    return (props: any) => (
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DynamicComponent {...props} />
      </Suspense>
    )
  }

  return DynamicComponent
}

