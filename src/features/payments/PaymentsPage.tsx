import { getStoredCards, StoredCard } from '@/api/payments/stripe';
import { UserContext } from '@/common/contexts/UserContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useContext, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCardForm from './components/AddCardForm';
import CurrentPaymentMethod from './components/CurrentPaymentMethod';
import SavedCards from './components/SavedCards';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

export default function PaymentsPage() {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [cards, setCards] = useState<StoredCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const loadCards = async () => {
    if (!user) return;

    setIsLoadingCards(true);
    try {
      const storedCards = await getStoredCards(user.id);
      setCards(storedCards);
    } catch (error: any) {
      console.error('Error loading cards:', error);
      toast.error(error.message || 'Failed to load saved cards');
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCards();
    }
  }, [user]);

  const handleCardAdded = () => {
    loadCards(); // Refresh the cards list
  };

  const handleCardDeleted = () => {
    loadCards(); // Refresh the cards list
  };

  const handleCardUpdated = () => {
    loadCards(); // Refresh the cards list when default is changed
  };

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-lg text-red-600">Please log in to manage payment methods</div>
        </div>
      </div>
    );
  }

  const hasCards = cards.length > 0;
  // Use the default card as current payment method, fallback to first card
  const currentCard = hasCards ? (cards.find(card => card.isDefault) || cards[0]) : null;
  // Get non-current cards for the additional saved cards section
  const otherCards = currentCard ? cards.filter(card => card.id !== currentCard.id) : [];

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground mt-2">
            Manage your saved payment methods for quick and secure transactions
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {/* Add/Update Card Form */}
          <div>
            <AddCardForm
              onCardAdded={handleCardAdded}
              hasExistingCards={hasCards}
              currentCard={currentCard}
            />
          </div>

          {/* Current Payment Method or Saved Cards */}
          <div>
            {currentCard ? (
              <CurrentPaymentMethod card={currentCard} />
            ) : (
              <SavedCards
                cards={cards}
                customerId={user.id}
                onCardDeleted={handleCardDeleted}
                onCardUpdated={handleCardUpdated}
                isLoading={isLoadingCards}
              />
            )}
          </div>
        </div>

        {/* Show additional saved cards if there are more than one */}
        {otherCards.length > 0 && (
          <div className="mt-8">
            <SavedCards
              cards={otherCards}
              customerId={user.id}
              onCardDeleted={handleCardDeleted}
              onCardUpdated={handleCardUpdated}
              isLoading={false}
            />
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Elements>
  );
} 