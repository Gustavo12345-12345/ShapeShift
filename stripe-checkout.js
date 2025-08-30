// Importa as funções necessárias do Firebase
import { auth } from './firebase-config.js';
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('subscribe-btn');
  if (!subscribeButton) return;

  // Cole aqui a sua chave PUBLICÁVEL da Stripe
  const stripe = Stripe('pk_live_51RwpGKBEi7pirtkoP1tIbPmKzvRDdMjsCd3zgmCOwsW6a7U4qjOt0QnRdPjGrBehR27xB1dTaLWiIDFDfy6H01ln00HGlz6SdG');
  // Cole aqui o ID do PREÇO do seu plano Pro
  const proPriceId = 'price_1RzkjRBEi7pirtkoTZpGXD9J';

  // Adiciona a funcionalidade ao botão
  subscribeButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado para subscrever um plano.');
      window.location.href = 'login.html';
      return;
    }

    subscribeButton.disabled = true;
    subscribeButton.textContent = 'A redirecionar...';

    try {
      // 1. Prepara para chamar a função de backend 'createCheckoutSession'
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      
      // 2. Chama a função de backend, enviando o ID do preço
      const response = await createCheckoutSession({ priceId: proPriceId });
      const sessionId = response.data.id;

      // 3. Redireciona o usuário para a página de pagamento segura da Stripe
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Erro ao iniciar o checkout:', error);
      alert('Ocorreu um erro ao iniciar o pagamento. Tente novamente.');
      subscribeButton.disabled = false;
      subscribeButton.textContent = 'Subscrever';
    }
  });
});

