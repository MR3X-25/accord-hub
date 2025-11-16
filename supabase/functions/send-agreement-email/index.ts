import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAgreementEmailRequest {
  to: string;
  agreementId: string;
  debtorName: string;
  agencyName: string;
  totalAmount: string;
  agreementUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, agreementId, debtorName, agencyName, totalAmount, agreementUrl }: SendAgreementEmailRequest = await req.json();

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "MR3X <onboarding@resend.dev>",
        to: [to],
        subject: `Acordo de Pagamento - ${agreementId}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #ec4899 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #06b6d4; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .highlight { background: #f0f9ff; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MR3X — Acordo de Pagamento</h1>
              <p>Gestão de Pagamentos e Cobranças</p>
            </div>
            <div class="content">
              <h2>Olá, ${debtorName}!</h2>
              <p>A ${agencyName} enviou um acordo de pagamento para sua análise.</p>
              
              <div class="highlight">
                <p><strong>Documento ID:</strong> ${agreementId}</p>
                <p><strong>Valor Total:</strong> R$ ${totalAmount}</p>
              </div>

              <p>Para visualizar os detalhes completos do acordo, escolher a forma de pagamento e assinar digitalmente, clique no botão abaixo:</p>
              
              <center>
                <a href="${agreementUrl}" class="button">Visualizar e Assinar Acordo</a>
              </center>

              <p><strong>Importante:</strong></p>
              <ul>
                <li>Este é um documento oficial com validade jurídica</li>
                <li>Você poderá escolher entre diferentes formas de pagamento</li>
                <li>Após a assinatura, você receberá uma cópia em PDF</li>
                <li>O documento possui hash criptográfico SHA-256 para verificação de autenticidade</li>
              </ul>

              <p>Se você tiver dúvidas, entre em contato com ${agencyName}.</p>
            </div>
            <div class="footer">
              <p>MR3X — Plataforma de Gestão de Pagamentos de Aluguéis</p>
              <p>Este é um e-mail automático, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email enviado com sucesso:", emailData);

    return new Response(JSON.stringify({ success: true, emailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
