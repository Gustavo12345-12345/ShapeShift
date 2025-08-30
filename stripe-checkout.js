import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  const subscribeButton = document.getElementById('subscribe-btn');
  if (!subscribeButton) return;
  
  const STRIPE_PUBLIC_KEY = 'pk_live_51RwpGKBEi7pirtkoP1tIbPmKzvRDdMjsCd3zgmCOwsW6a7U4qjOt0QnRdPjGrBehR27xB1dTaLWiIDFDfy6H01ln00HGlz6SdG';
  const PRO_PRICE_ID = 'price_1RzkjRBEi7pirtkoTZpGXD9JIO';

  if (!STRIPE_PUBLIC_KEY.startsWith('pk_') || !PRO_PRICE_ID.startsWith('price_')) {
    console.error("ERRO: As chaves da Stripe ou o ID do Preço não foram definidos no arquivo stripe-checkout.js.");
    subscribeButton.textContent = "Pagamento Indisponível";
    subscribeButton.disabled = true;
    return;
  }
  
  const stripe = Stripe(STRIPE_PUBLIC_KEY);

  subscribeButton.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Você precisa estar logado para assinar um plano.');
      window.location.href = 'login.html';
      return;
    }

    subscribeButton.disabled = true;
    subscribeButton.textContent = 'A redirecionar...';

    try {
      // 1. Obtém o token de autenticação do usuário para provar quem ele é
      const idToken = await user.getIdToken(true);
      
      // 2. Define a URL exata do seu backend
      const functionURL = 'https://us-central1-workoutplaner-3p930e.cloudfunctions.net/createCheckoutSession';

      // 3. Faz uma chamada direta à função usando o método 'fetch'
      const response = await fetch(functionURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`, // Envia o token para autenticação
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { priceId: PRO_PRICE_ID } }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const result = await response.json();
      const sessionId = result.data.id;

      // 4. Redireciona o usuário para a página de pagamento segura da Stripe
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Erro ao iniciar o checkout:', error);
      alert('Ocorreu um erro ao iniciar o pagamento. Tente novamente mais tarde.');
      subscribeButton.disabled = false;
      subscribeButton.textContent = 'Assinar';
    }
  });
});

