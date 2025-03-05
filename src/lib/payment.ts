import { supabase } from "./supabase";

// Types for payment integration
interface PaymentRequest {
  email: string;
  amount: number;
  planName: string;
  durationMonths: number;
  returnUrl: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  message?: string;
}

// AbacatePay integration service
export class AbacatePayService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.ABACATEPAY_API_KEY || "";
    this.apiUrl =
      process.env.ABACATEPAY_API_URL || "https://api.abacatepay.com";
  }

  // Create a payment request
  async createPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      // In a real implementation, you would make an API call to AbacatePay
      // For now, we'll simulate the response

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate a fake payment ID
      const paymentId = `pay_${Math.random().toString(36).substring(2, 15)}`;

      // Create a simulated payment URL
      const paymentUrl = `https://checkout.abacatepay.com/${paymentId}`;

      // In a real implementation, store the payment information in your database
      await this.storePaymentRequest(
        data.email,
        paymentId,
        data.amount,
        data.durationMonths
      );

      return {
        success: true,
        paymentUrl,
        paymentId,
      };
    } catch (error) {
      console.error("Error creating payment:", error);
      return {
        success: false,
        message: "Failed to create payment",
      };
    }
  }

  // Store payment request in database
  private async storePaymentRequest(
    email: string,
    paymentId: string,
    amount: number,
    durationMonths: number
  ): Promise<void> {
    try {
      // Get user ID
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (!user) {
        // Create user if not exists
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            email,
            is_premium: false,
          })
          .select("id")
          .single();

        if (createError || !newUser) {
          throw new Error("Failed to create user");
        }
      }

      // In a real implementation, you would store the payment information
      // in a payments table for later verification
      console.log(`Payment request stored: ${paymentId} for ${email}`);
    } catch (error) {
      console.error("Error storing payment request:", error);
      throw error;
    }
  }

  // Verify and process a payment (called by webhook or after redirect)
  async verifyPayment(paymentId: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the payment with AbacatePay API
      // For now, we'll simulate a successful payment

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real implementation, update the user's premium status based on the payment
      // For this example, we'll just return true
      return true;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  }

  // Update user to premium after successful payment
  async updateUserToPremium(
    email: string,
    durationMonths: number
  ): Promise<boolean> {
    try {
      // Calculate premium expiration date
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + durationMonths);

      // Update user in database
      const { error } = await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_until: premiumUntil.toISOString(),
        })
        .eq("email", email);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error updating user to premium:", error);
      return false;
    }
  }
}

// Create a singleton instance
export const paymentService = new AbacatePayService();
