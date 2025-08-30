// Importa os módulos necessários
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: "https://shapeshift.site" }); // Deixando a origem explícita

// Inicializa o Firebase Admin
admin.initializeApp();

// --- Bloco de Inicialização da Stripe com Verificação de Erro ---
let stripe;
let stripeInitializationError = null;

try {
  // 1. Tenta pegar a chave da configuração do Firebase
  const stripeKey = functions.config().stripe.secretkey;

  // 2. Se a chave não existir ou estiver vazia, gera um erro claro.
  if (!stripeKey) {
    throw new Error("A chave secreta 'stripe.secretkey' não foi encontrada na configuração do Firebase. Verifique se você executou o comando 'firebase functions:config:set' e fez o deploy.");
  }

  // 3. Se a chave existir, inicializa a Stripe
  stripe = require("stripe")(stripeKey);
  console.log("SDK da Stripe inicializado com sucesso.");

} catch (error) {
  // 4. Se qualquer coisa der errado aqui, armazena o erro.
  console.error("ERRO CRÍTICO NA INICIALIZAÇÃO DA STRIPE:", error);
  stripeInitializationError = error;
}
// --- Fim do Bloco de Inicialização ---


/**
 * Função que cria a sessão de pagamento (agora mais robusta)
 */
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  // Envolve a função com o handler do CORS para dar a permissão
  cors(req, res, async () => {
    console.log(`Recebida requisição: ${req.method}`);

    // VERIFICAÇÃO INICIAL: Se a Stripe falhou ao iniciar, retorna um erro imediatamente.
    if (stripeInitializationError) {
      console.error("Erro de inicialização da Stripe detectado. Retornando 500.");
      return res.status(500).send({ error: "Falha na configuração do servidor de pagamentos." });
    }

    // O navegador envia um método OPTIONS antes do POST para verificar o CORS.
    // A biblioteca 'cors' já lida com isso, então não precisamos fazer mais nada.
    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    if (req.method !== "POST") {
      console.log("Método não permitido:", req.method);
      return res.status(405).send("Method Not Allowed");
    }

    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) {
      console.warn("Requisição não autorizada: Token de ID ausente.");
      return res.status(403).send("Unauthorized");
    }

    try {
      console.log("Verificando token do Firebase...");
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
      const { priceId } = req.body.data;
      const projectUrl = `https://shapeshift.site`; // URL fixa para mais segurança

      if (!priceId) {
          console.error("Erro: priceId não foi fornecido no corpo da requisição.");
          return res.status(400).send({ error: "priceId é obrigatório." });
      }

      console.log(`Criando sessão para usuário: ${userId} com priceId: ${priceId}`);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { firebaseUID: userId },
        success_url: `${projectUrl}/minha-rotina.html?payment_success=true`,
        cancel_url: `${projectUrl}/planos.html?payment_cancel=true`,
      });
      
      console.log("Sessão da Stripe criada com sucesso:", session.id);
      return res.status(200).send({ data: { id: session.id } });

    } catch (error) {
      console.error("ERRO DURANTE A CRIAÇÃO DA SESSÃO DE CHECKOUT:", error);
      return res.status(500).send({ error: "Erro interno ao comunicar com a Stripe." });
    }
  });
});
