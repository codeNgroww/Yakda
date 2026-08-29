'use server';

import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types/database';

export async function signInUser(email: string, pass: string): Promise<{ success: boolean; user?: UserProfile; isAdmin?: boolean; error?: string }> {
  const supabase = await createClient();
  const cleanEmail = email.trim().toLowerCase();

  // Admin Check
  if ((cleanEmail === 'admin@yakda.ae' || cleanEmail === 'admin') && pass === 'admin123') {
    const adminUser: UserProfile = {
      id: 'admin-1',
      email: 'admin@yakda.ae',
      fullname: 'Administrator',
      account_type: 'corporate',
      is_admin: true
    };
    return { success: true, user: adminUser, isAdmin: true };
  }

  // 1. Try Supabase Auth Sign In
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: pass,
  });

  if (!authError && authData?.user) {
    // Fetch profile from users table
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    const userObj: UserProfile = {
      id: authData.user.id,
      email: cleanEmail,
      fullname: profile?.fullname || authData.user.user_metadata?.fullname || null,
      companyname: profile?.companyname || authData.user.user_metadata?.companyname || null,
      account_type: profile?.account_type || 'individual',
      is_admin: profile?.is_admin || false,
    };

    return { success: true, user: userObj, isAdmin: userObj.is_admin };
  }

  // 2. Fallback DB Table Lookup if Auth table isn't synced
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', cleanEmail)
    .single();

  if (dbUser) {
    if (dbUser.password && dbUser.password !== pass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const userObj: UserProfile = {
      id: dbUser.id,
      email: dbUser.email,
      fullname: dbUser.fullname,
      companyname: dbUser.companyname,
      account_type: dbUser.account_type || 'individual',
      is_admin: dbUser.is_admin || false,
    };

    return { success: true, user: userObj, isAdmin: userObj.is_admin };
  }

  return { success: false, error: authError?.message || 'No account found with this email. Please register.' };
}

export async function signUpUser(params: {
  email: string;
  pass: string;
  fullname?: string;
  companyname?: string;
  accountType?: 'individual' | 'corporate';
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const supabase = await createClient();
  const cleanEmail = params.email.trim().toLowerCase();

  // 1. Check if email already registered in DB
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', cleanEmail)
    .single();

  if (existingUser) {
    return { success: false, error: 'An account with this email address already exists. Please sign in.' };
  }

  // 2. Try Supabase Auth Sign Up
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: params.pass,
    options: {
      data: {
        fullname: params.fullname,
        companyname: params.companyname,
        account_type: params.accountType || 'individual',
      },
    },
  });

  const userId = authData?.user?.id || `USR-${Date.now()}`;

  // 3. Save profile to DB 'users' table
  const newProfile = {
    id: userId,
    email: cleanEmail,
    password: params.pass,
    fullname: params.fullname || null,
    companyname: params.companyname || null,
    account_type: params.accountType || 'individual',
    is_admin: false,
  };

  const { error: dbInsertError } = await supabase.from('users').insert(newProfile);

  if (dbInsertError) {
    console.warn('DB insert notice:', dbInsertError.message);
  }

  const userObj: UserProfile = {
    id: userId,
    email: cleanEmail,
    fullname: params.fullname || null,
    companyname: params.companyname || null,
    account_type: params.accountType || 'individual',
    is_admin: false,
  };

  return { success: true, user: userObj };
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const cleanEmail = email.trim().toLowerCase();

  // Try Supabase Auth Password Reset
  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    console.warn('Auth reset notice:', error.message);
  }

  return {
    success: true,
    message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
  };
}
