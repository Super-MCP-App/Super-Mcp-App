import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Verify user exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // Even if user doesn't exist, we return success to prevent email enumeration
      return NextResponse.json({ message: 'If an account with that email exists, an OTP will be sent.' }, { status: 200 });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // 3. Save OTP to database
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert([
        {
          email,
          token: otp,
          expires_at: expiresAt.toISOString(),
        }
      ]);

    if (insertError) {
      console.error('Failed to save OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate reset token' }, { status: 500 });
    }

    // 4. Send Email via Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You recently requested to reset your password. Use the OTP below to complete the process:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP is valid for 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'If an account with that email exists, an OTP will be sent.' }, { status: 200 });

  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
