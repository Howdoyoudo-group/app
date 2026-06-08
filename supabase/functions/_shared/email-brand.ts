/**
 * Shared email branding for all Howdoyoudo transactional emails.
 * - Font: Dela Gothic One (loaded via Google Fonts)
 * - Green: #00e600 (matches site primary hsl(120, 100%, 45%))
 * - Logo lockup: howdoyoudo? — dark header, green question mark
 */

export const BRAND_GREEN = "#00e600";
export const BRAND_DARK = "#1a1a1a";
export const BRAND_FONT = `'Dela Gothic One', Impact, 'Arial Black', sans-serif`;
export const BRAND_BODY_FONT = `'Trebuchet MS', 'Helvetica Neue', Arial, sans-serif`;
export const SITE_URL = "https://www.howdoyoudo.co.uk";

/** <head> block — include once per email, loads Dela Gothic One */
export const EMAIL_HEAD_FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&display=swap" rel="stylesheet">`;

/** Dark header row with howdoyoudo? logo lockup — drop inside a <table> */
export function emailHeader(): string {
  return `<tr><td style="background:${BRAND_DARK};padding:24px 32px;">
    <p style="margin:0;font-family:${BRAND_FONT};font-size:28px;font-weight:400;color:#ffffff;letter-spacing:-0.5px;line-height:1;">howdoyoudo<span style="color:${BRAND_GREEN};">?</span></p>
  </td></tr>`;
}

/** Dark footer row */
export function emailFooter(extra?: string): string {
  return `<tr><td style="background:${BRAND_DARK};padding:20px 32px;border-top:3px solid ${BRAND_GREEN};">
    <p style="margin:0 0 4px 0;font-family:${BRAND_FONT};font-size:18px;font-weight:400;color:#ffffff;">howdoyoudo<span style="color:${BRAND_GREEN};">?</span></p>
    <p style="margin:0;font-size:12px;color:#999;font-family:${BRAND_BODY_FONT};"><a href="${SITE_URL}" style="color:${BRAND_GREEN};text-decoration:none;">www.howdoyoudo.co.uk</a>${extra ? " · " + extra : ""}</p>
  </td></tr>`;
}

/**
 * Full branded email wrapper.
 * Pass title, body HTML, a CTA button, and optional footer note.
 */
export function brandedEmail({
  title,
  body,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  title: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  ${EMAIL_HEAD_FONTS}
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:${BRAND_BODY_FONT};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;">
  <tr><td align="center" style="padding:32px 16px 40px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid ${BRAND_DARK};">
      ${emailHeader()}
      <tr><td style="padding:36px 32px 0 32px;">
        <h1 style="margin:0 0 20px 0;font-size:26px;font-weight:800;color:${BRAND_DARK};line-height:1.1;font-family:${BRAND_FONT};">${title}</h1>
        ${body}
        <p style="margin:0 0 32px 0;">
          <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_DARK};color:#ffffff;text-decoration:none;padding:14px 28px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-family:${BRAND_BODY_FONT};">${ctaText}</a>
        </p>
        ${footerNote ? `<p style="margin:0 0 8px 0;font-size:13px;color:#999;line-height:1.6;font-family:${BRAND_BODY_FONT};">${footerNote}</p>` : ""}
      </td></tr>
      ${emailFooter()}
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
