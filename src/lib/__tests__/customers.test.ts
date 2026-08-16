import { describe, expect, it } from "vitest";
import { aggregateCustomers, getMostFrequentCustomer, getTopSpender } from "../customers";
import { makeOrder } from "./testFixtures";

describe("customer grouping using normalized phone numbers", () => {
  it("groups orders with differently formatted phone numbers into one customer", () => {
    const orders = [
      makeOrder({ id: "1", phoneNumber: "+91 98765 43210", totalAmount: 500 }),
      makeOrder({ id: "2", phoneNumber: "09876543210", totalAmount: 300 }),
      makeOrder({ id: "3", phoneNumber: "9876543210", totalAmount: 200 }),
    ];
    const customers = aggregateCustomers(orders);
    expect(customers).toHaveLength(1);
    expect(customers[0].orderCount).toBe(3);
    expect(customers[0].totalSpent).toBe(1000);
  });

  it("keeps different customers separate", () => {
    const orders = [
      makeOrder({ id: "1", phoneNumber: "9876543210" }),
      makeOrder({ id: "2", phoneNumber: "9111111111" }),
    ];
    expect(aggregateCustomers(orders)).toHaveLength(2);
  });
});

describe("highest-spending customer", () => {
  it("returns the customer with the largest total spend", () => {
    const orders = [
      makeOrder({ id: "1", phoneNumber: "9111111111", customerName: "Anita", totalAmount: 300 }),
      makeOrder({ id: "2", phoneNumber: "9222222222", customerName: "Bala", totalAmount: 5000 }),
    ];
    const top = getTopSpender(aggregateCustomers(orders));
    expect(top?.name).toBe("Bala");
  });

  it("returns null when there are no customers", () => {
    expect(getTopSpender([])).toBeNull();
  });
});

describe("most frequent customer", () => {
  it("returns the customer with the most orders, regardless of spend", () => {
    const orders = [
      makeOrder({ id: "1", phoneNumber: "9111111111", customerName: "Anita", totalAmount: 5000 }),
      makeOrder({ id: "2", phoneNumber: "9222222222", customerName: "Bala", totalAmount: 100 }),
      makeOrder({ id: "3", phoneNumber: "9222222222", customerName: "Bala", totalAmount: 100 }),
      makeOrder({ id: "4", phoneNumber: "9222222222", customerName: "Bala", totalAmount: 100 }),
    ];
    const mostFrequent = getMostFrequentCustomer(aggregateCustomers(orders));
    expect(mostFrequent?.name).toBe("Bala");
    expect(mostFrequent?.orderCount).toBe(3);
  });
});
