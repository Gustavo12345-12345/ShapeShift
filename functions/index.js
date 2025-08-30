// Importa os módulos necessários
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Importa e configura o CORS
const stripe = require("stripe")("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");

// Inicializa o Firebase Admin
admin.initializeApp();

/**
 * Função que cria a sessão de pagamento (agora com CORS)
 */
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  // Envolve a função com o handler do CORS para dar a permissão
  cors(req, res, async () => {
    // Apenas o método POST é permitido
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // O token de autenticação do usuário vem no cabeçalho (header)
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(403).send("Unauthorized");
    }

    try {
      // Verifica se o token do usuário é válido
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const { priceId } = req.body.data;
      const projectUrl = `https://${process.env.GCLOUD_PROJECT}.web.app`;

      // Cria a sessão na Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { firebaseUID: userId },
        success_url: `${projectUrl}/minha-rotina.html?payment_success=true`,
        cancel_url: `${projectUrl}/planos.html?payment_cancel=true`,
      });
      
      // Envia a resposta de sucesso
      return res.status(200).send({ data: { id: session.id } });

    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      return res.status(500).send({ error: "Erro ao comunicar com a Stripe." });
    }
  });
});

