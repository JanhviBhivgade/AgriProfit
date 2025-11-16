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

// GET - Fetch crops
export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth

    const { data, error } = await supabase
      .from("crops")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Error fetching crops:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create crop
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user, supabase } = auth
    const body = await request.json()

    const { name, description } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Crop name is required" },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Crop name is too long (max 100 characters)" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("crops")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("Error creating crop:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update crop
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
        { error: "Crop ID is required" },
        { status: 400 }
      )
    }

    // Verify crop belongs to user
    const { data: existingCrop, error: fetchError } = await supabase
      .from("crops")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingCrop) {
      return NextResponse.json(
        { error: "Crop not found" },
        { status: 404 }
      )
    }

    // Validation
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim().length === 0) {
        return NextResponse.json(
          { error: "Crop name is required" },
          { status: 400 }
        )
      }

      if (updateData.name.length > 100) {
        return NextResponse.json(
          { error: "Crop name is too long (max 100 characters)" },
          { status: 400 }
        )
      }
      updateData.name = updateData.name.trim()
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description?.trim() || null
    }

    const { data, error } = await supabase
      .from("crops")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error updating crop:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete crop
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
        { error: "Crop ID is required" },
        { status: 400 }
      )
    }

    // Verify crop belongs to user
    const { data: existingCrop, error: fetchError } = await supabase
      .from("crops")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingCrop) {
      return NextResponse.json(
        { error: "Crop not found" },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("crops")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting crop:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

