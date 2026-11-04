import nodemailer from "nodemailer";

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || "node256.iseencloud.net";
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || "orders@amigowebster.in";
  const pass = process.env.SMTP_PASSWORD || "thoranamcpanelmail1";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
  });
}

function getAbsoluteImageUrl(imgUrl) {
  if (!imgUrl) return "https://amigowebster.in/thoranam/images/product-1.jpg";
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
    return imgUrl;
  }
  if (imgUrl.startsWith("/uploads/")) {
    return `https://amigowebster.in/thoranam${imgUrl}`;
  }
  if (imgUrl.startsWith("/")) {
    return `https://amigowebster.in/thoranam${imgUrl}`;
  }
  return `https://amigowebster.in/thoranam/uploads/${imgUrl}`;
}

export async function sendOrderNotificationEmail(order, paymentInfo = {}) {
  try {
    const transporter = getSmtpTransporter();

    const ownerEmail = process.env.OWNER_EMAIL || "thoranamsarees@gmail.com";
    const senderEmail = process.env.SMTP_USER || "orders@amigowebster.in";

    const orderId = order.id || `ORD-${Date.now().toString().slice(-4)}`;
    const customerName = order.customer_name || "Valued Customer";
    const customerEmail = order.customer_email || "Not Provided";
    const customerPhone = order.customer_phone || "Not Provided";
    const shippingAddress = order.shipping_address || "No address provided";
    const totalAmount = order.total_amount || "₹ 0";
    const items = Array.isArray(order.items_details) ? order.items_details : [];

    const paymentId =
      paymentInfo.paymentId ||
      order.payment_id ||
      order.notes?.razorpay_payment_id ||
      "Verified via Razorpay";
    const razorpayOrderId =
      paymentInfo.orderId ||
      order.notes?.razorpay_order_id ||
      "N/A";

    const now = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const itemsRowsHtml = items
      .map((item, index) => {
        const itemImg = getAbsoluteImageUrl(item.image || item.mainImage);
        const itemTitle = item.title || "Traditional Saree";
        const itemQty = item.quantity || 1;
        const itemPrice = typeof item.price === "number" ? `₹ ${item.price.toLocaleString("en-IN")}` : (item.price || "₹ 0");

        return `
          <tr style="border-bottom: 1px solid #f1e4e4;">
            <td style="padding: 12px 8px; width: 64px; text-align: center;">
              <img src="${itemImg}" alt="${itemTitle}" width="54" height="68" style="width: 54px; height: 68px; object-fit: cover; border-radius: 6px; border: 1px solid #e0d0d0; display: block; margin: 0 auto;" />
            </td>
            <td style="padding: 12px 10px; font-size: 14px; color: #222;">
              <strong style="color: #4a070c;">${itemTitle}</strong>
              <div style="font-size: 12px; color: #777; margin-top: 3px;">Item #${index + 1}</div>
            </td>
            <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #333; font-weight: 600;">
              x ${itemQty}
            </td>
            <td style="padding: 12px 10px; text-align: right; font-size: 14px; color: #890e0e; font-weight: bold;">
              ${itemPrice}
            </td>
          </tr>
        `;
      })
      .join("");

    // Owner Notification Template
    const ownerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order #${orderId}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f3f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3f1; padding: 25px 10px;">
          <tr>
            <td align="center">
              <table width="620" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #eee;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #890e0e; padding: 24px 28px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700;">
                      THORANAM
                    </h1>
                    <div style="color: #fce8e8; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">
                      Luxury Saree Boutique
                    </div>
                  </td>
                </tr>

                <!-- Order Success Banner -->
                <tr>
                  <td style="background-color: #fbf5f5; border-bottom: 2px solid #890e0e; padding: 18px 28px;">
                    <div style="font-size: 12px; font-weight: 700; color: #890e0e; text-transform: uppercase; letter-spacing: 1px;">
                      New Order Notification (Paid via Razorpay)
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px;">
                      <span style="font-size: 20px; font-weight: 800; color: #1a1a1a;">
                        Order #${orderId}
                      </span>
                      <span style="font-size: 18px; font-weight: 800; color: #15803d; float: right;">
                        ${totalAmount} Paid
                      </span>
                    </div>
                    <div style="font-size: 12px; color: #777; margin-top: 4px;">
                      Placed on: ${now} IST
                    </div>
                  </td>
                </tr>

                <!-- Content Area -->
                <tr>
                  <td style="padding: 24px 28px;">
                    <!-- Customer Information Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f7; border: 1px solid #ecd8d8; border-radius: 10px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <div style="font-size: 12px; font-weight: 700; color: #890e0e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                            Customer & Delivery Details
                          </div>
                          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; line-height: 1.7; color: #333;">
                            <tr>
                              <td style="width: 120px; color: #888; font-weight: 600;">Customer Name:</td>
                              <td style="font-weight: 700; color: #111;">${customerName}</td>
                            </tr>
                            <tr>
                              <td style="color: #888; font-weight: 600;">Phone Number:</td>
                              <td>
                                <a href="tel:${customerPhone}" style="color: #890e0e; font-weight: 700; text-decoration: none;">
                                  ${customerPhone}
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #888; font-weight: 600;">Email Address:</td>
                              <td>
                                <a href="mailto:${customerEmail}" style="color: #890e0e; text-decoration: none;">
                                  ${customerEmail}
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="color: #888; font-weight: 600; vertical-align: top; padding-top: 4px;">Shipping Address:</td>
                              <td style="color: #222; font-weight: 500; padding-top: 4px;">${shippingAddress}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Payment Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 14px 20px;">
                          <div style="font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
                            Razorpay Payment Verification
                          </div>
                          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 12px; line-height: 1.6; color: #166534;">
                            <tr>
                              <td style="width: 140px; font-weight: 600;">Razorpay Payment ID:</td>
                              <td style="font-family: monospace; font-weight: 700;">${paymentId}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600;">Razorpay Order ID:</td>
                              <td style="font-family: monospace;">${razorpayOrderId}</td>
                            </tr>
                            <tr>
                              <td style="font-weight: 600;">Payment Status:</td>
                              <td><strong style="color: #15803d;">PAID & VERIFIED (Captured)</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Products Table -->
                    <div style="font-size: 14px; font-weight: 700; color: #4a070c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                      Ordered Sarees (${items.length} item${items.length === 1 ? "" : "s"})
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #ecd8d8; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                      <thead style="background-color: #fbf5f5;">
                        <tr style="border-bottom: 1px solid #ecd8d8; font-size: 12px; color: #888; text-transform: uppercase;">
                          <th style="padding: 10px 8px; text-align: center;">Item</th>
                          <th style="padding: 10px; text-align: left;">Product</th>
                          <th style="padding: 10px 8px; text-align: center;">Qty</th>
                          <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRowsHtml || '<tr><td colspan="4" style="padding: 15px; text-align: center; color: #888;">No item details available</td></tr>'}
                      </tbody>
                      <tfoot>
                        <tr style="background-color: #faf7f7; font-size: 14px;">
                          <td colspan="3" style="padding: 14px 16px; font-weight: 700; color: #111; text-align: right;">Total Paid:</td>
                          <td style="padding: 14px 16px; font-weight: 800; color: #890e0e; text-align: right; font-size: 16px;">
                            ${totalAmount}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f7f3f1; padding: 18px 28px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee;">
                    Thoranam Luxury Saree Boutique Automated Order Notification System.<br/>
                    Email sent to: <strong>${ownerEmail}</strong> (Cc: ${senderEmail})
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const ownerMailOptions = {
      from: `"Thoranam Orders" <${senderEmail}>`,
      to: ownerEmail,
      cc: senderEmail,
      replyTo: customerEmail && customerEmail.includes("@") ? customerEmail : senderEmail,
      subject: `🛍️ New Order #${orderId} - ${totalAmount} by ${customerName}`,
      html: ownerHtml,
    };

    console.log(`[Order Email] Sending notification for order #${orderId} to ${ownerEmail} (Cc: ${senderEmail})...`);
    const info = await transporter.sendMail(ownerMailOptions);
    console.log(`[Order Email] Sent successfully! Message ID: ${info.messageId}`);

    // Customer Receipt (if customer provided a valid email)
    if (customerEmail && customerEmail.includes("@") && customerEmail !== ownerEmail) {
      try {
        const customerHtml = `
          <!DOCTYPE html>
          <html>
          <body style="margin: 0; padding: 0; background-color: #f7f3f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f3f1; padding: 25px 10px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #eee;">
                    <tr>
                      <td style="background-color: #890e0e; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px;">THORANAM</h1>
                        <div style="color: #fce8e8; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;">Luxury Saree Boutique</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 28px;">
                        <h2 style="color: #4a070c; margin-top: 0;">Thank You for Your Order, ${customerName}!</h2>
                        <p style="color: #555; line-height: 1.6; font-size: 14px;">
                          We have received your payment of <strong>${totalAmount}</strong> via Razorpay. Your exclusive handpicked sarees are being prepared for dispatch with express insured shipping.
                        </p>
                        <div style="background-color: #fbf5f5; border-left: 4px solid #890e0e; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
                          <div style="font-size: 13px; color: #333;"><strong>Order Number:</strong> #${orderId}</div>
                          <div style="font-size: 13px; color: #333; margin-top: 4px;"><strong>Payment Reference:</strong> ${paymentId}</div>
                          <div style="font-size: 13px; color: #333; margin-top: 4px;"><strong>Shipping to:</strong> ${shippingAddress}</div>
                        </div>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; margin-top: 15px;">
                          <tbody>${itemsRowsHtml}</tbody>
                        </table>
                        <p style="color: #888; font-size: 12px; margin-top: 25px;">
                          If you have any questions or need styling advice, feel free to reply directly to this email or contact us at <a href="mailto:${ownerEmail}" style="color: #890e0e;">${ownerEmail}</a>.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f7f3f1; padding: 14px; text-align: center; font-size: 11px; color: #888;">
                        Thoranam Luxury Saree Boutique &copy; ${new Date().getFullYear()}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: `"Thoranam Luxury Sarees" <${senderEmail}>`,
          to: customerEmail,
          replyTo: ownerEmail,
          subject: `✨ Order Confirmed: #${orderId} - Thoranam Luxury Sarees`,
          html: customerHtml,
        });
        console.log(`[Order Email] Customer confirmation sent to ${customerEmail}`);
      } catch (cErr) {
        console.warn(`[Order Email] Could not send customer confirmation:`, cErr.message);
      }
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Order Email Error]:`, error);
    return { success: false, error: error.message };
  }
}

