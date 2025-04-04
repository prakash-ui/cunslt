import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const setupKey = request.nextUrl.searchParams.get("key")

  if (setupKey !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createClient()

  try {
    // Create wallet_transactions table
    await supabase.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        description TEXT,
        reference TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS wallet_transactions_expert_id_idx ON wallet_transactions(expert_id);
    `)

    return NextResponse.json({ success: true, message: "Wallet transactions table created successfully" })
  } catch (error) {
    console.error("Error creating wallet transactions table:", error)
    return NextResponse.json({ error: "Failed to create wallet transactions table" }, { status: 500 })
  }
}

