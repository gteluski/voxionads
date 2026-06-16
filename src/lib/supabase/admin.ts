import { createClient } from '@supabase/supabase-js'

// Admin client to bypass RLS, ONLY use in server actions/api routes for background tasks
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Ensures a user from Supabase Auth exists in the public.admin_users table.
 * This prevents foreign key constraint issues when referencing admin_id.
 */
export async function ensureAdminUserExists(userId: string, email: string, name?: string) {
  try {
    const { data: userById, error: errorById } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (errorById) {
      console.error('Error checking admin user existence in DB:', errorById);
      return;
    }

    if (!userById) {
      // User with this ID does not exist. Check if same email exists with a different ID
      const { data: userByEmail } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userByEmail) {
        console.log(`⚠️ User with email ${email} exists with different ID ${userByEmail.id}. Re-linking ID to ${userId}...`);
        // Delete old mismatched record (ON DELETE CASCADE will clear related rows)
        await supabaseAdmin
          .from('admin_users')
          .delete()
          .eq('id', userByEmail.id);
      }

      // Insert/Create the admin user with the correct Auth userId
      const { error: insertError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          id: userId,
          email,
          name: name || email.split('@')[0] || 'Admin',
          password_hash: 'external-auth',
          is_active: true
        });

      if (insertError) {
        console.error('Failed to auto-insert user into admin_users:', insertError);
      } else {
        console.log(`Successfully auto-inserted and linked auth user ${email} into admin_users.`);
      }
    }
  } catch (err) {
    console.error('Unexpected error in ensureAdminUserExists helper:', err);
  }
}

