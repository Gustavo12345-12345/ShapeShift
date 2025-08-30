// Importa os módulos necessários
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Importa e configura o CORS para permitir pedidos do seu site
const stripe = require("stripe")("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");

// Inicializa o Firebase Admin para aceder à base de dados
admin.initializeApp();
const db = admin.firestore();

/**
 * Função chamada pelo seu site para criar uma sessão de pagamento na Stripe.
 * Ela é protegida por CORS e autenticação do Firebase.
 */
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  // Envolve a função com o handler do CORS para dar permissão ao seu site
  cors(req, res, async () => {
    // Apenas o método POST é permitido para esta função
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // O token de autenticação do usuário é enviado no cabeçalho (header)
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      return res.status(403).send("Unauthorized");
    }

    try {
      // Verifica se o token é válido e obtém os dados do usuário
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const { priceId } = req.body.data; // O ID do preço vem no corpo do pedido
      const projectUrl = `https://${process.env.GCLOUD_PROJECT}.web.app`; // URL base do seu site

      // Cria a sessão de checkout na Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { firebaseUID: userId }, // Guarda o ID do usuário para referência futura
        success_url: `${projectUrl}/minha-rotina.html?payment_success=true`,
        cancel_url: `${projectUrl}/planos.html?payment_cancel=true`,
      });
      
      // Envia de volta o ID da sessão para o site
      return res.status(200).send({ data: { id: session.id } });

    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      return res.status(500).send({ error: "Erro interno ao comunicar com a Stripe." });
    }
  });
});

// A função de webhook foi removida para simplificar a configuração.
// Lembre-se que agora a atualização do plano do usuário para "pro" deverá ser feita manualmente.

