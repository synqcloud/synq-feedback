import "server-only";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEmailShell({
  siteName,
  siteUrl,
  preheader,
  bodyHtml,
  ctaText,
  ctaUrl,
}: {
  siteName: string;
  siteUrl: string;
  preheader: string;
  bodyHtml: string;
  ctaText: string;
  ctaUrl: string;
}) {
  const iconUrl = `${siteUrl}/synq-icon.png`;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#ececf0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;font-size:1px;color:#ececf0;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ececf0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e6e7e9;">
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;vertical-align:middle;">
                      <img src="${iconUrl}" width="22" height="22" alt="" style="display:block;border-radius:5px;" />
                    </td>
                    <td style="font-size:14px;font-weight:600;color:#1c1d21;vertical-align:middle;">
                      ${escapeHtml(siteName)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 4px 32px;font-size:14px;line-height:1.6;color:#1c1d21;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background-color:#5e6ad2;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;padding:9px 18px;border-radius:6px;">${escapeHtml(ctaText)}</a>
              </td>
            </tr>
          </table>
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
            <tr>
              <td style="padding:16px 8px;font-size:12px;line-height:1.5;color:#9a9ea5;text-align:center;">
                You're receiving this because you're subscribed to updates on ${escapeHtml(siteName)}.
                Don't want emails like this? <a href="${siteUrl}/notifications" style="color:#5e6ad2;text-decoration:underline;">Manage your notification settings</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
