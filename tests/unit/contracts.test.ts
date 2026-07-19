import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "@/app/api/contracts/[id]/route";
import { Contract } from "@/models/Contract";
import { Transaction } from "@/models/Transaction";
import { getAuthSession } from "@/lib/api-utils";
import { notify } from "@/lib/notifications";

vi.mock("@/models/Contract");
vi.mock("@/models/Transaction");
vi.mock("@/lib/api-utils", () => ({
  getAuthSession: vi.fn(),
  isValidObjectId: vi.fn().mockReturnValue(null),
}));
vi.mock("@/lib/notifications", () => ({
  notify: vi.fn(),
}));
vi.mock("@/lib/mongodb", () => ({
  connectToDatabase: vi.fn(),
}));

describe("Contract State Transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not allow client to deliver a contract", async () => {
    (getAuthSession as any).mockResolvedValue({ user: { id: "client123", role: "client" } });
    
    const mockContract = {
      _id: "contract123",
      clientId: "client123",
      freelancerId: "freelancer123",
      status: "active",
      save: vi.fn(),
    };
    (Contract.findById as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockContract),
    });

    const req = new Request("http://localhost/api/contracts/contract123", {
      method: "PUT",
      body: JSON.stringify({ status: "delivered" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "contract123" }) });
    const json = await res.json();
    
    expect(res.status).toBe(403);
    expect(json.error).toBe("Only the freelancer can mark a contract as delivered.");
  });

  it("should allow client to complete a delivered and paid contract", async () => {
    (getAuthSession as any).mockResolvedValue({ user: { id: "client123", role: "client" } });
    
    const mockContract = {
      _id: "contract123",
      clientId: "client123",
      freelancerId: "freelancer123",
      status: "delivered",
      paymentStatus: "paid",
      agreedRate: 500,
      save: vi.fn(),
    };
    
    (Contract.findById as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockContract),
    });

    (Transaction.findOne as any).mockResolvedValue({
      stripePaymentIntentId: "pi_123",
    });
    (Transaction.create as any).mockResolvedValue({});

    const req = new Request("http://localhost/api/contracts/contract123", {
      method: "PUT",
      body: JSON.stringify({ status: "completed" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "contract123" }) });
    
    expect(res.status).toBe(200);
    expect(mockContract.status).toBe("completed");
    expect(mockContract.save).toHaveBeenCalled();
    expect(Transaction.create).toHaveBeenCalledWith({
      contractId: "contract123",
      clientId: "client123",
      freelancerId: "freelancer123",
      amount: 500,
      type: "release",
      stripePaymentIntentId: "pi_123",
    });
  });
});
