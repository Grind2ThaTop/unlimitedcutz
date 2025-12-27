import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize clients
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper for logging
const logStep = (step: string, data?: any) => {
  console.log(`[send-email] ${step}`, data ? JSON.stringify(data) : "");
};

// Email template types
type TemplateType = 
  | "account_created"
  | "group_rules"
  | "first_win"
  | "verify_reminder"
  | "payment_failed"
  | "payment_recovered"
  | "daily_digest"
  | "weekly_report"
  | "admin_notification"
  | "referral_notification"
  | "activity_notification";

interface EmailRequest {
  template: TemplateType;
  to: string;
  data: Record<string, any>;
  user_id?: string;
}

// Generate email content based on template
function generateEmailContent(template: TemplateType, data: Record<string, any>): { subject: string; html: string } {
  const brandColor = "#D4AF37"; // Gold accent color
  const brandName = "Magnetic Barbering";
  
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
      .header h1 { color: ${brandColor}; margin: 0; font-size: 28px; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; }
      .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #666; }
      .button { display: inline-block; background: ${brandColor}; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; }
      .button:hover { background: #c4a030; }
      .highlight { background: #f8f4e8; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid ${brandColor}; }
      .rules-list { background: #1a1a1a; color: #fff; padding: 20px; border-radius: 8px; }
      .rules-list li { margin-bottom: 10px; padding-left: 10px; }
      .stat-box { display: inline-block; background: #f0f0f0; padding: 15px 25px; margin: 5px; border-radius: 8px; text-align: center; }
      .stat-number { font-size: 24px; font-weight: bold; color: ${brandColor}; }
      .stat-label { font-size: 12px; color: #666; }
      .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .success { background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
  `;

  switch (template) {
    case "account_created":
      return {
        subject: `Welcome to ${brandName} - Your Account is Ready!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${data.name || 'Member'}!</h2>
              <p>Your account has been successfully created. You're now part of the ${brandName} family.</p>
              
              <div class="highlight">
                <strong>Your Login Details:</strong><br>
                Email: ${data.email}<br>
                ${data.temp_password ? `Temporary Password: <code>${data.temp_password}</code>` : 'Use the magic link below to log in.'}
              </div>
              
              <p style="text-align: center;">
                <a href="${data.login_url || '#'}" class="button">Log In to Your Account →</a>
              </p>
              
              <h3>What's Next?</h3>
              <ol>
                <li>Log in to your dashboard</li>
                <li>Complete your profile setup</li>
                ${data.role === 'barber' ? '<li>Get verified as a barber</li>' : ''}
              </ol>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "group_rules":
      const rules = data.rules || [
        "Respect all members",
        "No spam or self-promotion",
        "Keep discussions professional",
        "Report violations immediately"
      ];
      return {
        subject: `You've Been Assigned to: ${data.group_name}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Welcome to ${data.group_name}!</h2>
              <p>You've been assigned to this group based on your ${data.assignment_reason || 'membership type'}.</p>
              
              <div class="rules-list">
                <h3 style="color: ${brandColor}; margin-top: 0;">📋 Group Rules</h3>
                <ol>
                  ${rules.map((rule: string) => `<li>${rule}</li>`).join('')}
                </ol>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> Breaking these rules may result in removal from the group and potential account suspension.
              </div>
              
              <p style="text-align: center;">
                <a href="${data.dashboard_url || '#'}" class="button">Go to Your Dashboard →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "first_win":
      return {
        subject: `Don't Miss Out - Complete Your Setup!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Hey ${data.name || 'there'}, you're almost there! 🎯</h2>
              <p>We noticed you haven't finished setting up your account yet.</p>
              
              <div class="highlight">
                <strong>Complete your setup to unlock:</strong>
                <ul>
                  <li>Your personalized dashboard</li>
                  <li>Member-exclusive discounts</li>
                  <li>Referral bonuses</li>
                  ${data.role === 'barber' ? '<li>Barber commission tracking</li>' : ''}
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.setup_url || '#'}" class="button">Finish Setup Now →</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">This only takes 2 minutes, and you'll be good to go!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "verify_reminder":
      return {
        subject: `Action Required: Verify Your Email`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Please Verify Your Email</h2>
              <p>Hi ${data.name || 'there'},</p>
              <p>Your email address hasn't been verified yet. Please click the button below to complete verification.</p>
              
              <div class="warning">
                <strong>⚠️ Reminder ${data.attempt_number || 1} of 3:</strong> Unverified accounts have limited access to features.
              </div>
              
              <p style="text-align: center;">
                <a href="${data.verify_url || '#'}" class="button">Verify My Email →</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "payment_failed":
      return {
        subject: `⚠️ Payment Failed - Action Required`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Your Payment Couldn't Be Processed</h2>
              <p>Hi ${data.name || 'there'},</p>
              
              <div class="warning">
                <strong>⚠️ Payment Failed</strong><br>
                We couldn't process your payment of <strong>$${data.amount || '50.00'}</strong> for your ${data.plan || 'membership'}.
              </div>
              
              <p>Your account access has been temporarily paused until payment is resolved.</p>
              
              <div class="highlight">
                <strong>Common reasons for failed payments:</strong>
                <ul>
                  <li>Expired card</li>
                  <li>Insufficient funds</li>
                  <li>Bank security hold</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.payment_url || '#'}" class="button">Update Payment Method →</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">Need help? Reply to this email or contact support.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "payment_recovered":
      return {
        subject: `✅ Payment Successful - Access Restored!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>You're Back in Business! 🎉</h2>
              <p>Hi ${data.name || 'there'},</p>
              
              <div class="success">
                <strong>✅ Payment Successful!</strong><br>
                Your payment of <strong>$${data.amount || '50.00'}</strong> has been processed successfully.
              </div>
              
              <p>Your full account access has been restored. You can now continue using all your ${data.plan || 'membership'} benefits.</p>
              
              <p style="text-align: center;">
                <a href="${data.dashboard_url || '#'}" class="button">Go to Dashboard →</a>
              </p>
              
              <p style="color: #666; font-size: 14px;">Thank you for being a valued member!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "daily_digest":
      return {
        subject: `📊 Your Daily Activity Summary - ${new Date().toLocaleDateString()}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Your Daily Digest</h2>
              <p>Here's what happened today, ${data.name || 'Member'}:</p>
              
              <div style="text-align: center; margin: 20px 0;">
                <div class="stat-box">
                  <div class="stat-number">${data.reactions || 0}</div>
                  <div class="stat-label">Reactions</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${data.comments || 0}</div>
                  <div class="stat-label">Comments</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${data.new_members || 0}</div>
                  <div class="stat-label">New Members</div>
                </div>
              </div>
              
              ${data.top_post ? `
                <div class="highlight">
                  <strong>🔥 Top Post Today:</strong><br>
                  "${data.top_post.title || 'Untitled'}" by ${data.top_post.author || 'Anonymous'}
                </div>
              ` : ''}
              
              ${data.referrals && data.referrals > 0 ? `
                <div class="success">
                  <strong>💰 Referral Bonus!</strong> You earned ${data.referrals} new referral(s) today.
                </div>
              ` : ''}
              
              ${data.bookings && data.bookings > 0 ? `
                <div class="highlight">
                  <strong>📅 Bookings:</strong> ${data.bookings} appointment(s) scheduled.
                </div>
              ` : ''}
              
              <p style="text-align: center;">
                <a href="${data.dashboard_url || '#'}" class="button">View Full Activity →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
              <p><a href="${data.unsubscribe_url || '#'}">Unsubscribe from daily digests</a></p>
            </div>
          </div>
        `
      };

    case "weekly_report":
      return {
        subject: `📈 Weekly Performance Report - ${brandName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Weekly Report: ${data.week_start} - ${data.week_end}</h2>
              
              <div style="text-align: center; margin: 20px 0;">
                <div class="stat-box">
                  <div class="stat-number">${data.new_signups || 0}</div>
                  <div class="stat-label">New Signups</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${data.churned || 0}</div>
                  <div class="stat-label">Churned</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">$${data.revenue || '0'}</div>
                  <div class="stat-label">Revenue</div>
                </div>
              </div>
              
              <h3>📊 Engagement Leaderboard</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Rank</th>
                  <th style="padding: 10px; text-align: left;">Member</th>
                  <th style="padding: 10px; text-align: right;">Activity</th>
                </tr>
                ${(data.leaderboard || []).map((member: any, idx: number) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">#${idx + 1}</td>
                    <td style="padding: 10px;">${member.name}</td>
                    <td style="padding: 10px; text-align: right;">${member.activity_count}</td>
                  </tr>
                `).join('')}
              </table>
              
              <h3>💰 Revenue Events</h3>
              <div class="highlight">
                <ul>
                  <li>Memberships: $${data.membership_revenue || '0'}</li>
                  <li>Referral Commissions: $${data.referral_commissions || '0'}</li>
                  <li>Product Sales: $${data.product_sales || '0'}</li>
                </ul>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.admin_dashboard_url || '#'}" class="button">View Full Report →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "admin_notification":
      return {
        subject: `🔔 Admin Alert: ${data.title || 'New Event'}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName} - Admin</h1>
            </div>
            <div class="content">
              <h2>${data.title || 'New Notification'}</h2>
              <p>${data.message || 'An event occurred that requires your attention.'}</p>
              
              ${data.details ? `
                <div class="highlight">
                  <strong>Details:</strong><br>
                  ${typeof data.details === 'object' ? JSON.stringify(data.details, null, 2) : data.details}
                </div>
              ` : ''}
              
              ${data.action_url ? `
                <p style="text-align: center;">
                  <a href="${data.action_url}" class="button">${data.action_text || 'Take Action'} →</a>
                </p>
              ` : ''}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. Admin notification.</p>
            </div>
          </div>
        `
      };

    case "referral_notification":
      return {
        subject: `🎉 New Referral: ${data.referral_name} Just Signed Up!`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>Congratulations! 🎉</h2>
              <p>Hi ${data.name || 'there'},</p>
              
              <div class="success">
                <strong>💰 New Referral Bonus!</strong><br>
                <strong>${data.referral_name}</strong> just signed up using your referral link!
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <div class="stat-box">
                  <div class="stat-number">$${data.commission_amount || '0'}</div>
                  <div class="stat-label">Commission Earned</div>
                </div>
                <div class="stat-box">
                  <div class="stat-number">${data.total_referrals || 1}</div>
                  <div class="stat-label">Total Referrals</div>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.referrals_url || '#'}" class="button">View Your Referrals →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };

    case "activity_notification":
      return {
        subject: `${data.actor_name} ${data.action_text || 'interacted with your content'}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <h2>New Activity on Your Content</h2>
              <p>Hi ${data.name || 'there'},</p>
              
              <div class="highlight">
                <strong>${data.actor_name}</strong> ${data.action_text || 'interacted with your content'}
                ${data.content_preview ? `<br><br>"${data.content_preview}"` : ''}
              </div>
              
              <p style="text-align: center;">
                <a href="${data.content_url || '#'}" class="button">View Activity →</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
              <p><a href="${data.settings_url || '#'}">Manage notification settings</a></p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: `Message from ${brandName}`,
        html: `
          ${baseStyles}
          <div class="container">
            <div class="header">
              <h1>✂️ ${brandName}</h1>
            </div>
            <div class="content">
              <p>${data.message || 'You have a new notification.'}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
            </div>
          </div>
        `
      };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, to, data, user_id }: EmailRequest = await req.json();
    logStep("Processing email request", { template, to, user_id });

    if (!template || !to) {
      throw new Error("Missing required fields: template and to");
    }

    // Generate email content
    const { subject, html } = generateEmailContent(template, data || {});
    logStep("Generated email content", { subject });

    // Get the from address - use your verified domain in production
    // For testing, use Resend's test domain
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Magnetic Barbering <onboarding@resend.dev>";

    // Send the email
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html,
    });

    // Handle the response - Resend returns { data, error } structure
    const resendId = emailResponse.data?.id || null;
    
    if (emailResponse.error) {
      throw new Error(emailResponse.error.message || "Failed to send email");
    }

    logStep("Email sent successfully", { resend_id: resendId });

    // Log the email in the database
    const { error: logError } = await supabase.from("email_logs").insert({
      user_id: user_id || null,
      email_to: to,
      template,
      subject,
      status: "sent",
      resend_id: resendId,
      metadata: data || {},
    });

    if (logError) {
      logStep("Warning: Failed to log email", { error: logError.message });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        resend_id: resendId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    logStep("Error sending email", { error: error.message });

    // Try to log the failed email
    try {
      const body = await req.clone().json();
      await supabase.from("email_logs").insert({
        user_id: body.user_id || null,
        email_to: body.to || "unknown",
        template: body.template || "unknown",
        subject: "Failed to send",
        status: "failed",
        error_message: error.message,
        metadata: body.data || {},
      });
    } catch (logErr) {
      console.error("Failed to log email error:", logErr);
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
