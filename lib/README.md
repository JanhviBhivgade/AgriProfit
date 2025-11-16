# Library Files

## supabase.js

This file contains the Supabase client configuration for the application.

### Usage

**Client-side (Browser):**
```javascript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('expenses')
  .select('*')
```

**Server-side (Admin operations):**
```javascript
import { supabaseAdmin } from '@/lib/supabase'

// Example: Admin operation (only use in API routes or server components)
if (supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select('*')
}
```

### Important Notes

- `supabase` - Use this for client-side operations. Safe to use in components and client-side code.
- `supabaseAdmin` - Use this only in API routes or server components. Has admin privileges and should never be exposed to the client.

