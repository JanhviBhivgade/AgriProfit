import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Helper to get authenticated user
async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.replace("Bearer ", "")
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return { user, supabase }
}

// GET - Fetch yields
export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const { searchParams } = new URL(request.url)

    // Build query
    let query = supabase
      .from("yields")
      .select(`
        *,
        crops (
          id,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("harvest_date", { ascending: false })

    // Apply filters
    const cropId = searchParams.get("cropId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (cropId) {
      query = query.eq("crop_id", cropId)
    }

    if (startDate) {
      query = query.gte("harvest_date", startDate)
    }

    if (endDate) {
      query = query.lte("harvest_date", endDate)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error fetching yields:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create yield
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const body = await request.json()

    const { crop_id, quantity, unit, sale_price, harvest_date } = body

    // Validation
    if (!crop_id || !quantity || !unit || sale_price === undefined || !harvest_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("yields")
      .insert({
        user_id: user.id,
        crop_id,
        quantity: parseFloat(quantity),
        unit,
        sale_price: parseFloat(sale_price),
        harvest_date,
      })
      .select(`
        *,
        crops (
          id,
          name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error creating yield:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update yield
export async function PUT(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "Yield ID is required" },
        { status: 400 }
      )
    }

    // Verify yield belongs to user
    const { data: existingYield, error: fetchError } = await supabase
      .from("yields")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingYield) {
      return NextResponse.json(
        { error: "Yield not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updatePayload = {}
    if (updateData.crop_id) updatePayload.crop_id = updateData.crop_id
    if (updateData.quantity !== undefined)
      updatePayload.quantity = parseFloat(updateData.quantity)
    if (updateData.unit) updatePayload.unit = updateData.unit
    if (updateData.sale_price !== undefined)
      updatePayload.sale_price = parseFloat(updateData.sale_price)
    if (updateData.harvest_date) updatePayload.harvest_date = updateData.harvest_date

    const { data, error } = await supabase
      .from("yields")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(`
        *,
        crops (
          id,
          name
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error updating yield:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete yield
export async function DELETE(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Yield ID is required" },
        { status: 400 }
      )
    }

    // Verify yield belongs to user
    const { data: existingYield, error: fetchError } = await supabase
      .from("yields")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingYield) {
      return NextResponse.json(
        { error: "Yield not found" },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("yields")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting yield:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

