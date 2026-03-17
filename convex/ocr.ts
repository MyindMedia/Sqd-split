import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const processReceipt = action({
  args: {
    eventId: v.id("splitEvents"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Mark as processing
    await ctx.runMutation(api.splitEvents.updateEventOCRStatus, {
      eventId: args.eventId,
      isProcessing: true,
      receiptFileId: args.storageId,
    });

    try {
      // 2. Simulate AI Processing Delay (Magic Feel)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 3. Mock Extraction Logic
      // In a real app, this would use Google Cloud Vision or Gemini and parse the text
      const mockItems = [
        { name: "Calamari Fritti", price: 18.50, quantity: 1 },
        { name: "Margherita Pizza", price: 22.00, quantity: 1 },
        { name: "Truffle Pasta", price: 28.00, quantity: 1 },
        { name: "Draft Beer", price: 9.00, quantity: 2 },
        { name: "Sparkling Water", price: 6.50, quantity: 1 },
      ];

      // 4. Calculate Subtotal
      const subtotal = mockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.08875; // 8.875% tax
      const totalBill = subtotal + taxAmount;

      // 5. Bulk Add Items
      await ctx.runMutation(api.splitEvents.addEventItems, {
        eventId: args.eventId,
        items: mockItems,
      });

      // 6. Update Totals
      await ctx.runMutation(api.splitEvents.updateEventTotals, {
        eventId: args.eventId,
        subtotal,
        taxAmount,
        totalBill,
      });

    } catch (e) {
      console.error("OCR Processing failed:", e);
    } finally {
      // 7. Mark as finished
      await ctx.runMutation(api.splitEvents.updateEventOCRStatus, {
        eventId: args.eventId,
        isProcessing: false,
        receiptFileId: args.storageId,
      });
    }
  },
});
