import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    // Check for setup key
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (key !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), "db", "advanced-search.sql")
    const sql = fs.readFileSync(sqlPath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error setting up advanced search system:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Advanced search system set up successfully" })
  } catch (error: any) {
    console.error("Error setting up advanced search system:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

