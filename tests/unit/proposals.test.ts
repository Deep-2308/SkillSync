import { describe, it, expect, vi, beforeEach } from "vitest";
import { PUT } from "@/app/api/proposals/[id]/route";
import { Proposal } from "@/models/Proposal";
import { Project } from "@/models/Project";
import { Contract } from "@/models/Contract";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/api-utils";
import { notify } from "@/lib/notifications";

vi.mock("@/models/Proposal");
vi.mock("@/models/Project");
vi.mock("@/models/Contract");
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

describe("Proposal Acceptance Transition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a contract when a proposal is accepted", async () => {
    (getAuthSession as any).mockResolvedValue({ user: { id: "client123", role: "client" } });

    const mockProposal = {
      _id: "prop123",
      projectId: "proj123",
      freelancerId: { _id: "freelancer123" },
      status: "pending",
      proposedRate: 500,
      timeline: "2 weeks",
      save: vi.fn(),
    };

    const mockProject = {
      _id: "proj123",
      postedBy: "client123",
      status: "open",
      save: vi.fn(),
    };

    (Proposal.findById as any).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockProposal),
    });
    (Project.findById as any).mockResolvedValue(mockProject);
    
    // Mock mongoose transaction
    const mockSession = {
      withTransaction: vi.fn().mockImplementation(async (cb) => {
        await cb();
      }),
      endSession: vi.fn(),
    };
    mongoose.startSession = vi.fn().mockResolvedValue(mockSession) as any;

    (Contract.create as any).mockResolvedValue([{ _id: "contract123" }]);
    (Proposal.updateMany as any).mockResolvedValue({});

    const req = new Request("http://localhost/api/proposals/prop123", {
      method: "PUT",
      body: JSON.stringify({ status: "accepted" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "prop123" }) });
    
    expect(res.status).toBe(200);
    expect(mockProposal.status).toBe("accepted");
    expect(mockProject.status).toBe("in_progress");
    expect(Contract.create).toHaveBeenCalledWith([{
      projectId: "proj123",
      proposalId: "prop123",
      clientId: "client123",
      freelancerId: "freelancer123",
      agreedRate: 500,
      timeline: "2 weeks",
      status: "active",
    }], { session: mockSession });
  });
});
