"use client";

import { useState, useEffect } from "react";
import {
  PaymentElement,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  contractId: string;
  amount: number;
}

export function CheckoutForm({ contractId, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Fetch the client secret immediately when the component mounts
  useEffect(() => {
    let mounted = true;

    async function fetchClientSecret() {
      try {
        const idempotencyKey = crypto.randomUUID();

        const res = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractId, idempotencyKey }),
        });
        
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || "Failed to initialize payment");
        }

        if (mounted && json.data?.clientSecret) {
          setClientSecret(json.data.clientSecret);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    fetchClientSecret();

    return () => {
      mounted = false;
    };
  }, [contractId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);

    try {
      // 2. Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement("card") as any,
          // You could optionally pass billing_details here
        }
      });

      if (error) {
        // Show error to your customer (e.g., insufficient funds, card declined)
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Success!
        toast.success("Payment successful!");
        router.push(`/dashboard/contracts/${contractId}?paid=true`);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Initializing secure payment...
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
        Failed to initialize payment. Please try refreshing the page.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Payment Details</h3>
        <p className="text-sm text-muted-foreground">
          You are authorizing a payment of <strong>${amount.toFixed(2)}</strong> for this contract.
        </p>
      </div>

      <div className="p-4 border rounded-md bg-background shadow-sm">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#18181b', '::placeholder': { color: '#a1a1aa' } } } }} />
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
      
      <p className="text-xs text-center text-muted-foreground">
        Payments are securely processed by Stripe.
      </p>
    </form>
  );
}
