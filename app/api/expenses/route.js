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

// GET - Fetch expenses
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
      .from("expenses")
      .select(`
        *,
        crops (
          id,
          name
        )
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    // Apply filters
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const cropId = searchParams.get("cropId")

    if (category) {
      query = query.eq("category", category)
    }

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    if (cropId) {
      query = query.eq("crop_id", cropId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create expense
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const body = await request.json()

    const { category, crop_id, description, amount, date, quantity, unit } =
      body

    // Validation
    if (!category || !description || !amount || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        category,
        crop_id: crop_id || null,
        description,
        amount: parseFloat(amount),
        date,
        quantity: quantity ? parseFloat(quantity) : null,
        unit: unit || null,
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
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update expense
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
        { error: "Expense ID is required" },
        { status: 400 }
      )
    }

    // Verify expense belongs to user
    const { data: existingExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updatePayload = {}
    if (updateData.category) updatePayload.category = updateData.category
    if (updateData.crop_id !== undefined)
      updatePayload.crop_id = updateData.crop_id || null
    if (updateData.description) updatePayload.description = updateData.description
    if (updateData.amount !== undefined)
      updatePayload.amount = parseFloat(updateData.amount)
    if (updateData.date) updatePayload.date = updateData.date
    if (updateData.quantity !== undefined)
      updatePayload.quantity = updateData.quantity ? parseFloat(updateData.quantity) : null
    if (updateData.unit !== undefined) updatePayload.unit = updateData.unit || null

    const { data, error } = await supabase
      .from("expenses")
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
    console.error("Error updating expense:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete expense
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
        { error: "Expense ID is required" },
        { status: 400 }
      )
    }

    // Verify expense belongs to user
    const { data: existingExpense, error: fetchError } = await supabase
      .from("expenses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingExpense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

